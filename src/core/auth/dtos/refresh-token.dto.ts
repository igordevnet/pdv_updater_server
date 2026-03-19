import { IsString } from "class-validator";

export class RefreshTokenDTO {
    @IsString()
    deviceId: string;

    @IsString()
    refreshToken: string;
}