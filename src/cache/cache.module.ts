import { Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [UsersModule],
  providers: [CacheService],
  exports: [CacheService], 
})
export class CacheModule {}
