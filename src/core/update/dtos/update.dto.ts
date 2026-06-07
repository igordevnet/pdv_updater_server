import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { ExeType } from "src/shared/enums/exe.enum";

export class UpdateDTO {
    @ApiProperty({ example: 'user_id', description: 'The ID of the user' })
    @IsString()
    userId: string;

    @ApiProperty({ example: 'MAC-A1-B2-C3-D4', description: 'The unique ID of the device' })
    @IsString()
    deviceId: string;

    @ApiProperty({ example: '3.0.0.56', description: 'The executable version' })
    @IsString()
    exeVersion: string;

    @ApiProperty({ example: 'PDV', description: 'The type of exe' })
    @IsEnum(ExeType)
    exeType: ExeType
}