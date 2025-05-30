import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '../users/users.service';
import JwtConfig from './config/jwt.config';
import { PrismaService } from '../database/prisma/prisma.service';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    validateUser: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockJwtConfig = {
    secret: 'test-secret',
    expiresIn: '1h',
    audience: 'test-audience',
    issuer: 'test-issuer',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: JwtConfig.KEY, useValue: mockJwtConfig },
        PrismaService,
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('should return access token and user if login is successful', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };
      const user = { id: '1', email: 'test@example.com', name: 'Test User' };
      const accessToken = 'mock-token';

      mockUsersService.validateUser.mockResolvedValue(user);
      mockJwtService.signAsync.mockResolvedValue(accessToken);

      const result = await authService.login(loginDto);

      expect(result).toEqual({
        accessToken,
        user: { id: user.id, email: user.email, name: user.name },
      });
      expect(usersService.validateUser).toHaveBeenCalledWith(loginDto);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id, email: user.email },
        {
          secret: mockJwtConfig.secret,
          expiresIn: mockJwtConfig.expiresIn,
          audience: mockJwtConfig.audience,
          issuer: mockJwtConfig.issuer,
        },
      );
    });

    it('should throw UnauthorizedException if validation fails', async () => {
      const loginDto: LoginDto = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      mockUsersService.validateUser.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.validateUser).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('register', () => {
    it('should return access token and new user if registration is successful', async () => {
      const registerDto: RegisterDto = {
        email: 'newuser@example.com',
        name: 'New User',
        password: 'securepassword123',
      };
      const newUser = {
        id: '2',
        email: 'newuser@example.com',
        name: 'New User',
      };
      const accessToken = 'mock-token';

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(newUser);
      mockJwtService.signAsync.mockResolvedValue(accessToken);

      const result = await authService.register(registerDto);

      expect(result).toEqual({
        accessToken,
        user: { id: newUser.id, email: newUser.email, name: newUser.name },
      });
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
      expect(usersService.create).toHaveBeenCalledWith(registerDto);
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: newUser.id, email: newUser.email },
        {
          secret: mockJwtConfig.secret,
          expiresIn: mockJwtConfig.expiresIn,
          audience: mockJwtConfig.audience,
          issuer: mockJwtConfig.issuer,
        },
      );
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        name: 'Existing User',
        password: 'password123',
      };
      const existingUser = {
        id: '3',
        email: 'existing@example.com',
        name: 'Existing User',
      };

      mockUsersService.findByEmail.mockResolvedValue(existingUser);

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.findByEmail).toHaveBeenCalledWith(registerDto.email);
    });
  });
});
