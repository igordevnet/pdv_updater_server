import { ExeType } from "../enums/exe.enum";

export interface ForceData {
    force: boolean;
    exeType: ExeType;
    cnpj: string;
    version: string;
}