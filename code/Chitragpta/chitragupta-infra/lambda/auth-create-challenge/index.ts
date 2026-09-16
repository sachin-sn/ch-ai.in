import type { CreateAuthChallengeTriggerHandler } from 'aws-lambda';
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { createHash, randomInt } from 'crypto';

const ses = new SESv2Client({});
const OTP_TTL_MS = 5 * 60 * 1000;
const FROM_ADDRESS = process.env.OTP_FROM_ADDRESS ?? 'no-reply@chitragupta.ai';

export function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  // A retry within the same session (wrong code, tries again): reuse the
  // original code's hash/expiry rather than minting a new one and sending
  // a second email.
  if (event.request.session.length > 0) {
    const prev = event.request.session[event.request.session.length - 1];
    event.response.privateChallengeParameters = prev.challengeMetadata
      ? JSON.parse(prev.challengeMetadata)
      : {};
    event.response.publicChallengeParameters = { email: event.request.userAttributes.email };
    return event;
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
  const expiresAt = Date.now() + OTP_TTL_MS;

  await ses.send(
    new SendEmailCommand({
      FromEmailAddress: FROM_ADDRESS,
      Destination: { ToAddresses: [event.request.userAttributes.email] },
      Content: {
        Simple: {
          Subject: { Data: 'Your Chitragupta sign-in code' },
          Body: { Text: { Data: `Your code is ${code}. It expires in 5 minutes.` } },
        },
      },
    }),
  );

  // Never send the plaintext code back in the response — only its hash and
  // expiry, which verify-challenge compares against what the user types.
  const params = { hashedCode: hashCode(code), expiresAt: String(expiresAt) };
  event.response.privateChallengeParameters = params;
  event.response.publicChallengeParameters = { email: event.request.userAttributes.email };
  event.response.challengeMetadata = JSON.stringify(params);
  return event;
};
