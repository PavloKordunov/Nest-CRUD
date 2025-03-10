import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { DatabaseModule } from 'src/database/database.module';
import { JwtGuard } from 'src/guards/jwtGuard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, 
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [PostsController],
  providers: [PostsService, JwtGuard]
})
export class PostsModule {}
