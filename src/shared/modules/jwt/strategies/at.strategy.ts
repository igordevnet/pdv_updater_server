import 'dotenv/config';
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

type JwtPayload = {
    sub: string,
    device: string,
    name: string
}

export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {


    public constructor() {
        const atSecret = process.env.AT_KEY;
        if (!atSecret) throw new Error('Invalid AT_KEY env variable');

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: atSecret
        });
    }

    validate(payload: JwtPayload) {
        return payload;
    }
}