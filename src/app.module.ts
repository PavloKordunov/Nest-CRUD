import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { JwtGuard } from './guards/jwtGuard';
import { JwtModule } from '@nestjs/jwt';
import { PostsModule } from './posts/posts.module';
import { GroupsModule } from './groups/groups.module';
import { TopicsModule } from './topics/topics.module';
import { RolesGuard } from './guards/RoleGuard';
import { APP_GUARD } from '@nestjs/core';
import { MessagesService } from './messages/messages.service';
import { MessagesModule } from './messages/messages.module';
import { CacheModule } from './cache/cache.module';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
    PostsModule,
    GroupsModule,
    TopicsModule,
    MessagesModule,
    CacheModule,
    MoviesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    JwtGuard,
    RolesGuard,
    MessagesService,
  ],
})
export class AppModule {}
