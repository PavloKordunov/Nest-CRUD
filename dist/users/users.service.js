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
let UsersService = class UsersService {
    dataBaseService;
    jwtService;
    constructor(dataBaseService, jwtService) {
        this.dataBaseService = dataBaseService;
        this.jwtService = jwtService;
    }
    async findAll(status) {
        const users = await this.dataBaseService.user.findMany({
            where: status ? { status } : undefined,
            include: {
                membership: {
                    include: {
                        group: true,
                    },
                },
            },
        });
        return users.map(user => ({
            ...user,
            groups: user.membership.map(m => m.group),
            membership: undefined
        }));
    }
    async register(createUserDto) {
        const hashedpassword = await bcrypt.hash(createUserDto.password, 10);
        const user = await this.dataBaseService.user.create({
            data: { ...createUserDto, password: hashedpassword }
        });
        return this.generateToken(user);
    }
    async login(loginUserDto) {
        const user = await this.dataBaseService.user.findUnique({
            where: {
                email: loginUserDto.email,
            }
        });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
        if (!isPasswordValid)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.generateToken(user);
    }
    async generateToken(user) {
        return { access_token: this.jwtService.sign({ sub: user.id, email: user.email, status: user.status }) };
    }
    async findOne(id) {
        const user = await this.dataBaseService.user.findUnique({
            where: { id },
            include: {
                membership: { include: { group: true } },
                followers: {
                    select: {
                        followerId: true,
                        follower: { select: { id: true, name: true } }
                    }
                },
                following: {
                    select: {
                        followingId: true,
                        following: { select: { id: true, name: true } }
                    }
                }
            }
        });
        return {
            ...user,
            groups: user?.membership.map(m => m.group),
            followers: user?.followers.map(f => f.follower),
            following: user?.following.map(f => f.following),
            membership: undefined
        };
    }
    async follow(followerId, followingId) {
        if (followerId === followingId) {
            throw new common_1.BadRequestException("You can't follow yourself.");
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
        else {
            console.log(`Trying to follow: followerId=${followerId}, followingId=${followingId}`);
            await this.dataBaseService.follow.create({
                data: {
                    followerId,
                    followingId
                }
            });
            return { message: "Followed successfully" };
        }
    }
    async update(id, updateUserDto) {
        return this.dataBaseService.user.update({
            where: {
                id,
            },
            data: updateUserDto,
        });
    }
    async delete(id) {
        return this.dataBaseService.user.delete({
            where: {
                id,
            }
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService, jwt_1.JwtService])
], UsersService);
//# sourceMappingURL=users.service.js.map