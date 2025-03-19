"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const database_module_1 = require("./database/database.module");
const users_module_1 = require("./users/users.module");
const jwtGuard_1 = require("./guards/jwtGuard");
const jwt_1 = require("@nestjs/jwt");
const posts_module_1 = require("./posts/posts.module");
const groups_module_1 = require("./groups/groups.module");
const topics_module_1 = require("./topics/topics.module");
const RoleGuard_1 = require("./guards/RoleGuard");
const messages_service_1 = require("./messages/messages.service");
const messages_module_1 = require("./messages/messages.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            database_module_1.DatabaseModule,
            users_module_1.UsersModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'secretKey',
                signOptions: { expiresIn: '1d' },
            }),
            posts_module_1.PostsModule,
            groups_module_1.GroupsModule,
            topics_module_1.TopicsModule,
            messages_module_1.MessagesModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            jwtGuard_1.JwtGuard,
            RoleGuard_1.RolesGuard,
            messages_service_1.MessagesService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map