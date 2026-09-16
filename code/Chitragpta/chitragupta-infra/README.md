# Chitragupta.ai — infrastructure

CDK (TypeScript) app implementing the backend from the design discussion, with
the consent/moderation/data-model fixes built in rather than bolted on.

## Stacks

- **ChitraguptaData** — the single DynamoDB table (`PK`/`SK`, two GSIs) and its
  customer-managed KMS key. One item per ledger entry, never an embedded array
  — see `lib/data-stack.ts` for why.
- **ChitraguptaAuth** — Cognito User Pool with a custom passwordless email-OTP
  challenge (three Lambda triggers), an 18+ age gate in `preSignUp`, and
  `postConfirmation` creating the profile item with `ledgerEnabled: false`
  (opt-in by default).
- **ChitraguptaModeration** — the Bedrock Guardrail, SQS submission queue
  (+ DLQ), EventBridge bus, and the three async Lambdas: `fold-summary`
  (DynamoDB Streams — folds each newly-ACTIVE entry into the rolling summary),
  `publish-pending-entries` (15-minute schedule — resolves the 72h paapa
  window), and `notify` (SES emails).
- **ChitraguptaApi** — HTTP API (API Gateway v2) with a Cognito JWT authorizer
  on the routes that need sign-in, wired to `submit-feedback`, `get-profile`,
  `search-username`, `toggle-ledger`, and `report-entry`.
- **ChitraguptaFrontend** — S3 + CloudFront for the React SPA build output.

## What's fully implemented vs. a starting point

Fully implemented, with tests: request validation, the paapa one-active-entry
rate limit (atomic conditional write), the OTP hash/expiry/constant-time-check
flow, the age gate, the DynamoDB schema and stream wiring, and the summary
fold logic.

Sketched but not gold-plated, on purpose — these are real, callable, and
correct for the happy path, but are where you'll want to add more before
production traffic:

- `moderate-feedback` notes where a second contextual Guardrails pass would
  go; it currently just routes to notification.
- `notify` sends plain-text emails; swap in real templates.
- The report-entry -> moderator action loop stops at "flag it" — there's no
  moderator console here, just the data model to build one against
  (`reportedBy` on the ledger item, `status` transitions to
  `REMOVED_POLICY` / `REMOVED_LEGAL`).
- `bedrock.CfnGuardrail`'s exact property shape moves between CDK releases —
  verify `contentPolicyConfig` / `sensitiveInformationPolicyConfig` against
  the installed `aws-cdk-lib` version before deploying.
- CORS is wide open (`allowOrigins: ['*']`) — tighten to the real frontend
  origin before launch.

## Commands

```bash
npm install
npm run build   # tsc --noEmit
npm test        # jest
npm run synth   # cdk synth — no AWS credentials required
npm run deploy  # cdk deploy --all — requires bootstrapped AWS credentials
```
