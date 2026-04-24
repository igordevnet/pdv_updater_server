import { Test, TestingModule } from '@nestjs/testing';
import { StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import winVersionInfo from 'win-version-info';
import { PassThrough } from 'stream';

import { UpdateService } from './update.service';
import { UpdateRepository } from './repositories/update.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createReadStream: jest.fn(),
}));

jest.mock('win-version-info', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('UpdateService', () => {
  let service: UpdateService;
  let mockUpdateRepository: any;
  let mockCacheManager: any;

  const mockVersion = '1.0.5';


  const mockConfigService = {
    get: jest.fn((key: string) => {
      const map = {
        GOOGLE_SHEET_ID: 'test_spreadsheet_id',
        GOOGLE_SHEET_NAME: 'test_sheet_name',
        FOLDER_PATH: 'test-folder',
      };

      return map[key];
    }),
  };

  const mockQueue = {
    add: jest.fn(),
  };

  beforeEach(async () => {
    mockUpdateRepository = {
      getInstanceByDevice: jest.fn(),
      createInstance: jest.fn(),
      updateInstance: jest.fn(),
    };

    mockGoogleSheetsService = {
      updatePdvVersion: jest.fn(),
    };

    mockCacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateService,
        { provide: UpdateRepository, useValue: mockUpdateRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: getQueueToken('google_sheets'), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<UpdateService>(UpdateService);
    jest.clearAllMocks();
  });

  describe('getLastestVersionFile', () => {
    const cacheKey = 'version_file';

    it('should return version from cache if it exists', async () => {
      mockCacheManager.get.mockResolvedValue(mockVersion);

      const result = await service.getLastestVersionFile();

      expect(result).toEqual({ version: mockVersion });
      expect(winVersionInfo).not.toHaveBeenCalled();
    });

    it('should read file info, cache it, and return version if not in cache', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      (winVersionInfo as jest.Mock).mockResolvedValue({ FileVersion: mockVersion });

      const result = await service.getLastestVersionFile();

      expect(winVersionInfo).toHaveBeenCalledWith(service['filePath']);
      expect(mockCacheManager.set).toHaveBeenCalledWith(cacheKey, mockVersion, 300000);
      expect(result).toEqual({ version: mockVersion });
    });
  });

  describe('getLastestFile', () => {
    it('should return a StreamableFile', async () => {
      const mockStream = new PassThrough();
      (createReadStream as jest.Mock).mockReturnValue(mockStream as any);

      const result = await service.getLastestFile();

      expect(createReadStream).toHaveBeenCalledWith(service['filePath']);
      expect(result).toBeInstanceOf(StreamableFile);
    });
  });

  describe('saveAndExport', () => {
    const mockDto = { userId: 'u1', deviceId: 'dev-123', name: 'Main Register' };
    const mockDeviceName = 'DESKTOP-POS1';

    beforeEach(() => {
      // Mocking the internal method call
      jest.spyOn(service, 'getLastestVersionFile').mockResolvedValue({ version: mockVersion });
    });

    it('should CREATE a new instance and update sheets if device does not exist', async () => {
      mockUpdateRepository.getInstanceByDevice.mockResolvedValue(null);

      await service.saveAndExport(mockDto, mockDeviceName);

      expect(mockUpdateRepository.getInstanceByDevice).toHaveBeenCalledWith(mockDto.deviceId);
      expect(mockUpdateRepository.createInstance).toHaveBeenCalledWith({
        userId: mockDto.userId,
        deviceId: mockDto.deviceId,
        exeVersion: mockVersion,
      });
      expect(mockUpdateRepository.updateInstance).not.toHaveBeenCalled();

      expect(mockQueue.add).toHaveBeenCalledWith('process', {
        name: mockDto.name,
        deviceName: mockDeviceName,
        version: mockVersion,
        cnpj: mockDto.cnpj,
      });
    });

    it('should UPDATE the instance and update sheets if device already exists', async () => {
      mockUpdateRepository.getInstanceByDevice.mockResolvedValue({ _id: '1' });

      await service.saveAndExport(mockDto, mockDeviceName);

      expect(mockUpdateRepository.getInstanceByDevice).toHaveBeenCalledWith(mockDto.deviceId);
      expect(mockUpdateRepository.updateInstance).toHaveBeenCalledWith({
        userId: mockDto.userId,
        deviceId: mockDto.deviceId,
        exeVersion: mockVersion,
      });
      expect(mockUpdateRepository.createInstance).not.toHaveBeenCalled();

      expect(mockQueue.add).toHaveBeenCalledWith('process', {
        name: mockDto.name,
        deviceName: mockDeviceName,
        version: mockVersion,
        cnpj: mockDto.cnpj,
      });
    });
  });
});