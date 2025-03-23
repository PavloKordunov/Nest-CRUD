import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService

  const mockUsersService = {
    findAll: jest.fn().mockReturnValue([
      { id: 1, email: 'user1@example.com', status: 'User'},
      { id: 2, email: 'admin@example.com', status: 'Admin'},
    ]),
    findOne: jest.fn(),
    register: jest.fn(),
    login: jest.fn(),
    update: jest.fn(),
    follow: jest.fn(),
    delete: jest.fn()
  }

  const mockJwtService = {
    sign: jest.fn().mockReturnValue('mocked_jwt_token'),
    verify: jest.fn().mockReturnValue({ sub: 1, email: 'test@example.com' }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {provide: UsersService, useValue: mockUsersService},
        {provide: JwtService, useValue: mockJwtService}
      ]
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService)

  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
  });

  it('should return filtered users by status', async () => {
    jest.clearAllMocks(); 
    mockUsersService.findAll.mockReturnValue([{id: 2, email: 'admin@example.com', status: 'Admin'}])

    const result = await usersController.findAll('Admin', 1, 10)

    expect(result).toEqual([{ id: 2, email: 'admin@example.com', status: 'Admin'}])
    expect(usersService.findAll).toHaveBeenCalledWith('Admin', 1, 10);
    expect(usersService.findAll).toHaveBeenCalledTimes(1);
  })

  it('should throw BadRequestException for invalid status', async () => {
    mockUsersService.findAll.mockRejectedValue(new BadRequestException("Invalid status value"));
    
    await expect(usersService.findAll("SuperAdmin" as any)).rejects.toThrow(BadRequestException);
  })

  it('should return single user by Id', async () =>{
    const mockUser = { id: 1, email: 'user1@example.com', status: 'User' }
    mockUsersService.findOne.mockResolvedValue(mockUser)

    const result = await usersController.findOne('1')

    expect(result).toEqual(mockUser)
    expect(usersService.findOne).toHaveBeenCalledWith(1)
    expect(usersService.findOne).toHaveBeenCalledTimes(1)
  })

  it('should throw NotFoundException for invalid userId', async () => {
    mockUsersService.findOne.mockRejectedValue(new NotFoundException('User not found'))

    await expect(usersController.findOne("99")).rejects.toThrow(NotFoundException)
    await expect (usersService.findOne).toHaveBeenCalledWith(99)
  })

  it('should register a user and return Jwt', async () => {
    type Status = 'User' | 'Admin';
    const createUserDto = { email: 'test@example.com', password: 'password123', status: 'User' as Status };
    const mockToken = {access_token: 'mocked_jwt_token' }

    mockUsersService.register.mockResolvedValue(mockToken);
    const result = await usersController.register(createUserDto)

    expect(result).toEqual(mockToken)
    expect(usersService.register).toHaveBeenCalledWith(createUserDto)
    expect(usersService.register).toHaveBeenCalledTimes(1)
  })

  it('should throw ConflictException if email is already taken', async () => {
    type Status = 'User' | 'Admin';
    const createUserDto = { email: 'test@example.com', password: 'password123', status: 'User' as Status };

    mockUsersService.register.mockRejectedValue(new ConflictException('Email already in use'));

    await expect(usersController.register(createUserDto)).rejects.toThrow(ConflictException);
  });

  it('should login a user and return Jwt', async () => {
    const LoginUserDto = { email: 'test@example.com', password: 'password123'};
    const mockToken = {access_token: 'mocked_jwt_token' }

    mockUsersService.login.mockResolvedValue(mockToken);
    const result = await usersController.login(LoginUserDto)

    expect(result).toEqual(mockToken)
    expect(usersService.login).toHaveBeenCalledWith(LoginUserDto)
    expect(usersService.login).toHaveBeenCalledTimes(1)
  })

  it('should throw UnauthorizedException if credentials are incorrect', async () => {
    const loginUserDto = { email: 'wrong@example.com', password: 'wrongpassword' };

    mockUsersService.login.mockRejectedValue(new UnauthorizedException('Invalid credentials'));

    await expect(usersController.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
  });

  it('should update user by id', async () => {
    const updateUserDto = {email: "newemail@example.com"}
    const mockUpdatedUser = { id: 1, email: 'newemail@example.com', status: 'User' };

    mockUsersService.update.mockResolvedValue(mockUpdatedUser)

    const result = await usersService.update(1, updateUserDto)

    expect(result).toEqual(mockUpdatedUser)
    expect(usersService.update).toHaveBeenCalledWith(1, updateUserDto)
    expect(usersService.update).toHaveBeenCalledTimes(1)
  })

  it('should throw NotFoundException if user does not exist', async () => {
    const updateUserDto = {email: "newemail@example.com"}
    mockUsersService.update.mockRejectedValue(new NotFoundException('user not found'))

    await expect(usersController.update('99', updateUserDto)).rejects.toThrow(NotFoundException)
  })

  it('should throw InternalServerErrorException on database error', async () => {
    const updateUserDto = { email: 'newemail@example.com' };

    mockUsersService.update.mockRejectedValue(new InternalServerErrorException('Database error'));

    await expect(usersController.update('1', updateUserDto)).rejects.toThrow(InternalServerErrorException);
  });

  it('should allow user to follow', async () => {
    const followerId = '1'
    const request = {user: {sub:2 }}
    mockUsersService.follow.mockResolvedValue({ message: 'Followed successfully' })

    const result = await usersController.follow(followerId, request)

    expect(result).toEqual({ message: 'Followed successfully' })
    expect(usersService.follow).toHaveBeenCalledWith(1,2)
    expect(usersService.follow).toHaveBeenCalledTimes(1)
  })

  it('should throw BadRequestException when user tries to follow themselves', async () => {
    const followerId = '1'
    const request = {user: {sub: 1}}

    mockUsersService.follow.mockRejectedValue(new BadRequestException("You can't follow yourself."))

    await expect(usersController.follow(followerId, request)).rejects.toThrow(BadRequestException)
  })

  it('should throw InternalServerErrorException on database error', async () => {
    const followerId = '1'
    const request = {user: {sub: 2}}

    mockUsersService.follow.mockRejectedValue(new InternalServerErrorException("Database error"))

    await expect(usersController.follow(followerId, request)).rejects.toThrow(InternalServerErrorException)
  })

  it('should delete user by id', async () => {
    const userId = '1'
    const mockUser = { id: 1, email: 'test@example.com', status: 'User' };

    mockUsersService.delete.mockResolvedValue(mockUser)
    const result = await usersController.delete(userId)

    expect(result).toEqual(mockUser)
    expect(usersService.delete).toHaveBeenCalledWith(1)
  })

  it('should throw NotFoundException if user does not exist', async () => {
    const userId = "99"

    mockUsersService.delete.mockRejectedValue(new NotFoundException("Usser not found"))
    await expect(usersController.delete(userId)).rejects.toThrow(NotFoundException)
  })

  it('should throw InternalServerErrorException on database error', async () => {
    const userId = "99"

    mockUsersService.delete.mockRejectedValue(new InternalServerErrorException('Database error'))
    await expect(usersController.delete(userId)).rejects.toThrow(InternalServerErrorException)
  })

});
