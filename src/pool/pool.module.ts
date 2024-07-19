import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PoolService } from './pool.service';
import { DatabaseModule } from '../database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Pool } from './pool.entity';
import { ConfigModule } from '@nestjs/config';



@Module({
  imports: [
    HttpModule, 
    DatabaseModule, 
    TypeOrmModule.forFeature([Pool]),
    ConfigModule.forRoot({
      isGlobal: true})],
  providers: [PoolService],
  exports: [PoolService],
})
export class PoolModule {}
