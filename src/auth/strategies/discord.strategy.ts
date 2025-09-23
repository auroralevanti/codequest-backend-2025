import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-discord';
import { envs } from '../../config';

/**
 * Strategy to authenticate users via Discord OAuth2.
 * Scopes requested: identify, email
 */
@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      clientID: envs.discordClientId,
      clientSecret: envs.discordClientSecret,
      callbackURL: envs.discordCallbackUrl,
      scope: ['identify', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function) {
    // Passport expects done(null, profile) on success.
    // We'll keep profile as-is; AuthController will handle user creation or lookup.
    return done(null, { profile, accessToken, refreshToken });
  }
}
