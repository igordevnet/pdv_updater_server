import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { ExeType } from "src/shared/enums/exe.enum";

export class RefreshTokenDTO {

    @ApiProperty({ example: 'MAC-A1-B2-C3-D4', description: 'The unique ID of the device' })
    @IsString()
    deviceId: string;

    @ApiProperty({ example: 'refresh_token', description: 'The refresh token' })
    @IsString()
    refreshToken: string;

    @ApiProperty({ example: 'PDV', description: 'The type of exe' })
    @IsEnum(ExeType)
    exeType: ExeType
}