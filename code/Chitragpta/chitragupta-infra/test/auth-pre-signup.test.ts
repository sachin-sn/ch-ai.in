import { hasMinimumAge } from '../lambda/auth-pre-signup/index';

describe('hasMinimumAge', () => {
  const referenceNow = new Date('2026-08-29T00:00:00Z');

  test('accepts someone who turned 18 yesterday', () => {
    expect(hasMinimumAge('2008-08-28', 18, referenceNow)).toBe(true);
  });

  test('rejects someone who turns 18 tomorrow', () => {
    expect(hasMinimumAge('2008-08-30', 18, referenceNow)).toBe(false);
  });

  test('accepts someone who is exactly 18 today', () => {
    expect(hasMinimumAge('2008-08-29', 18, referenceNow)).toBe(true);
  });

  test('rejects an unparseable birthdate rather than throwing', () => {
    expect(hasMinimumAge('not-a-date', 18, referenceNow)).toBe(false);
  });

  test('rejects a young child', () => {
    expect(hasMinimumAge('2020-01-01', 18, referenceNow)).toBe(false);
  });
});
