import { Test, TestingModule } from "@nestjs/testing";
import { GoogleSheetsService } from "./google-sheets.service";
import { ConfigService } from "@nestjs/config";
import { SheetsPayload } from "./interfaces/sheets-payload.interface"; 

describe('GoogleSheetsService', () => {
    let service: GoogleSheetsService;

    const mockSheetsApi = {
        spreadsheets: {
            values: {
                update: jest.fn(),
                append: jest.fn(),
                get: jest.fn(),
            },
            batchUpdate: jest.fn(),
        },
    };

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'GOOGLE_SHEET_ID') return 'test_spreadsheet_id';
            if (key === 'GOOGLE_SHEET_NAME') return 'test_sheet_name';
            return null;
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GoogleSheetsService,
                { provide: ConfigService, useValue: mockConfigService },
            ],
        }).compile();

        service = module.get<GoogleSheetsService>(GoogleSheetsService);
        service['sheets'] = mockSheetsApi as any; 
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('updatePdvVersion', () => {
        it('should update PDV version successfully if it already exists', async () => {
            const payload: SheetsPayload = { name: 'test_name', deviceId: 'test_device_id', version: '1.0.0' };

            mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
                data: {
                    values: [
                        ['Loja', 'Caixa'],
                        ['test_name', 'test_device_id']
                    ],
                },
            });

            await service.updatePdvVersion(payload);

            expect(mockSheetsApi.spreadsheets.values.get).toHaveBeenCalledWith({
                spreadsheetId: 'test_spreadsheet_id',
                range: `test_sheet_name!A:B`,
            });
            
            expect(mockSheetsApi.spreadsheets.values.update).toHaveBeenCalledWith({
                spreadsheetId: 'test_spreadsheet_id',
                range: `test_sheet_name!C2:D2`,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values: [[payload.version, expect.any(String)]],
                },
            });
        });

        it('should add new entry and sort if PDV version does not exist', async () => {
            const payload: SheetsPayload = { name: 'new_name', deviceId: 'new_device_id', version: '1.0.0' };

            mockSheetsApi.spreadsheets.values.get.mockResolvedValue({
                data: { values: [] } 
            });

            await service.updatePdvVersion(payload);

            expect(mockSheetsApi.spreadsheets.values.append).toHaveBeenCalledWith({
                spreadsheetId: 'test_spreadsheet_id',
                range: `test_sheet_name!A:D`,
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                requestBody: {
                    values: [[payload.name, payload.deviceId, payload.version, expect.any(String)]],
                },
            });

            expect(mockSheetsApi.spreadsheets.batchUpdate).toHaveBeenCalled();
        });
        
        it('should log error if the Google API fails', async () => {
            const payload: SheetsPayload = { name: 'test_name', deviceId: 'test_device_id', version: '1.0.0' };
            const errorMessage = 'API error';

            mockSheetsApi.spreadsheets.values.get.mockRejectedValue(new Error(errorMessage));

            const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();

            await service.updatePdvVersion(payload);

            expect(loggerSpy).toHaveBeenCalledWith(
                expect.stringContaining(`[Google Sheets] Error updating PDV version for ${payload.name} (Device ID: ${payload.deviceId}): ${errorMessage}`)
            );
        });
    });

    describe('sortSheet', () => {
        it('should call batchUpdate with correct sorting parameters', async () => {
            await service['sortSheet']();

            expect(mockSheetsApi.spreadsheets.batchUpdate).toHaveBeenCalledWith({
                spreadsheetId: 'test_spreadsheet_id',
                requestBody: { 
                    requests: [
                        {
                            sortRange: {
                                range: {
                                    sheetId: 0,
                                    startRowIndex: 1,
                                },
                                sortSpecs: [
                                    { dimensionIndex: 0, sortOrder: 'ASCENDING' },
                                    { dimensionIndex: 1, sortOrder: 'ASCENDING' },
                                ],
                            },
                        },
                    ],
                },
            });
        });
    });
});
