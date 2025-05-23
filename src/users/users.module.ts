import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { DatabaseService } from 'src/database/database.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from 'src/guards/jwtGuard';
import { CacheService } from 'src/cache/cache.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService, DatabaseService, JwtGuard, CacheService],
  exports: [UsersService],
})
export class UsersModule {}
