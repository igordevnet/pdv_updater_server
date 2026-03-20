import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service"
import { UserService } from "../user/user.service";
import { SecurityService } from "../../shared/modules/security/security.service";
import { AuthRepository } from "./repositories/auth.repository";
import { TokenService } from "../../shared/modules/jwt/token.service";

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
        it('should return auth tokens successfully', () => {
            const dto = {
                name: 'mock_name',
                password: 'plain_password',
                deviceId: 'mock_device',
            };

            const tokens = {
                access_token: 'access_token',
                refresh_tokn: 'refresh_token',
            };

            mockUserService.getUserByName.mockResolvedValue({ id: '1', name: 'mock_name', password: 'hashed_password' });

            mockSecurityService.compareData.mockResolvedValue(true);

            expect(mockUserService.getUserByName).toHaveBeenCalledWith(dto.name);
            expect(mockSecurityService.compareData).toHaveBeenCalledWith('plain_password', 'hashed_password');
            expect(service['generateAndSaveTokens']).toHaveReturnedWith(tokens);
        });

        it('should throw unauthorized exception when password is invalid', () => {
            const dto = {
                name: 'mock_name',
                password: 'plain_password',
                deviceId: 'mock_device',
            };

            mockUserService.getUserByName.mockResolvedValue({ id: '1', name: 'mock_name', password: 'hashed_password' });

            mockSecurityService.compareData.mockResolvedValue(false);

            expect(mockUserService.getUserByName).toHaveBeenCalledWith(dto.name);
            expect(mockSecurityService.compareData).rejects.toThrow('Invalid credentials');
        });

        it('should throw unauthorized exception when user does not exist', () => {
            const dto = {
                name: 'mock_name',
                password: 'plain_password',
                deviceId: 'mock_device',
            };

            mockUserService.getUserByName.mockResolvedValue(null);

            expect(mockUserService.getUserByName).rejects.toThrow('Invalid credentials');
        });
    });

    describe('logout', () => {
        it('should return void if logged out successfully', () => {
            const userId = '123';
            const deviceId = 'mock_device';

            mockAuthRepository.deleteToken.mockReturnThis();

            expect(mockAuthRepository.deleteToken).toHaveBeenCalledWith(userId, deviceId);
        });
    });

    describe('refreshToken', () => {
        it('should return a new pair of token', () => {
            const refresh_token = 'refresh_token';
            const deviceId = 'mock_device';

            const user = {
                userId: '1',
                deviceId,
                refresh_token: 'hashed_token',
            }

            mockAuthRepository.getEntityByDevice.mockResolvedValue({ userId: '1', deviceId, refresh_token });

            mockSecurityService.compareData.mockResolvedValue(true);

            mockUserService.getUserById.mockResolvedValue(user);

            expect(mockAuthRepository.getEntityByDevice).toHaveBeenCalledWith(deviceId);
            expect(mockSecurityService.compareData).toHaveBeenCalledWith(refresh_token, user.refresh_token);
            expect(mockUserService.getUserById).toHaveBeenCalledWith(user.userId);
        });

        it('should throw unauthorized exception when token is invalid', () => {
            const refresh_token = 'invalid_refresh_token';
            const deviceId = 'mock_device';

            const user = {
                userId: '1',
                deviceId,
                refresh_token: 'hashed_token',
            }

            mockAuthRepository.getEntityByDevice.mockResolvedValue({ userId: '1', deviceId, refresh_token });

            mockSecurityService.compareData.mockResolvedValue(false);

            expect(mockAuthRepository.getEntityByDevice).toHaveBeenCalledWith(deviceId);
            expect(mockSecurityService.compareData).toHaveBeenCalledWith(refresh_token, user.refresh_token);
            expect(mockSecurityService.compareData).rejects.toThrow('Please, log in again');
        });

        it('should throw unauthorized exception when device is invalid', () => {
            const refresh_token = 'refresh_token';
            const deviceId = 'invalid_mock_device';

            const user = {
                userId: '1',
                deviceId,
                refresh_token: 'hashed_token',
            }

            mockAuthRepository.getEntityByDevice.mockResolvedValue(null);

            expect(mockAuthRepository.getEntityByDevice).toHaveBeenCalledWith(deviceId);
            expect(mockAuthRepository.getEntityByDevice).rejects.toThrow('Please, log in again');
        });

        it('should throw unauthorized exception when user does not exist', () => {
            const refresh_token = 'refresh_token';
            const hashed_token = 'hashed_token';
            const deviceId = 'invalid_mock_device';

            mockAuthRepository.getEntityByDevice.mockResolvedValue({ userId: '1', deviceId, refresh_token });

            mockSecurityService.compareData.mockResolvedValue(true);

            mockUserService.getUserById.mockResolvedValue(null);

            expect(mockAuthRepository.getEntityByDevice).toHaveBeenCalledWith(deviceId);
            expect(mockSecurityService.compareData).toHaveBeenCalledWith(refresh_token, hashed_token);
            expect(mockUserService.getUserById).rejects.toThrow('Please, log in again')
        });
    });
});