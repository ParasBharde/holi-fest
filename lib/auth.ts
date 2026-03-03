import jwt from 'jsonwebtoken';

const SESSION_COOKIE = 'holi_admin_session';

export const authConfig = {
  cookieName: SESSION_COOKIE,
  maxAgeSeconds: 60 * 60 * 8
};

function getJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    throw new Error('ADMIN_JWT_SECRET is required');
  }
  return secret;
}

export function signAdminSession(payload: { role: 'admin'; username: string }) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: authConfig.maxAgeSeconds });
}

export function verifyAdminSession(token: string) {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === 'string' || (decoded as { role?: string }).role !== 'admin') return null;
    return decoded as { role: 'admin'; username: string };
  } catch {
    return null;
  }
}

export function validateAdminCredentials(username: string, password: string) {
  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'Password@12345';
  return username === adminUser && password === adminPass;
}
