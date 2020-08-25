import { EntityRepository, Repository } from 'typeorm';

import { Trade } from '../entity/Trade';

@EntityRepository(Trade)
export class TradeRepository extends Repository<Trade> {
  findBalance(symbol: string) {
    return this.createQueryBuilder('o').select(`SUM(CASE WHEN o.from = '${symbol}' THEN -o.quantity WHEN o.to = '${symbol}' THEN (o.quantity / o.rate) - o.fee END)`, 'balance').getRawOne();
  }
}
