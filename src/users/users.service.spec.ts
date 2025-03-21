import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database/database.service';
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt'

describe('UsersService', () => {
  let usersService: UsersService;
  let dataBaseService: DatabaseService
  let jwtService: JwtService

  const mockDataBaseService ={
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    follow: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  }

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token'),
    verify: jest.fn().mockReturnValue({ sub: 1, email: 'test@example.com' }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {provide: DatabaseService, useValue: mockDataBaseService},
        {provide: JwtService, useValue: mockJwtService}
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    dataBaseService = module.get<DatabaseService>(DatabaseService)
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
  });

  it('should return all users', async () => {
    mockDataBaseService.user.findMany.mockResolvedValue([
      { id: 1, email: 'user1@example.com', status: 'User'},
      { id: 2, email: 'admin@example.com', status: 'Admin'},
  ]);

  const result = await usersService.findAll()
  expect(result).toHaveLength(2)
  })

  it('should throw BadRequestException for invalid status', async () => {
    await expect(usersService.findAll("SuperAdmin" as any)).rejects.toThrow(BadRequestException);
  })

  it('should return single user by Id', async () => {
    const mockUser = { id: 1, email: 'user1@example.com', status: 'User' }
    mockDataBaseService.user.findUnique.mockResolvedValue(mockUser)

    const result = await usersService.findOne(1)

    expect(result).toEqual(mockUser)
    expect(dataBaseService.user.findUnique).toHaveBeenCalledWith({where: {id: 1}})
  })

  it('should throw NotFoundException for invalid userId', async () => {
    mockDataBaseService.user.findUnique.mockResolvedValue(null)

    await expect(usersService.findOne(99)).rejects.toThrow(NotFoundException)
  })

  it('should register a user and return Jwt', async () => {
    type Status = 'User' | 'Admin';
    const createUserDto = { email: 'test@example.com', password: 'password123', status: 'User' as Status };
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    
    const mockUser = { id: 1, email: createUserDto.email, status: createUserDto.status, password: hashedPassword };

    mockDataBaseService.user.findUnique.mockResolvedValue(null)
    mockDataBaseService.user.create.mockResolvedValue(mockUser)

    const result = await usersService.register(createUserDto)

    expect(result).toEqual({ access_token: 'mocked_jwt_token' })
    expect(dataBaseService.user.findUnique).toHaveBeenCalledWith({where: {email: createUserDto.email}})
    expect(dataBaseService.user.create).toHaveBeenCalledWith({data: { ...createUserDto, password: expect.any(String) }})
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email, status: mockUser.status });
  })

  it('should throw ConflictException if email is already taken', async () => {
    type Status = 'User' | 'Admin';
    const createUserDto = { email: 'test@example.com', password: 'password123', status: 'User' as Status };
    mockDataBaseService.user.findUnique.mockResolvedValue({id: 1, email: createUserDto.email})

    await expect(usersService.register(createUserDto)).rejects.toThrow(ConflictException);
  })

  it('should login a user and return Jwt', async () => {
    type Status = 'User' | 'Admin';
    const loginUserDto = { email: 'test@example.com', password: 'password123'};
    const hashedPassword = await bcrypt.hash(loginUserDto.password, 10);
    const mockUser = { id: 1, email: loginUserDto.email, password: hashedPassword, status: 'User' as Status };

    mockDataBaseService.user.findUnique.mockResolvedValue(mockUser)
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true)

    const result = await usersService.login(loginUserDto)

    expect(result).toEqual({ access_token: 'mocked_jwt_token' })
    expect(dataBaseService.user.findUnique).toHaveBeenCalledWith({ where: { email: loginUserDto.email } });
    expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id, email: mockUser.email, status: mockUser.status });
  })

  it('should throw UnauthorizedException if email is incorrect', async () => {
    const loginUserDto = { email: 'wrong@example.com', password: 'password123' };

    mockDataBaseService.user.findUnique.mockResolvedValue(null);

    await expect(usersService.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
});

it('should throw UnauthorizedException if password is incorrect', async () => {
    const loginUserDto = { email: 'test@example.com', password: 'wrongpassword' };
    const hashedPassword = await bcrypt.hash('password123', 10);
    const mockUser = { id: 1, email: loginUserDto.email, password: hashedPassword, status: 'User' };

    mockDataBaseService.user.findUnique.mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    await expect(usersService.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
});

it('should update user by id', async () => {
    type Status = 'User' | 'Admin';

    const updateUserDto = {email : "newemail@example.com"}
    const mockUpdatedUser = { id: 1, email: 'newemail@example.com', status: 'User' as Status };
    
    mockDataBaseService.user.update.mockResolvedValue(mockUpdatedUser)

    const result = await usersService.update(1, updateUserDto)

    expect(result).toEqual(mockUpdatedUser)
    expect(dataBaseService.user.update).toHaveBeenCalledWith({
      where: {id: 1},
      data: updateUserDto
    })
})

it('should throw NotFoundException if user does not exist', async () => {
    const updateUserDto = {email: "newemail@example.com"}
    mockDataBaseService.user.update.mockRejectedValue(new NotFoundException('User not found'))

    await expect(usersService.update(99, updateUserDto)).rejects.toThrow(NotFoundException)
})

it('should throw InternalServerErrorException on database error', async () => {
  const updateUserDto = { email: 'newemail@example.com' };

  mockDataBaseService.user.update.mockRejectedValue(new Error('Database error'));

  await expect(usersService.update(1, updateUserDto)).rejects.toThrow(InternalServerErrorException);
});

it('should allow a user to follow another user', async () =>{
  const followerId =1 
  const followingId = 2
  mockDataBaseService.user.findUnique.mockResolvedValue({ id: followingId, email: 'test@example.com' });

  mockDataBaseService.follow.findUnique.mockResolvedValue(null)
  mockDataBaseService.follow.create.mockResolvedValue({followerId, followingId})

  const result = await usersService.follow(followerId, followingId)

  expect(result).toEqual({ message: 'Followed successfully' })
  expect(dataBaseService.follow.create).toHaveBeenCalledWith({data: {followerId, followingId}})
})

it('should allow a user to unfollow another user', async () => {
  const followerId = 1;
  const followingId = 2;
  const mockFollowRecord = { id: 1, followerId, followingId };

  mockDataBaseService.user.findUnique.mockResolvedValue({ id: followingId, email: 'test@example.com' });

  mockDataBaseService.follow.findUnique.mockResolvedValue(mockFollowRecord);
  mockDataBaseService.follow.delete.mockResolvedValue(mockFollowRecord);

  const result = await usersService.follow(followerId, followingId);

  expect(result).toEqual({ message: 'Unfollowed successfully' });
  expect(dataBaseService.follow.delete).toHaveBeenCalledWith({
      where: { id: mockFollowRecord.id },
  });
});

it('should throw BadRequestException when user tries to follow themselves', async () => {
  await expect(usersService.follow(1, 1)).rejects.toThrow(BadRequestException);
});

it('should throw InternalServerErrorException on database error', async () => {
  mockDataBaseService.user.findUnique.mockRejectedValue(new Error('Database error'));

  await expect(usersService.follow(1, 2)).rejects.toThrow(InternalServerErrorException);
});

it('should delete a user', async () => {
  const userId = 1
  const mockUser = { id: userId, email: 'test@example.com', status: 'User' };

  mockDataBaseService.user.findUnique.mockResolvedValue(mockUser)
  mockDataBaseService.user.delete.mockResolvedValue(mockUser)

  const result = await usersService.delete(userId)

  expect(result).toEqual(mockUser)
  expect(dataBaseService.user.findUnique).toHaveBeenCalledWith({where: {id: userId}})
  expect(dataBaseService.user.delete).toHaveBeenCalledWith({where: {id: userId}})
})

it('should throw NotFoundException if user does not exist', async () => {
  const userId = 99;
  
  mockDataBaseService.user.delete.mockRejectedValue(new NotFoundException('User not found')); 

  await expect(usersService.delete(userId)).rejects.toThrow(NotFoundException);
});

it('should throw InternalServerErrorException on database error', async () => {
  const userId = 1;

  mockDataBaseService.user.findUnique.mockResolvedValue({ id: userId, email: 'test@example.com' });
  mockDataBaseService.user.delete.mockRejectedValue(new Error('Database error'));

  await expect(usersService.delete(userId)).rejects.toThrow(InternalServerErrorException);
});
});
