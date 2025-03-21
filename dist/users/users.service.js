"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const cache_service_1 = require("../cache/cache.service");
let UsersService = class UsersService {
    dataBaseService;
    jwtService;
    cacheService;
    constructor(dataBaseService, jwtService, cacheService) {
        this.dataBaseService = dataBaseService;
        this.jwtService = jwtService;
        this.cacheService = cacheService;
    }
    async findAll(status, page = 1, limit = 10) {
        try {
            const cacheKey = `users:${status || "all"}`;
            const cachedUsers = await this.cacheService.get(cacheKey);
            if (cachedUsers) {
                console.log(`Cache HIT for ${cacheKey}`);
                return cachedUsers;
            }
            console.log(`Cache MISS for ${cacheKey}, fetching from DB...`);
            if (status && !["User", "Admin"].includes(status)) {
                throw new common_1.BadRequestException("Invalid status value. Allowed values: 'User' or 'Admin'");
            }
            const skip = (page - 1) * limit;
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
            return { users, total };
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to fetch users: ${error.message}`);
        }
    }
    async register(createUserDto) {
        try {
            const existingUser = await this.dataBaseService.user.findUnique({
                where: { email: createUserDto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('Email is already in use');
            }
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const user = await this.dataBaseService.user.create({
                data: { ...createUserDto, password: hashedPassword }
            });
            return this.generateToken(user);
        }
        catch (error) {
            if (error instanceof common_1.ConflictException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Failed to register user: ${error.message}`);
        }
    }
    async login(loginUserDto) {
        try {
            const user = await this.dataBaseService.user.findUnique({
                where: { email: loginUserDto.email },
            });
            if (!user) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
            if (!isPasswordValid) {
                throw new common_1.UnauthorizedException('Invalid credentials');
            }
            return this.generateToken(user);
        }
        catch (error) {
            if (error instanceof common_1.UnauthorizedException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Failed to login: ${error.message}`);
        }
    }
    async generateToken(user) {
        return { access_token: this.jwtService.sign({ sub: user.id, email: user.email, status: user.status }) };
    }
    async findOne(id) {
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
                throw new common_1.NotFoundException(`User with id ${id} not found`);
            }
            await this.cacheService.set(`user:${id}`, user, 300);
            return user;
        }
        catch (error) {
            throw new common_1.NotFoundException(`Failed to fetch user: ${error.message}`);
        }
    }
    async follow(followerId, followingId) {
        try {
            if (followerId === followingId) {
                throw new common_1.BadRequestException("You can't follow yourself.");
            }
            const followingUser = await this.dataBaseService.user.findUnique({
                where: { id: followingId }
            });
            if (!followingUser) {
                throw new common_1.NotFoundException(`User with ID ${followingId} not found`);
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
        }
        catch (error) {
            if (error instanceof common_1.BadRequestException || error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(`Failed to follow user: ${error.message}`);
        }
    }
    async update(id, updateUserDto) {
        try {
            const updateUser = await this.dataBaseService.user.update({
                where: {
                    id,
                },
                data: updateUserDto,
            });
            if (!updateUser) {
                throw new common_1.NotFoundException("User not found");
            }
            await this.cacheService.del(`user:${id}`);
            await this.cacheService.del(`users:all`);
            await this.cacheService.del(`users:User`);
            await this.cacheService.del(`users:Admin`);
            return updateUser;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
    async delete(id) {
        try {
            const user = await this.dataBaseService.user.delete({
                where: {
                    id,
                }
            });
            if (!user) {
                throw new common_1.NotFoundException("User not found");
            }
            return user;
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            throw new common_1.InternalServerErrorException(error.message);
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService, jwt_1.JwtService, cache_service_1.CacheService])
], UsersService);
//# sourceMappingURL=users.service.js.map