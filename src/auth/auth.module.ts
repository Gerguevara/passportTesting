import { Module } from '@nestjs/common';
import { ApiKeyGuard } from './guards/apikey.guard';

@Module({
  imports: [],
  controllers: [],
  providers: [ApiKeyGuard],
  exports: [ApiKeyGuard],
})
export class AuthModule {}
