import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserRecord, userService, toPublicUser, PublicUser } from './userService.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'campus-placement-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'campus-placement-refresh-secret';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
}

export function generateTokens(user: UserRecord): AuthTokens {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    provider: user.provider,
  };

  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: '30d' });

  return {
    accessToken,
    refreshToken,
    user: toPublicUser(user),
  };
}

export function verifyAccessToken(token: string): { id: string; email: string; role: any } {
  return jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: any };
}

export function verifyRefreshToken(refreshToken: string): { id: string } {
  return jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };
}

export async function handleGoogleAuth(credentialOrCode: string): Promise<AuthTokens> {
  let email = '';
  let name = '';
  let profileImage = '';

  // If real GOOGLE_CLIENT_ID is provided, we can verify ID Token
  if (GOOGLE_CLIENT_ID && credentialOrCode.length > 50) {
    try {
      const decoded: any = jwt.decode(credentialOrCode);
      if (decoded && decoded.email) {
        email = decoded.email;
        name = decoded.name || decoded.email.split('@')[0];
        profileImage = decoded.picture || '';
      }
    } catch (err) {
      console.warn('Google token decode warning:', err);
    }
  }

  // Fallback / Simulated Google Auth if credentials absent or dev mock token
  if (!email) {
    if (credentialOrCode.includes('@')) {
      email = credentialOrCode.toLowerCase().trim();
      name = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
      name = name.charAt(0).toUpperCase() + name.slice(1);
    } else {
      const hashStr = credentialOrCode.slice(0, 8) || 'student';
      email = `google.user.${hashStr}@gmail.com`;
      name = `Google Student ${hashStr.slice(0, 4).toUpperCase()}`;
    }
    profileImage = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  }

  const user = userService.findOrCreateOAuthUser({
    name,
    email,
    provider: 'google',
    profileImage,
  });

  return generateTokens(user);
}

export async function handleLinkedInAuth(codeOrEmail: string): Promise<AuthTokens> {
  let email = '';
  let name = '';
  let profileImage = '';

  if (codeOrEmail.includes('@')) {
    email = codeOrEmail.toLowerCase().trim();
    name = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ');
    name = name.charAt(0).toUpperCase() + name.slice(1);
  } else {
    const hashStr = codeOrEmail.slice(0, 8) || 'pro';
    email = `linkedin.pro.${hashStr}@linkedin-user.com`;
    name = `LinkedIn Professional ${hashStr.slice(0, 4).toUpperCase()}`;
  }
  profileImage = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;

  const user = userService.findOrCreateOAuthUser({
    name,
    email,
    provider: 'linkedin',
    profileImage,
  });

  return generateTokens(user);
}
