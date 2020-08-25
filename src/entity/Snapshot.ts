import { Column, Entity } from 'typeorm';

import { Base } from './Base';

@Entity()
export class Snapshot extends Base {
  @Column('decimal')
  usdt: number;

  @Column('decimal')
  xrp: number;

  @Column('decimal')
  xrpusdtRate: number;
}
