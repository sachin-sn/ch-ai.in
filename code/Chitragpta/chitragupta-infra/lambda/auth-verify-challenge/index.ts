import type { VerifyAuthChallengeResponseTriggerHandler } from 'aws-lambda';
import { createHash, timingSafeEqual } from 'crypto';

function hashCode(code: string): string {
  return createHash('sha256').update(code).digest('hex');
}

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  const { hashedCode, expiresAt } = event.request.privateChallengeParameters as {
    hashedCode: string;
    expiresAt: string;
  };

  const submittedHash = hashCode(event.request.challengeAnswer ?? '');
  const submittedBuf = Buffer.from(submittedHash);
  const expectedBuf = Buffer.from(hashedCode ?? '');

  const notExpired = Date.now() <= Number(expiresAt);
  // Constant-time comparison — a code check shouldn't leak timing info about
  // how many leading characters matched.
  const matches =
    submittedBuf.length === expectedBuf.length && timingSafeEqual(submittedBuf, expectedBuf);

  event.response.answerCorrect = notExpired && matches;
  return event;
};
