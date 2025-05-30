import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma/prisma.service';
import { HashingProvider } from '../auth/provider/hashing.provider';
import { Role } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;
  let hashingProvider: HashingProvider;
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedPassword123',
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        {
          provide: HashingProvider,
          useValue: {
            hashPassword: jest.fn(),
            comparePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashingProvider = module.get<HashingProvider>(HashingProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123456',
      };
      const hashedPassword = 'hashed-password';

      jest
        .spyOn(hashingProvider, 'hashPassword')
        .mockResolvedValue(hashedPassword);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(user);

      const result = await service.create(dto);

      expect(hashingProvider.hashPassword).toHaveBeenCalledWith(dto.password);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      expect(result).toEqual(user);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      jest.spyOn(prismaService.user, 'findMany').mockResolvedValue([user]);

      const result = await service.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual([user]);
    });
  });

  describe('validateUser', () => {
    it('should validate a user successfully', async () => {
      const loginDto = { email: 'john@example.com', password: '123456' };

      jest.spyOn(service, 'findByEmail').mockResolvedValue(user);
      jest.spyOn(hashingProvider, 'comparePassword').mockResolvedValue(true);

      const result = await service.validateUser(loginDto);

      expect(service.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(hashingProvider.comparePassword).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(result).toEqual(user);
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      const loginDto = { email: 'john@example.com', password: '123456' };

      jest.spyOn(service, 'findByEmail').mockResolvedValue(null);

      await expect(service.validateUser(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('findById', () => {
    it('should return a user by ID', async () => {
      const user = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword123',
        role: Role.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.findById(user.id);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(user);

      const result = await service.findByEmail(user.email);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: user.email },
      });
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto = { name: 'Updated Name' };
      const updatedUser = { ...user, id: '1' };
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(updatedUser);

      const result = await service.update('1', dto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: dto,
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should delete a user', async () => {
      jest.spyOn(prismaService.user, 'delete').mockResolvedValue(user);

      const result = await service.remove(user.id);

      expect(prismaService.user.delete).toHaveBeenCalledWith({
        where: { id: user.id },
      });
      expect(result).toEqual(user);
    });
  });
});
