import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ChatGateway } from 'src/guards/mesasge.gateway';
import { DatabaseService } from 'src/database/database.service';
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
    providers: [ChatGateway, MessagesService, DatabaseService, JwtGuard]
})
export class MessagesModule {}
