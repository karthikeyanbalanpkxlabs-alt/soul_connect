import {createPkcePair} from '../src/services/pkce';
import {isFreePrice} from '../src/services/api';
import {registrationSchema} from '../src/services/registration';

test('pkce challenge is url-safe', () => {
  const {verifier, challenge} = createPkcePair();
  expect(verifier.length).toBeGreaterThan(20);
  expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
});

test('free plan prices are recognized', () => {
  expect(isFreePrice('₹0')).toBe(true);
  expect(isFreePrice('₹2,499')).toBe(false);
});

test('registration rejects underage dates of birth', async () => {
  await expect(
    registrationSchema.validateAt('dob', {dob: '2015-01-01'}),
  ).rejects.toThrow(/18/);
});
