import { ExeType } from "src/shared/enums/exe.enum"

export interface JwtPayload {
    userId: string;
    name: string;
    deviceId: string;
    cnpj: string;
    exeType: ExeType;
}