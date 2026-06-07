import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { IsCNPJ } from "src/shared/decorators/validators/cnpj.validator";

export class SaveUpdateDTO {
    @ApiProperty({ example: 'user_id', description: 'The ID of the user' })
    @IsString()
    userId: string;

    @ApiProperty({ example: 'MAC-A1-B2-C3-D4', description: 'The unique ID of the device' })
    @IsString()
    deviceId: string;

    @ApiProperty({ example: 'name_of_the_company', description: 'The name of the user' })
    @IsString()
    name: string;

    @ApiProperty({ example: '35109230000178', description: 'The CNPJ of the user' })
    @IsCNPJ()
    cnpj: string;

    @ApiProperty({ example: '3.0.0.52', description: 'The current version of the file on the machine' })
    @IsString()
    version: string;
}