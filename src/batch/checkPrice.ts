import { Connection } from 'typeorm';

import { get24hrOHLC } from '../client/binance';
import { Setting } from '../entity/Setting';
import { Trade } from '../entity/Trade';
import { Valuation } from '../entity/Valuation';
import { TradeRepository } from '../repository/TradeRepository';

export async function checkPrice(connection: Connection): Promise<void> {
  const settingRepository = connection.getRepository(Setting);
  const tradeRepository = connection.getCustomRepository(TradeRepository);
  const valuationRepository = connection.getRepository(Valuation);

  const quote = await get24hrOHLC();
  const mode = (await settingRepository.findOne({ key: 'mode' }));

  const valuation = new Valuation();
  valuation.price = quote.lastPrice;
  valuation.open = quote.openPrice;
  valuation.high = quote.highPrice;
  valuation.low = quote.lowPrice;
  valuation.close = quote.closePrice;
  await valuationRepository.save(valuation);

  const valuations = await valuationRepository.find();

  if (mode.value === 'buy') {
    const rateToBuy = +valuations[valuations.length - 1].low + ((0.5 / 100) * +valuations[valuations.length - 1].low);
    console.log(`XRP is at ${valuations[valuations.length - 1].price}, trying to buy at ${rateToBuy}`);

    if (valuations[valuations.length - 1].price <= rateToBuy) {
      const usdtBalance = (await tradeRepository.findBalance('usdt')).balance;

      const trade = new Trade();
      trade.from = 'usdt';
      trade.to = 'xrp';
      trade.rate = valuations[valuations.length - 1].price;
      trade.quantity = usdtBalance - (usdtBalance / 4);
      trade.fee = (0.1 / 100) * trade.amount();
      await tradeRepository.save(trade);

      mode.value = 'sell';
      await settingRepository.save(mode);
    }
  } else if (mode.value === 'sell') {
    const xrpBalance = (await tradeRepository.findBalance('xrp')).balance;
    const latestTrade = await tradeRepository.findOne({ order: { createdAt: 'DESC' } });
    const rateToSell = (+latestTrade.rate + (0.01 * +latestTrade.rate)) + (+latestTrade.fee / xrpBalance);
    console.log(`XRP is at ${valuations[valuations.length - 1].price}, trying to sell at ${rateToSell}`);

    if (valuations[valuations.length - 1].price >= rateToSell) {
      const trade = new Trade();
      trade.from = 'xrp';
      trade.to = 'usdt';
      trade.rate = 1 / valuations[valuations.length - 1].price;
      trade.quantity = xrpBalance;
      trade.fee = (0.1 / 100) * trade.amount();
      await tradeRepository.save(trade);

      mode.value = 'buy';
      await settingRepository.save(mode);
    }
  }
}
