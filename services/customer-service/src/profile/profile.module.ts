import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Order } from '@ecommerce/shared';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Order])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}