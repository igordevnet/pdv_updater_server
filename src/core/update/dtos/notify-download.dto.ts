import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class NotifyDownloadDto {
    @ApiProperty({ example: 'POS01', description: 'The name of the device that downloaded the file' })
    @IsString()
    deviceName: string;

    @ApiProperty({ example: '3.0.0.52', description: 'The current version of the file on the machine' })
    @IsString()
    version: string;
}