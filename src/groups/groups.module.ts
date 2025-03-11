import { Module } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';
import { JwtGuard } from 'src/guards/jwtGuard';

@Module({
    imports: [DatabaseModule, 
      JwtModule.register({
        secret: process.env.JWT_SECRET || 'secretKey',
        signOptions: { expiresIn: '1d' },
      }),
    ],
  providers: [GroupsService, JwtGuard],
  controllers: [GroupsController]
})
export class GroupsModule {}
