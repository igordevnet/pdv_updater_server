import { ApiProperty } from "@nestjs/swagger";
import { ExeType } from "src/shared/enums/exe.enum";

export class CheckDTO {
        @ApiProperty({ example: '3.0.0.56', description: 'The target version' })
        version: string;

        @ApiProperty({ example: 'True', description: 'Tells the client if it should force update' })
        force?: Boolean;

        @ApiProperty({ example: '35109230000178', description: 'The CNPJ of the user' })
        cnpj?: string;

        @ApiProperty({ example: 'PDV', description: 'The type of exe' })
        exeType?: ExeType;
}