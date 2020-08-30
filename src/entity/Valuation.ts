import { Column, Entity } from 'typeorm';

import { Base } from './Base';

@Entity()
export class Valuation extends Base {
  @Column()
  asset: string;

  @Column('decimal')
  price: number;

  @Column('decimal')
  open: number;

  @Column('decimal')
  high: number;

  @Column('decimal')
  low: number;

  @Column('decimal')
  close: number;
}
