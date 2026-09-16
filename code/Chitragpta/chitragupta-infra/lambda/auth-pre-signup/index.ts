import type { PreSignUpTriggerHandler } from 'aws-lambda';

const MIN_AGE_YEARS = 18;

// Pure and easy to unit test in isolation from the Cognito event shape.
export function hasMinimumAge(birthdateIso: string, minYears: number, now: Date = new Date()): boolean {
  const dob = new Date(birthdateIso);
  if (Number.isNaN(dob.getTime())) return false;

  const cutoff = new Date(dob);
  cutoff.setFullYear(cutoff.getFullYear() + minYears);
  return cutoff.getTime() <= now.getTime();
}

export const handler: PreSignUpTriggerHandler = async (event) => {
  const birthdate = event.request.userAttributes['birthdate'];

  if (!birthdate || !hasMinimumAge(birthdate, MIN_AGE_YEARS)) {
    throw new Error('Registration requires a minimum age of 18.');
  }

  // Our own OTP challenge at login IS the verification step, so we don't
  // need Cognito's separate confirmation-code flow on top of it.
  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;
  return event;
};
