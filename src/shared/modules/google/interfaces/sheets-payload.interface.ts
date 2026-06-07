import { ExeType } from "src/shared/enums/exe.enum";

export interface SheetsPayload {
    name: string;
    cnpj: string;
    deviceName: string;
    version: string;
    exeType: ExeType;
}