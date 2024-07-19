import { Injectable, Logger, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Pool } from './pool.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PoolService {
  private readonly logger = new Logger(PoolService.name);
  private isFetching = false;
  private uniswapSubgraphUrl : string;

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(Pool)
    private poolRepository: Repository<Pool>,

    private configService: ConfigService
  ) {
    this.uniswapSubgraphUrl = this.configService.get<string>('UNISWAP_SUBGRAPH_URL');
  }

  async fetchAllPools() {
    let allPools = [];
    const batchSize = 1000;
    let skip = 0;
  
    while (true) {
      const query = `
        {
        pools(first: ${batchSize}, skip:${skip}) {
          id
          token0 {
            id
          }
          token1 {
            id
          }
        }
      }
      `;
  
      const response = await firstValueFrom(
        this.httpService.post(this.uniswapSubgraphUrl, { query })
      );
  
      const pools = response.data.data.pools;
      if (pools.length === 0) {
        break;
      }
  
      allPools = allPools.concat(pools);
      skip = skip + batchSize;
    }
  
    //this.logger.log('Fetched Pools:', allPools);
    return allPools;
  }


  @Cron('0 */30 * * * *')
  async fetchPoolData() {

    if (this.isFetching) {
      this.logger.warn('Previous job is still running');
      return;
    }

    this.isFetching = true;
    this.logger.log('Started pool data fetching');


    try{
    const pools = await this.fetchAllPools();
    //this.logger.log(pools.length)

    for (const pool of pools) {
      let existingPool = await this.poolRepository.findOne({ where: { pool: pool.id } });
      if (existingPool) {
        existingPool.token0 = pool.token0.id;
        existingPool.token1 = pool.token1.id;
        await this.poolRepository.save(existingPool);
      } else {
        const newPool = this.poolRepository.create({
          pool: pool.id,
          token0: pool.token0.id,
          token1: pool.token1.id,
        });
        await this.poolRepository.save(newPool);
      }
    }

    this.logger.log('Pool data logged to database');

  } finally{
    this.isFetching = false;
  }
  
  }

}
