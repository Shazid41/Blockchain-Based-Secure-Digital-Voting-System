import { updateFirebaseProfile } from './firebaseStore.js';
import { isFirebaseConfigured } from './firebaseClient.js';
import { sha256Hex } from '../utils/blockchain.js';

const VERIFIED_PREFIX = 'secureVotingTwoFactorVerified';

function sessionKey(userId) {
  return `${VERIFIED_PREFIX}:${userId}`;
}

function validPin(pin) {
  return /^\d{6}$/.test(String(pin ?? ''));
}

export function isTwoFactorSessionVerified(userId) {
  if (!userId) return false;
  return sessionStorage.getItem(sessionKey(userId)) === 'true';
}

export function markTwoFactorVerified(userId) {
  if (userId) sessionStorage.setItem(sessionKey(userId), 'true');
  window.dispatchEvent(new Event('secure-voting-2fa-change'));
}

export function clearTwoFactorVerified(userId) {
  if (userId) sessionStorage.removeItem(sessionKey(userId));
  window.dispatchEvent(new Event('secure-voting-2fa-change'));
}

export async function twoFactorHash(userId, pin, salt) {
  return sha256Hex(`${userId}:${pin}:${salt}:secure-voting-2fa`);
}

export async function enableTwoFactor(userId, pin) {
  if (!validPin(pin)) throw new Error('Use a 6 digit 2FA code.');
  if (!isFirebaseConfigured) throw new Error('Live Firebase is required for permanent 2FA.');
  const salt = crypto.randomUUID();
  const pinHash = await twoFactorHash(userId, pin, salt);
  const profile = await updateFirebaseProfile(userId, {
    two_factor_enabled: true,
    two_factor_salt: salt,
    two_factor_pin_hash: pinHash,
  });
  markTwoFactorVerified(userId);
  return profile;
}

export async function disableTwoFactor(userId) {
  if (!isFirebaseConfigured) throw new Error('Live Firebase is required for permanent 2FA.');
  clearTwoFactorVerified(userId);
  return updateFirebaseProfile(userId, {
    two_factor_enabled: false,
    two_factor_salt: '',
    two_factor_pin_hash: '',
  });
}

export async function verifyTwoFactorCode(userId, profile, pin) {
  if (!validPin(pin)) throw new Error('Enter the 6 digit 2FA code.');
  if (!profile?.two_factor_enabled) {
    markTwoFactorVerified(userId);
    return true;
  }
  const expectedHash = profile.two_factor_pin_hash;
  const salt = profile.two_factor_salt;
  if (!expectedHash || !salt) throw new Error('2FA is enabled but setup is incomplete. Disable and enable it again from profile.');
  const actualHash = await twoFactorHash(userId, pin, salt);
  if (actualHash !== expectedHash) throw new Error('Invalid 2FA code.');
  markTwoFactorVerified(userId);
  return true;
}
