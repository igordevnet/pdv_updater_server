import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import winVersionInfo from 'win-version-info';
import { PassThrough } from 'stream';

import { UpdateService } from './update.service';
import { UpdateRepository } from './repositories/update.repository';
import { GoogleSheetsService } from '../../shared/modules/google/google-sheets.service';
import { DownloadFileDTO } from './dtos/download-file.dto';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createReadStream: jest.fn(),
}));

jest.mock('win-version-info', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe('UpdateService', () => {
  let service: UpdateService;
  let mockUpdateRepository: any;
  let mockGoogleSheetsService: any;

  const mockFilePath = join(process.cwd(), 'files', 'PdvFX.exe');
  const mockVersion = '1.0.0.123';

  beforeEach(async () => {
    mockUpdateRepository = {
      getInstanceByDevice: jest.fn(),
      createInstance: jest.fn(),
      updateInstance: jest.fn(),
    };

    mockGoogleSheetsService = {
      updatePdvVersion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateService,
        { provide: UpdateRepository, useValue: mockUpdateRepository },
        { provide: GoogleSheetsService, useValue: mockGoogleSheetsService },
      ],
    }).compile();

    service = module.get<UpdateService>(UpdateService);

    jest.clearAllMocks();

    (winVersionInfo as jest.Mock).mockReturnValue({ FileVersion: mockVersion });
  });

  describe('getLastestVersionFile', () => {
    it('should return the correct file version', () => {
      const version = service.getLastestVersionFile();

      expect(winVersionInfo).toHaveBeenCalledWith(mockFilePath);
      expect(version).toBe(mockVersion);
    });
  });

  describe('getLastestFile', () => {
    const mockDto = {
      userId: 'user-123',
      deviceId: 'device-456',
      name: 'Cashier 01',
    } as DownloadFileDTO;
    
    const mockDeviceName = 'DESKTOP-TEST';
    let mockStream: PassThrough;

    beforeEach(() => {
      mockStream = new PassThrough();
      (createReadStream as jest.Mock).mockReturnValue(mockStream as any);
    });

    it('should return a StreamableFile and CREATE a new instance if the device does not exist', async () => {
      mockUpdateRepository.getInstanceByDevice.mockReturnValue(null);

      const result = await service.getLastestFile(mockDto, mockDeviceName);

      expect(createReadStream).toHaveBeenCalledWith(mockFilePath);
      expect(result).toBeInstanceOf(StreamableFile);

      expect(mockUpdateRepository.getInstanceByDevice).toHaveBeenCalledWith(mockDto.deviceId);
      expect(mockUpdateRepository.createInstance).toHaveBeenCalledWith({
        userId: mockDto.userId,
        deviceId: mockDto.deviceId,
        exeVersion: mockVersion,
      });
      expect(mockUpdateRepository.updateInstance).not.toHaveBeenCalled();

      expect(mockGoogleSheetsService.updatePdvVersion).toHaveBeenCalledWith({
        name: mockDto.name,
        deviceName: mockDeviceName,
        version: mockVersion,
      });
    });

    it('should return a StreamableFile and UPDATE the instance if the device already exists', async () => {
      mockUpdateRepository.getInstanceByDevice.mockReturnValue({ id: 1, deviceId: mockDto.deviceId });

      await service.getLastestFile(mockDto, mockDeviceName);

      expect(mockUpdateRepository.getInstanceByDevice).toHaveBeenCalledWith(mockDto.deviceId);
      expect(mockUpdateRepository.updateInstance).toHaveBeenCalledWith({
        userId: mockDto.userId,
        deviceId: mockDto.deviceId,
        exeVersion: mockVersion,
      });
      expect(mockUpdateRepository.createInstance).not.toHaveBeenCalled();
    });
  });
});