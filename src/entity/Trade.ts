import { Column, Entity } from 'typeorm';

import { Base } from './Base';

@Entity()
export class Trade extends Base {
  @Column({ nullable: true })
  from: string;

  @Column()
  to: string;

  @Column('decimal')
  rate: number;

  @Column('decimal')
  quantity: number;

  @Column('decimal')
  fee: number;

  amount(): number {
    return this.quantity / this.rate;
  }
}
