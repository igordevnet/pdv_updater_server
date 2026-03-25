import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service"
import { UserService } from "../user/user.service";
import { SecurityService } from "../../shared/modules/security/security.service";
import { AuthRepository } from "./repositories/auth.repository";
import { TokenService } from "../../shared/modules/jwt/token.service";
import { UnauthorizedException } from "@nestjs/common";

const mockUserService = {
    getUserByName: jest.fn(),
    getUserById: jest.fn(),
};

const mockAuthRepository = {
    createToken: jest.fn(),
    deleteToken: jest.fn(),
    getEntityByDevice: jest.fn(),
};

const mockSecurityService = {
    hashData: jest.fn(),
    compareData: jest.fn(),
};

const mockTokenService = {
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: SecurityService, useValue: mockSecurityService },
                { provide: TokenService, useValue: mockTokenService },
                { provide: UserService, useValue: mockUserService },
                { provide: AuthRepository, useValue: mockAuthRepository }
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should return auth tokens successfully', async () => {
            const dto = {
                name: 'mock_name',
                password: 'plain_password',
                deviceId: 'mock_device',
                deviceName: 'mock_device_name'
            };

            const tokens = {
                access_token: 'access_token',
                refresh_tokn: 'refresh_token',
            };

            mockUserService.getUserByName.mockResolvedValue({ id: '1', name: 'mock_name', password: 'hashed_password' });

            mockSecurityService.compareData.mockResolvedValue(true);

            jest.spyOn(service as any, 'generateAndSaveTokens').mockResolvedValue(tokens);

            const result = await service.login(dto);

            expect(mockUserService.getUserByName).toHaveBeenCalledWith(dto.name);
            expect(mockSecurityService.compareData).toHaveBeenCalledWith('plain_password', 'hashed_password');
            expect(result).toEqual(tokens);
        });

        it('should throw unauthorized exception when password is invalid', async () => {
            const dto = {
                name: 'mock_name',
                password: 'plain_password',
                deviceId: 'mock_device',
                deviceName: 'mock_device_name'
            };

            mockUserService.getUserByName.mockResolvedValue({ id: '1', name: 'mock_name', password: 'hashed_password' });
            mockSecurityService.compareData.mockResolvedValue(false);

            await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);

            expect(mockSecurityService.compareData).toHaveBeenCalledWith('plain_password', 'hashed_password');
        });

        it('should throw unauthorized exception when user does not exist', async () => {
            const dto = {
                name: 'mock_name',
                password: 'plain_password',
                deviceId: 'mock_device',
                deviceName: 'mock_device_name'
            };

            mockUserService.getUserByName.mockResolvedValue(null);

            await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('logout', () => {
        it('should return void if logged out successfully', async () => {
            const userId = '123';
            const deviceId = 'mock_device';

            const dto = { userId, deviceId };

            mockAuthRepository.deleteToken.mockResolvedValue(undefined);

            await service.logout(dto);

            expect(mockAuthRepository.deleteToken).toHaveBeenCalledWith(userId, deviceId);
        });
    });

    describe('refreshToken', () => {
        it('should return a new pair of token', async () => {
            const refreshToken = 'refresh_token';
            const deviceId = 'mock_device';
            const hashed_token = 'hashed_token';

            const user = {
                userId: '1',
                deviceId,
                refreshToken: 'hashed_token',
            }

            const tokens = {
                access_token: 'access_token',
                refresh_token: 'refresh_token',
            };

            mockAuthRepository.getEntityByDevice.mockResolvedValue({ userId: '1', deviceId, refreshToken: hashed_token });

            mockSecurityService.compareData.mockResolvedValue(true);

            mockUserService.getUserById.mockResolvedValue(user);

            jest.spyOn(service as any, 'generateAndSaveTokens').mockResolvedValue(tokens);

            const result = await service.refreshToken({ refreshToken, deviceId });

            expect(result).toEqual(tokens);
            expect(mockAuthRepository.getEntityByDevice).toHaveBeenCalledWith(deviceId);
            expect(mockSecurityService.compareData).toHaveBeenCalledWith(refreshToken, user.refreshToken);
            expect(mockUserService.getUserById).toHaveBeenCalledWith(user.userId);
        });

        it('should throw unauthorized exception when token is invalid', async () => {
            const refresh_token = 'invalid_refresh_token';
            const deviceId = 'mock_device';

            mockAuthRepository.getEntityByDevice.mockResolvedValue({ userId: '1', deviceId, refreshToken: 'hashed_token' });

            mockSecurityService.compareData.mockResolvedValue(false);


            await expect(service.refreshToken({ refreshToken: refresh_token, deviceId })).rejects.toThrow(UnauthorizedException);
            expect(mockAuthRepository.getEntityByDevice).toHaveBeenCalledWith(deviceId);
            expect(mockSecurityService.compareData).toHaveBeenCalledWith(refresh_token, 'hashed_token');
        });

        it('should throw unauthorized exception when device is invalid', async () => {
            const deviceId = 'invalid_mock_device';

            mockAuthRepository.getEntityByDevice.mockResolvedValue(null);

            await expect(service.refreshToken({ refreshToken: 'refresh_token', deviceId })).rejects.toThrow(UnauthorizedException);
            expect(mockAuthRepository.getEntityByDevice).toHaveBeenCalledWith(deviceId);
        });

        it('should throw unauthorized exception when user does not exist', async () => {
            const refresh_token = 'refresh_token';
            const hashed_token = 'hashed_token';
            const deviceId = 'invalid_mock_device';

            mockAuthRepository.getEntityByDevice.mockResolvedValue({ userId: '1', deviceId, refreshToken: hashed_token });

            mockSecurityService.compareData.mockResolvedValue(true);

            mockUserService.getUserById.mockResolvedValue(null);

            await expect(service.refreshToken({ refreshToken: refresh_token, deviceId })).rejects.toThrow(UnauthorizedException);
            expect(mockAuthRepository.getEntityByDevice).toHaveBeenCalledWith(deviceId);
            expect(mockSecurityService.compareData).toHaveBeenCalledWith(refresh_token, hashed_token);
        });
    });
});