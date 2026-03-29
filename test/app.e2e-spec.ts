import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../src/core/auth/auth.service';
import { UserService } from '../src/core/user/user.service';
import { UpdateService } from '../src/core/update/update.service';

describe('POS API End-to-End Tests', () => {
  let app: INestApplication;

  const mockAuthService = {
    login: jest.fn().mockResolvedValue({ accessToken: 'fake-token', refreshToken: 'fake-refresh-token' }),
    logout: jest.fn().mockResolvedValue(undefined),
    refreshToken: jest.fn().mockResolvedValue({ accessToken: 'new-token', refreshToken: 'new-refresh-token' }),
  };

  const mockUserService = {
    createUser: jest.fn().mockResolvedValue({
      id: '123',
      name: 'Main Store',
      cnpj: '12.345.678/0001-90'
    }),
  };

  const mockUpdateService = {
    getLastestVersionFile: jest.fn().mockResolvedValue({ version: '1.0.5' }),
    getLastestFile: jest.fn().mockResolvedValue(Buffer.from('fake-file-content')),
    saveAndExport: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })

      .overrideProvider(AuthService).useValue(mockAuthService)
      .overrideProvider(UserService).useValue(mockUserService)
      .overrideProvider(UpdateService).useValue(mockUpdateService)

      .overrideGuard(AuthGuard('jwt')).useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();

          req.user = { sub: '123', device: 'DEVICE-ABC', name: 'Register 01' };
          return true;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('User Controller (/user)', () => {
    it('POST /user - Should create a user and return 201', () => {
      return request(app.getHttpServer())
        .post('/user')
        .send({
          name: 'Main Store',
          cnpj: '12.345.678/0001-90',
          password: 'super-secure-password'
        })
        .expect(HttpStatus.CREATED)
        .expect((res) => {
          expect(res.body.name).toEqual('Main Store');
          expect(res.body.cnpj).toEqual('12.345.678/0001-90');
        });
    });
  });

  describe('Auth Controller (/auth)', () => {
    it('POST /auth/local/signin - Should login and return tokens (200 OK)', () => {
      return request(app.getHttpServer())
        .post('/auth/local/signin')
        .send({ name: 'storename', password: '123', deviceId: 'DEV-123' })
        .expect(HttpStatus.OK)
        .expect({ accessToken: 'fake-token', refreshToken: 'fake-refresh-token' });
    });

    it('POST /auth/logout - Should successfully logout (200 OK)', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .expect(HttpStatus.OK);
    });

    it('POST /auth/refresh - Should refresh tokens (200 OK)', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'fake-refresh-token', deviceId: 'DEV-123' })
        .expect(HttpStatus.OK)
        .expect({ accessToken: 'new-token', refreshToken: 'new-refresh-token' });
    });
  });

  describe('Update Controller (/updates)', () => {
    it('GET /updates/check - Should return the current version (200 OK)', () => {
      return request(app.getHttpServer())
        .get('/updates/check')
        .expect(HttpStatus.OK)
        .expect({ version: '1.0.5' });
    });

    it('POST /updates/save - Should register the download (200 OK)', () => {
      return request(app.getHttpServer())
        .post('/updates/save')
        .send({ deviceName: 'Front-Register' })
        .expect(HttpStatus.OK)
        .expect({ success: true });
    });
  });
});