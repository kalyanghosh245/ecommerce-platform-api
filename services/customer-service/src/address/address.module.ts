import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@ecommerce/shared';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}