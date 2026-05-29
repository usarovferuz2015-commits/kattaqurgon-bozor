// ============================================
// Auth Utilities
// ============================================
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import qs from 'qs';

/**
 * Verifies the Telegram Mini App initData string.
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-from-the-web-app
 */
export function verifyTelegramInitData(initData: string): { isValid: boolean; user?: any } {
  try {
    const params = qs.parse(initData);
    const hash = params.hash as string;
    
    if (!hash) return { isValid: false };

    // 1. Collect all parameters except 'hash'
    const dataCheckArray: string[] = [];
    Object.keys(params)
      .filter(key => key !== 'hash')
      .sort()
      .forEach(key => {
        dataCheckArray.push(`${key}=${params[key]}`);
      });

    const dataCheckString = dataCheckArray.join('\\n');

    // 2. Calculate HMAC-SHA256 of the BOT_TOKEN
    const secretKey = crypto
      .createHmac('sha256', config.bot.token)
      .update('WebAppData')
      .digest();

    // 3. Calculate HMAC-SHA256 of dataCheckString using the secretKey
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return { isValid: false };
    }

    // 4. Check for data expiration (auth_date)
    const authDate = parseInt(params.auth_date as string);
    const now = Math.floor(Date.now() / 1000);
    
    // Expire if data is older than 24 hours
    if (now - authDate > 86400) {
      return { isValid: false };
    }

    return { 
      isValid: true, 
      user: params.user ? JSON.parse(params.user as string) : null 
    };
  } catch (error) {
    console.error('InitData verification error:', error);
    return { isValid: false };
  }
}

/**
 * Generates a secure JWT token for the user.
 */
export function generateToken(payload: any): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: '7d',
  });
}

/**
 * Verifies the JWT token.
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
}
