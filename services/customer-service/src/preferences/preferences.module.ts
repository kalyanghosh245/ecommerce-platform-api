import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@ecommerce/shared';
import { PreferencesService } from './preferences.service';
import { PreferencesController } from './preferences.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [PreferencesController],
  providers: [PreferencesService],
})
export class PreferencesModule {}