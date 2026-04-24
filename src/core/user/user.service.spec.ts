import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './repositories/user.repository';
import { SecurityService } from '../../shared/modules/security/security.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException } from '@nestjs/common';

const mockSecurityService = {
  hashData: jest.fn(),
};

const mockUserRepository = {
  getUserByCNPJ: jest.fn(),
  createUser: jest.fn(),
  getUserByName: jest.fn(),
  getUserById: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: SecurityService, useValue: mockSecurityService },
        { provide: UserRepository, useValue: mockUserRepository },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const dto = { name: 'Main Store', password: 'plain_password', cnpj: '12.345.678/0001-90' };

    it('should throw BadRequestException if CNPJ is already in use', async () => {
      mockUserRepository.getUserByCNPJ.mockResolvedValue({ id: '1', cnpj: dto.cnpj });

      await expect(service.createUser(dto)).rejects.toThrow(BadRequestException);
      expect(mockUserRepository.getUserByCNPJ).toHaveBeenCalledWith(dto.cnpj);
      expect(mockUserRepository.createUser).not.toHaveBeenCalled();
    });

    it('should create a user successfully and hash the password', async () => {
      mockUserRepository.getUserByCNPJ.mockResolvedValue(null);
      mockSecurityService.hashData.mockResolvedValue('hashed_password');

      const result = await service.createUser({ ...dto });

      expect(result).toEqual({ message: 'User created successfully.' });
      expect(mockSecurityService.hashData).toHaveBeenCalledWith('plain_password');
      expect(mockUserRepository.createUser).toHaveBeenCalledWith({
        ...dto,
        password: 'hashed_password',
      });
    });
  });

  describe('getUserByName', () => {
    const name = 'Main Store';
    const cacheKey = `auth_user_${name}`;
    const expectedUser = { id: '1', name };

    it('should return user from cache if it exists', async () => {
      mockCacheManager.get.mockResolvedValue(expectedUser);

      const result = await service.getUserByName(name);

      expect(result).toEqual(expectedUser);
      expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
      expect(mockUserRepository.getUserByName).not.toHaveBeenCalled();
    });

    it('should fetch user from repository and cache it if not in cache', async () => {
      const name = 'Main Store';
      const cacheKey = `auth_user_${name}`;

      const rawUser = { id: '1', name, cnpj: '123' };

      mockCacheManager.get.mockResolvedValue(null);
      mockUserRepository.getUserByName.mockResolvedValue(rawUser);

      const result = await service.getUserByName(name);

      expect(result).toEqual(rawUser);

      expect(mockUserRepository.getUserByName).toHaveBeenCalledWith(name);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        cacheKey,
        rawUser,
        300000
      );
    });
  });

  describe('getUserById', () => {
    const id = '123';
    const cacheKey = `auth_user_${id}`;

    const rawUser = { id, name: 'Main Store', cnpj: '123' };

    it('should return user from cache if it exists', async () => {
      mockCacheManager.get.mockResolvedValue(rawUser);

      const result = await service.getUserById(id);

      expect(result).toEqual(rawUser);
      expect(mockCacheManager.get).toHaveBeenCalledWith(cacheKey);
    });

    it('should return null if user does not exist in repository', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockUserRepository.getUserById.mockResolvedValue(null);

      const result = await service.getUserById(id);

      expect(result).toBeNull();
    });

    it('should fetch user, cache secure version, and return raw user', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      mockUserRepository.getUserById.mockResolvedValue(rawUser);

      const result = await service.getUserById(id);

      const secureUser = {
        id: rawUser.id,
        name: rawUser.name,
        cnpj: rawUser.cnpj,
      };

      expect(result).toEqual(rawUser);

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith(id);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        cacheKey,
        secureUser,
        300000
      );
    });
  });
});