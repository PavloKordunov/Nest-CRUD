import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { LoginUserDto } from './dto/LoginUserDto';
import { CacheService } from 'src/cache/cache.service';

@Injectable()
export class UsersService {
    constructor(private readonly dataBaseService: DatabaseService, private jwtService: JwtService,  private readonly cacheService: CacheService) {}

    async findAll(status?: "User" | "Admin", page: number = 1, limit: number = 10) {
        try {
            const cacheKey = `users:${status || "all"}`;

            const cachedUsers = await this.cacheService.get(cacheKey);
            if (cachedUsers) {
              console.log(`Cache HIT for ${cacheKey}`);
              return cachedUsers;
            }
          
            console.log(`Cache MISS for ${cacheKey}, fetching from DB...`);

            if (status && !["User", "Admin"].includes(status)) {
                throw new BadRequestException("Invalid status value. Allowed values: 'User' or 'Admin'");
            }

            const skip = (page-1) * limit

            const [users, total] = await Promise.all([
                this.dataBaseService.user.findMany({
                    where: status ? { status } : {},
                    skip,
                    take: limit,
                }),
                this.dataBaseService.user.count({
                    where: status ? { status } : {},
                }),
            ]);

            await this.cacheService.set(cacheKey, users, 600);

            return {users, total} ;
        } catch (error) {
            throw new BadRequestException(`Failed to fetch users: ${error.message}`);
        }
    }

    async register(createUserDto: CreateUserDto) {
        try {
            const existingUser = await this.dataBaseService.user.findUnique({
                where: { email: createUserDto.email },
            });
    
            if (existingUser) {
                throw new ConflictException('Email is already in use');
            }
    
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            
            const user = await this.dataBaseService.user.create({
                data: { ...createUserDto, password: hashedPassword }
            });
    
            return this.generateToken(user);
        } catch (error) {
            if (error instanceof ConflictException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to register user: ${error.message}`);
        }
    }

    async login(loginUserDto: LoginUserDto) {
        try {
            const user = await this.dataBaseService.user.findUnique({
                where: { email: loginUserDto.email },
            });
    
            if (!user) {
                throw new UnauthorizedException('Invalid credentials');
            }
    
            const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);

            if (!isPasswordValid) {
                throw new UnauthorizedException('Invalid credentials');
            }
    
            return this.generateToken(user);
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to login: ${error.message}`);
        }
    }
    

    async generateToken(user: any) {
        return {access_token : this.jwtService.sign({ sub: user.id, email: user.email, status: user.status })}
    }


    async findOne(id: number) {
        try {
            const cachedUser = await this.cacheService.get(`user:${id}`);
            if (cachedUser) {
              console.log(`Cache HIT for user:${id}`);
              return cachedUser;
            }

            console.log(`Cache MISS for user:${id}, fetching from DB...`);

            const user = await this.dataBaseService.user.findUnique({
                where: { id },
                include: {
                    _count: {
                        select: {
                            followers: true,
                            following: true
                        }
                    }
                }
            });
    
            if (!user) {
                throw new NotFoundException(`User with id ${id} not found`);
            }

            await this.cacheService.set(`user:${id}`, user, 300);
    
            return user
        } catch (error) {
            throw new NotFoundException(`Failed to fetch user: ${error.message}`);
        }
    }
    
    async follow(followerId: number, followingId: number) {
        try {
            if (followerId === followingId) {
                throw new BadRequestException("You can't follow yourself.");
            }
    
            const followingUser = await this.dataBaseService.user.findUnique({
                where: { id: followingId }
            });
    
            if (!followingUser) {
                throw new NotFoundException(`User with ID ${followingId} not found`);
            }
    
            const existingFollow = await this.dataBaseService.follow.findUnique({
                where: {
                    followerId_followingId: { followerId, followingId }
                }
            });
    
            if (existingFollow) {
                await this.dataBaseService.follow.delete({
                    where: { id: existingFollow.id }
                });
                return { message: "Unfollowed successfully" };
            } 
    
            console.log(`Trying to follow: followerId=${followerId}, followingId=${followingId}`);
    
            await this.dataBaseService.follow.create({
                data: { followerId, followingId }
            });
    
            return { message: "Followed successfully" };
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to follow user: ${error.message}`);
        }
    }
    

    async update(id: number, updateUserDto: UpdateUserDto) {
        try {
            const updateUser = await this.dataBaseService.user.update({
                where: {
                    id,
                },
                data: updateUserDto,
            })

            if(!updateUser){
                throw new NotFoundException("User not found")
            }
            await this.cacheService.del(`user:${id}`);
            await this.cacheService.del(`users:all`);
            await this.cacheService.del(`users:User`);
            await this.cacheService.del(`users:Admin`);

            return updateUser
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(error.message)
        }
    }

    async delete(id: number) {
        try {
            const user = await this.dataBaseService.user.delete({
                where : {
                    id,
                }
            })

            if(!user){
                throw new NotFoundException("User not found")
            }

            return user
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(error.message)
        }
    }

}
