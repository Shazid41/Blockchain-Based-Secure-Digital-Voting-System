export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

export function isValidVoterNumber(voterNumber) {
  return /^(\d{10}|\d{16})$/.test(String(voterNumber).trim());
}

export function isStrongPassword(password) {
  return String(password).length >= 8;
}

export function maskEmail(email = '') {
  const [name, domain] = email.split('@');
  if (!name || !domain) return 'your email address';
  return `${name.slice(0, 2)}***@${domain}`;
}
