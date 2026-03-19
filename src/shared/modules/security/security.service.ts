import * as bcrypt from 'bcrypt';
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SecurityService {
  constructor(private configService: ConfigService) { }

  public async hashData(data: string): Promise<string> {
    return bcrypt.hash(data, await this.getSaltRounds());
  }

  public async compareData(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  private getSaltRounds(): number {
    const raw = process.env.SALTROUNDS?.trim();
    const value = Number(raw);

    if (!Number.isInteger(value) || value <= 0) {
      throw new Error('Invalid SaltRounds env variable');
    }

    return value;
  }
}