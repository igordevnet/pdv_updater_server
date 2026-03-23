import { IsString } from "class-validator";

export class testDTO {
    @IsString()
    name: string;
    @IsString()
    deviceId: string;
    @IsString()
    version: string;
}