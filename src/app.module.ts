import { Module, OnModuleInit } from '@nestjs/common';
import { PoolModule } from './pool/pool.module';
import { PoolService } from './pool/pool.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import {DatabaseModule} from './database/database.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PoolModule,
    DatabaseModule,
    ScheduleModule.forRoot()
  ],

  providers: []
})
export class AppModule implements OnModuleInit {
  constructor(private readonly poolService: PoolService) {}

  async onModuleInit() {
    await this.poolService.fetchPoolData();
  }
}
