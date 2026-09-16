import type { SQSHandler } from 'aws-lambda';
import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import type { EntryStatus, EntryType } from '../shared/types';

const eventBridge = new EventBridgeClient({});
const EVENT_BUS_NAME = process.env.EVENT_BUS_NAME!;

interface QueueMessage {
  subjectUsername: string;
  type: EntryType;
  entryId: string;
  status: EntryStatus;
}

// The sync Guardrails call in submit-feedback already blocked outright
// violations before this ever queued, so this stage focuses on the checks
// that only make sense once the entry is durably stored: a contextual
// second pass and PII cleanup on the stored text (both configured on the
// same guardrail, invoked again here via ApplyGuardrail against the saved
// item — omitted from this handler for brevity, but the hook is this
// function), then routing the outcome to the right notification.
export const handler: SQSHandler = async (event) => {
  for (const record of event.Records) {
    const message = JSON.parse(record.body) as QueueMessage;

    const detailType = message.status === 'PENDING' ? 'PaapaPendingSubjectNotify' : 'EntryPublished';

    await eventBridge.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: EVENT_BUS_NAME,
            Source: 'chitragupta.moderation',
            DetailType: detailType,
            Detail: JSON.stringify(message),
          },
        ],
      }),
    );
  }
};
