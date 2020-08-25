import { Connection } from 'typeorm';

import { get24hrOHLC } from '../client/binance';
import { Setting } from '../entity/Setting';
import { Trade } from '../entity/Trade';
import { TradeRepository } from '../repository/TradeRepository';

export async function checkPrice(connection: Connection): Promise<void> {
  const settingRepository = connection.getRepository(Setting);
  const tradeRepository = connection.getCustomRepository(TradeRepository);

  const quote = await get24hrOHLC();
  const mode = (await settingRepository.findOne({ key: 'mode' }));

  if (mode.value === 'buy') {
    const rateToBuy = parseFloat(quote.lowPrice) + ((0.5 / 100) * parseFloat(quote.lowPrice));
    console.log(`XRP is at ${quote.lastPrice}, trying to buy at ${rateToBuy}`);

    if (parseFloat(quote.lastPrice) <= rateToBuy) {
      const usdtBalance = (await tradeRepository.findBalance('usdt')).balance;

      const trade = new Trade();
      trade.from = 'usdt';
      trade.to = 'xrp';
      trade.rate = quote.lastPrice;
      trade.quantity = usdtBalance / 4;
      trade.fee = (0.1 / 100) * trade.total();
      await tradeRepository.save(trade);

      mode.value = 'sell';
      await settingRepository.save(mode);
    }
  } else if (mode.value === 'sell') {
    const xrpBalance = (await tradeRepository.findBalance('xrp')).balance;
    const latestTrade = await tradeRepository.findOne({ order: { createdAt: 'DESC' } });
    const rateToSell = (+latestTrade.rate + ((1.5 / 100) * +latestTrade.rate)) + (+latestTrade.fee / xrpBalance);
    console.log(`XRP is at ${quote.lastPrice}, trying to sell at ${rateToSell}`);

    if (quote.lastPrice >= rateToSell) {
      const trade = new Trade();
      trade.from = 'xrp';
      trade.to = 'usdt';
      trade.rate = 1 / quote.lastPrice;
      trade.quantity = xrpBalance;
      trade.fee = (0.1 / 100) * trade.total();
      await tradeRepository.save(trade);

      mode.value = 'buy';
      await settingRepository.save(mode);
    }
  }
}
