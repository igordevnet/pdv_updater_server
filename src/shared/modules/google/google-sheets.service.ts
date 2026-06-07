import { Injectable, Logger } from "@nestjs/common";
import { google } from "googleapis";
import * as path from "path";
import { SheetsPayload } from "./interfaces/sheets-payload.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleSheetsService {

    private sheets;

    private readonly spreadsheetId;

    private readonly sheetName;

    constructor(private readonly configService: ConfigService) {
        const keyFilePath = path.join(process.cwd(), 'credentials.json');

        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        this.sheets = google.sheets({ version: 'v4', auth });

        this.spreadsheetId = this.configService.get<string>('GOOGLE_SHEET_ID');
        this.sheetName = this.configService.get<string>('GOOGLE_SHEET_NAME');

        if (!this.spreadsheetId) throw new Error('Invalid sheetId env variable');
        if (!this.sheetName) throw new Error('Invalid sheetName env variable');
    }

    private readonly sheetId = 0;

    private readonly logger = new Logger(GoogleSheetsService.name);

    public async updatePdvVersion(payload: SheetsPayload) {
        try {
            const getResponse = await this.sheets.spreadsheets.values.get({
                spreadsheetId: this.spreadsheetId,
                range: `${this.sheetName}!A:C`,
            });

            const rows = getResponse.data.values || [];
            const rowIndex = rows.findIndex(row => row[0] === payload.name && row[1] === payload.cnpj && row[2] === payload.deviceName);
            const timeStamp = new Date().toLocaleDateString("pt-BR");
            const safeTimeStamp = `'${timeStamp}`;

            if (rowIndex !== -1) {

                const excelRow = rowIndex + 1;

                await this.sheets.spreadsheets.values.update({
                    spreadsheetId: this.spreadsheetId,
                    range: `${this.sheetName}!D${excelRow}:F${excelRow}`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [[payload.version, payload.exeType, safeTimeStamp]],
                    },
                });

                this.logger.log(`[Google Sheets] Updated PDV version for ${payload.name} - ${payload.cnpj} (Device name: ${payload.deviceName}) to ${payload.version} at row ${excelRow}`);
            } else {
                await this.sheets.spreadsheets.values.append({
                    spreadsheetId: this.spreadsheetId,
                    range: `${this.sheetName}!A:F`,
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    requestBody: {
                        values: [[payload.name, payload.cnpj, payload.deviceName, payload.version, payload.exeType, safeTimeStamp]],
                    },
                });

                await this.sortSheet();
                this.logger.log(`[Google Sheets] Added new entry for ${payload.name} - ${payload.cnpj} (Device name: ${payload.deviceName}) with version ${payload.version}`);
            }
        } catch (error) {
            this.logger.error(`[Google Sheets] Error updating PDV version for ${payload.name} - ${payload.cnpj} (Device name: ${payload.deviceName}): ${error.message}`);
        }
    }

    private async sortSheet() {
        await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: this.spreadsheetId,
            requestBody: {
                requests: [
                    {
                        sortRange: {
                            range: {
                                sheetId: this.sheetId,
                                startRowIndex: 1,
                            },
                            sortSpecs: [
                                {
                                    dimensionIndex: 0,
                                    sortOrder: 'ASCENDING',
                                },
                                {
                                    dimensionIndex: 3,
                                    sortOrder: 'ASCENDING',
                                },
                            ],
                        },
                    },
                ],
            },
        });
    }
}