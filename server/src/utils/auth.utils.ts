// ============================================
// Auth Utilities
// ============================================
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';

/**
 * Verifies the Telegram Mini App initData string.
 * Reference: https://core.telegram.org/bots/webapps#validating-data-received-from-the-web-app
 */
export function verifyTelegramInitData(initData: string): { isValid: boolean; user?: any } {
  try {
    // Manually parse raw query string WITHOUT URL-decoding to preserve hash integrity
    const params: Record<string, string> = {};
    const pairs = initData.split('&');
    for (const pair of pairs) {
      const eqIdx = pair.indexOf('=');
      if (eqIdx === -1) continue;
      const key = pair.substring(0, eqIdx);
      const value = pair.substring(eqIdx + 1);
      params[key] = value;
    }

    const hash = params['hash'];
    if (!hash) return { isValid: false };

    // Build data-check-string: keys sorted alphabetically, key=value pairs joined by \n
    const dataCheckArray: string[] = [];
    Object.keys(params)
      .filter(key => key !== 'hash')
      .sort()
      .forEach(key => {
        dataCheckArray.push(`${key}=${params[key]}`);
      });

    const dataCheckString = dataCheckArray.join('\n');

    // HMAC-SHA256 of the BOT_TOKEN with key 'WebAppData'
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(config.bot.token)
      .digest();

    // HMAC-SHA256 of dataCheckString using the derived secret key
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return { isValid: false };
    }

    // Check expiration (auth_date is in seconds)
    const authDate = parseInt(params['auth_date']);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > 86400) {
      return { isValid: false };
    }

    // The user value is URL-encoded JSON, decode it
    let user: any = null;
    if (params['user']) {
      user = JSON.parse(decodeURIComponent(params['user']));
    }

    return { isValid: true, user };
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

/**
 * Generates a short-lived JWT token for WebApp URL (Desktop fallback).
 * Signed by the server so only we can create valid tokens.
 */
export function generateWebAppToken(telegramId: number): string {
  return jwt.sign({ telegramId }, config.jwt.secret, {
    expiresIn: '5m',
  });
}
