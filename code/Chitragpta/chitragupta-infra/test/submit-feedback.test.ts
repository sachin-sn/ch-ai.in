import { validateBody } from '../lambda/submit-feedback/index';

describe('validateBody', () => {
  test('accepts a well-formed punya submission', () => {
    const result = validateBody({ subjectUsername: 'alice', type: 'PUNYA', text: 'Helped me move.' });
    expect(result).toEqual({
      ok: true,
      value: { subjectUsername: 'alice', type: 'PUNYA', text: 'Helped me move.' },
    });
  });

  test('trims the subject username', () => {
    const result = validateBody({ subjectUsername: '  alice  ', type: 'PUNYA', text: 'Kind neighbor.' });
    expect(result.ok).toBe(true);
    expect(result.ok && result.value.subjectUsername).toBe('alice');
  });

  test('rejects a missing body', () => {
    expect(validateBody(undefined)).toEqual({ ok: false, error: 'Missing request body' });
  });

  test('rejects a missing subjectUsername', () => {
    const result = validateBody({ type: 'PUNYA', text: 'Helped me move.' });
    expect(result).toEqual({ ok: false, error: 'subjectUsername is required' });
  });

  test('rejects a type outside PUNYA or PAAPA', () => {
    const result = validateBody({ subjectUsername: 'alice', type: 'GOOD', text: 'x' });
    expect(result).toEqual({ ok: false, error: 'type must be PUNYA or PAAPA' });
  });

  test('rejects empty or whitespace-only text', () => {
    const result = validateBody({ subjectUsername: 'alice', type: 'PUNYA', text: '   ' });
    expect(result).toEqual({ ok: false, error: 'text is required' });
  });

  test('rejects text over the 500 character limit', () => {
    const result = validateBody({ subjectUsername: 'alice', type: 'PAAPA', text: 'x'.repeat(501) });
    expect(result).toEqual({ ok: false, error: 'text must be 500 characters or fewer' });
  });

  test('accepts text at exactly the 500 character limit', () => {
    const result = validateBody({ subjectUsername: 'alice', type: 'PAAPA', text: 'x'.repeat(500) });
    expect(result.ok).toBe(true);
  });
});
