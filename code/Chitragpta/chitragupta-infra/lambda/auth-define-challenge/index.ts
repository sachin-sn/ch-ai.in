import type { DefineAuthChallengeTriggerHandler } from 'aws-lambda';

const MAX_ATTEMPTS = 3;

export const handler: DefineAuthChallengeTriggerHandler = async (event) => {
  const session = event.request.session;

  if (session.length === 0) {
    event.response.challengeName = 'CUSTOM_CHALLENGE';
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
    return event;
  }

  const last = session[session.length - 1];
  if (last.challengeName === 'CUSTOM_CHALLENGE' && last.challengeResult === true) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
    return event;
  }

  // Cap attempts so a guessed OTP can't be brute-forced indefinitely.
  if (session.length >= MAX_ATTEMPTS) {
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
    return event;
  }

  event.response.challengeName = 'CUSTOM_CHALLENGE';
  event.response.issueTokens = false;
  event.response.failAuthentication = false;
  return event;
};
