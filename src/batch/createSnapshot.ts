import { Connection } from 'typeorm';

import { get24hrOHLC } from '../client/binance';
import { Snapshot } from '../entity/Snapshot';
import { TradeRepository } from '../repository/TradeRepository';

export async function createSnapshot(connection: Connection): Promise<void> {
  const snapshotRepository = connection.getRepository(Snapshot);
  const tradeRepository = connection.getCustomRepository(TradeRepository);

  const snapshot = new Snapshot();
  snapshot.usdt = (await tradeRepository.findBalance('usdt')).balance;
  snapshot.xrp = (await tradeRepository.findBalance('xrp')).balance;
  snapshot.xrpusdtRate = (await get24hrOHLC()).latestPrice;
  await snapshotRepository.save(snapshot);
}
