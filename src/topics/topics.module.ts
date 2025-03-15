import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from 'src/guards/jwtGuard';

@Module({
    imports: [DatabaseModule, 
      JwtModule.register({
        secret: process.env.JWT_SECRET || 'secretKey',
        signOptions: { expiresIn: '1d' },
      }),
    ],
  providers: [TopicsService, JwtGuard],
  controllers: [TopicsController]
})
export class TopicsModule {}
