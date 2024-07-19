import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('pools')
export class Pool {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  pool: string;

  @Column()
  token0: string;

  @Column()
  token1: string;
}
