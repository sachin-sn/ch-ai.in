import { extractSubjectUsername } from '../lambda/fold-summary/index';

describe('extractSubjectUsername', () => {
  test('strips the USER# prefix from a partition key', () => {
    expect(extractSubjectUsername('USER#alice')).toBe('alice');
  });

  test('leaves a key with no prefix unchanged', () => {
    expect(extractSubjectUsername('alice')).toBe('alice');
  });

  test('only strips a leading prefix, not one that appears mid-string', () => {
    expect(extractSubjectUsername('USER#USER#weird')).toBe('USER#weird');
  });
});
