import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/core/auth/interfaces/jwt-payload.inteface';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    const atSecret = this.configService.get<string>('AT_KEY');

    if (!atSecret) {
      throw new Error('Invalid atSecret env variable');
    }

    return this.jwtService.signAsync(
      {
        sub: payload.userId,
        device: payload.deviceId,
        name: payload.name,
      },
      {
        expiresIn: 60 * 15,
        secret: atSecret,
      },
    );
  }

  async generateRefreshToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }
}