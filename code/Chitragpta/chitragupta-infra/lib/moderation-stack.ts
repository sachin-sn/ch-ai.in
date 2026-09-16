import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as lambdaNode from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as bedrock from 'aws-cdk-lib/aws-bedrock';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';

interface ModerationStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  tableKey: kms.Key;
}

export class ModerationStack extends cdk.Stack {
  public readonly submissionQueue: sqs.Queue;
  public readonly guardrailId: string;
  public readonly guardrailArn: string;

  constructor(scope: Construct, id: string, props: ModerationStackProps) {
    super(scope, id, props);

    const dlq = new sqs.Queue(this, 'ModerationDLQ', { retentionPeriod: cdk.Duration.days(14) });
    this.submissionQueue = new sqs.Queue(this, 'SubmissionQueue', {
      visibilityTimeout: cdk.Duration.seconds(30),
      deadLetterQueue: { queue: dlq, maxReceiveCount: 5 },
    });

    // First-pass, synchronous filter (also called directly from
    // submit-feedback via ApplyGuardrail). Catches overt hate/insults/
    // sexual/violent/misconduct content and redacts common PII — it does
    // NOT reliably catch contextual harassment, defamation, or doxxing
    // assembled across multiple entries, which is why the report/appeals
    // flow (report-entry) exists alongside it rather than instead of it.
    const guardrail = new bedrock.CfnGuardrail(this, 'FeedbackGuardrail', {
      name: 'chitragupta-feedback-guardrail',
      blockedInputMessaging: 'This text was flagged by our content check and was not submitted.',
      blockedOutputsMessaging: 'This text was flagged by our content check and was not submitted.',
      contentPolicyConfig: {
        filtersConfig: [
          { type: 'HATE', inputStrength: 'HIGH', outputStrength: 'HIGH' },
          { type: 'INSULTS', inputStrength: 'HIGH', outputStrength: 'HIGH' },
          { type: 'SEXUAL', inputStrength: 'HIGH', outputStrength: 'HIGH' },
          { type: 'VIOLENCE', inputStrength: 'HIGH', outputStrength: 'HIGH' },
          { type: 'MISCONDUCT', inputStrength: 'HIGH', outputStrength: 'HIGH' },
        ],
      },
      sensitiveInformationPolicyConfig: {
        piiEntitiesConfig: [
          { type: 'EMAIL', action: 'ANONYMIZE' },
          { type: 'PHONE', action: 'ANONYMIZE' },
          { type: 'ADDRESS', action: 'ANONYMIZE' },
          { type: 'NAME', action: 'ANONYMIZE' },
        ],
      },
    });
    this.guardrailId = guardrail.attrGuardrailId;
    this.guardrailArn = guardrail.attrGuardrailArn;

    const eventBus = new events.EventBus(this, 'ModerationBus', { eventBusName: 'chitragupta-moderation' });

    const moderateFeedback = new lambdaNode.NodejsFunction(this, 'ModerateFeedback', {
      entry: path.join(__dirname, '../lambda/moderate-feedback/index.ts'),
      runtime: lambda.Runtime.NODEJS_24_X,
      bundling: { minify: true },
      environment: { EVENT_BUS_NAME: eventBus.eventBusName },
    });
    moderateFeedback.addEventSource(new eventsources.SqsEventSource(this.submissionQueue, { batchSize: 5 }));
    eventBus.grantPutEventsTo(moderateFeedback);

    const foldSummary = new lambdaNode.NodejsFunction(this, 'FoldSummary', {
      entry: path.join(__dirname, '../lambda/fold-summary/index.ts'),
      runtime: lambda.Runtime.NODEJS_24_X,
      timeout: cdk.Duration.seconds(30),
      bundling: { minify: true },
      environment: { TABLE_NAME: props.table.tableName },
    });
    foldSummary.addEventSource(
      new eventsources.DynamoEventSource(props.table, {
        startingPosition: lambda.StartingPosition.LATEST,
        batchSize: 10,
        retryAttempts: 3,
      }),
    );
    props.table.grantReadWriteData(foldSummary);
    props.tableKey.grantEncryptDecrypt(foldSummary);
    foldSummary.addToRolePolicy(
      new iam.PolicyStatement({ actions: ['bedrock:InvokeModel', 'bedrock:Converse'], resources: ['*'] }),
    );

    const publishPending = new lambdaNode.NodejsFunction(this, 'PublishPendingEntries', {
      entry: path.join(__dirname, '../lambda/publish-pending-entries/index.ts'),
      runtime: lambda.Runtime.NODEJS_24_X,
      bundling: { minify: true },
      environment: { TABLE_NAME: props.table.tableName },
    });
    props.table.grantReadWriteData(publishPending);
    props.tableKey.grantEncryptDecrypt(publishPending);
    new events.Rule(this, 'PublishPendingSchedule', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(15)),
      targets: [new targets.LambdaFunction(publishPending)],
    });

    const notify = new lambdaNode.NodejsFunction(this, 'Notify', {
      entry: path.join(__dirname, '../lambda/notify/index.ts'),
      runtime: lambda.Runtime.NODEJS_24_X,
      bundling: { minify: true },
      environment: { TABLE_NAME: props.table.tableName },
    });
    props.table.grantReadData(notify);
    props.tableKey.grantDecrypt(notify);
    notify.addToRolePolicy(new iam.PolicyStatement({ actions: ['ses:SendEmail'], resources: ['*'] }));

    new events.Rule(this, 'NotifyRule', {
      eventBus,
      eventPattern: { source: ['chitragupta.moderation'] },
      targets: [new targets.LambdaFunction(notify)],
    });
  }
}
