import { createHash, randomBytes } from 'crypto';
import { v4 as uuid } from 'uuid';
import { dbService } from './dbService.js';

export type UserRole = 'student' | 'admin' | 'tpo';
export type AuthProvider = 'email' | 'google' | 'linkedin';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
  provider: AuthProvider;
  profileImage?: string;
  isEmailVerified: boolean;
  resetToken?: string;
  resetTokenExpires?: number;
  lastLoginAt: number;
  createdAt: number;
}

export type PublicUser = Omit<UserRecord, 'passwordHash' | 'resetToken' | 'resetTokenExpires'>;

export function toPublicUser(user: UserRecord): PublicUser {
  const { passwordHash, resetToken, resetTokenExpires, ...publicData } = user;
  return publicData;
}

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: string): boolean {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(password);
}

class UserService {
  public findByEmail(email: string): UserRecord | undefined {
    return dbService.findUserByEmail(email);
  }

  public findById(id: string): UserRecord | undefined {
    return dbService.findUserById(id);
  }

  public createUser(data: {
    name: string;
    email: string;
    role?: UserRole;
    password?: string;
    provider?: AuthProvider;
    profileImage?: string;
  }): UserRecord {
    const existing = this.findByEmail(data.email);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const newUser: UserRecord = {
      id: uuid(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      role: data.role || 'student',
      passwordHash: data.password ? hashPassword(data.password) : undefined,
      provider: data.provider || 'email',
      profileImage:
        data.profileImage ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      isEmailVerified: data.provider !== 'email', // OAuth emails pre-verified
      lastLoginAt: Date.now(),
      createdAt: Date.now(),
    };

    dbService.saveUser(newUser);
    return newUser;
  }

  public findOrCreateOAuthUser(data: {
    name: string;
    email: string;
    provider: 'google' | 'linkedin';
    profileImage?: string;
  }): UserRecord {
    let user = this.findByEmail(data.email);

    if (user) {
      // Update last login & profile image if changed
      user.lastLoginAt = Date.now();
      if (data.profileImage && !user.profileImage) {
        user.profileImage = data.profileImage;
      }
      dbService.saveUser(user);
    } else {
      user = this.createUser({
        name: data.name,
        email: data.email,
        provider: data.provider,
        profileImage: data.profileImage,
        role: 'student',
      });
    }

    return user;
  }

  public generateResetToken(email: string): string {
    const user = this.findByEmail(email);
    if (!user) {
      throw new Error('No user account found with this email address.');
    }

    const token = randomBytes(32).toString('hex');
    user.resetToken = token;
    user.resetTokenExpires = Date.now() + 3600 * 1000; // 1 hour validity
    dbService.saveUser(user);

    return token;
  }

  public resetPassword(token: string, newPassword: string): UserRecord {
    if (!isValidPassword(newPassword)) {
      throw new Error(
        'Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character.'
      );
    }

    const allUsers = dbService.getUsers();
    const user = allUsers.find(
      (u) => u.resetToken === token && u.resetTokenExpires && u.resetTokenExpires > Date.now()
    );

    if (!user) {
      throw new Error('Invalid or expired password reset token.');
    }

    user.passwordHash = hashPassword(newPassword);
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    user.lastLoginAt = Date.now();
    dbService.saveUser(user);

    return user;
  }
}

export const userService = new UserService();
