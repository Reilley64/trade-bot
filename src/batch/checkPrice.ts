import axios from "axios";
import { Connection } from "typeorm";

import { Setting } from "../entity/Setting";
import { Order, OrderDirection } from "../entity/Order";
import { Transaction } from "../entity/Transaction";

export async function checkPrice(connection: Connection): Promise<void> {
    const orderRepository = connection.getRepository(Order);
    const settingRepository = connection.getRepository(Setting);
    const transactionRepository = connection.getRepository(Transaction);

    const mode = (await settingRepository.findOne({ key: 'mode' }));
    const quote = (await axios.get(`https://cloud.iexapis.com/stable/crypto/XRPAUD/quote?token=${process.env.IEXCLOUD_API_KEY}`)).data;

    if (mode.value === 'buy') {
        console.log(`XRP is at ${quote.latestPrice}, trying to buy at ${parseFloat(quote.low) + ((.5 / 100) * parseFloat(quote.low))}`);

        if (parseFloat(quote.latestPrice) <= parseFloat(quote.low) + ((.5 / 100) * parseFloat(quote.low))) {
            const { balance } = await transactionRepository.createQueryBuilder("transaction").select("SUM(transaction.amount)", "balance").getRawOne();

            const order = new Order();
            order.direction = OrderDirection.BUY;
            order.price = quote.latestPrice;
            order.fee = (.1 / 100) * (balance - (balance / 4));
            order.quantity = ((balance - (balance / 4)) - order.fee) / order.price;
            order.transaction = new Transaction(`Buy XRP at ${order.price}`, order.total() * -1);
            await orderRepository.save(order);

            mode.value = 'sell';
            await settingRepository.save(mode);
        }
    } else if (mode.value === 'sell') {
        const latestOrder = await orderRepository.findOne({ order: { createdAt: 'DESC' }});
        console.log(`XRP is at ${quote.latestPrice}, trying to sell at ${((latestOrder.subtotal() + ((1.5 / 100) * latestOrder.subtotal())) + latestOrder.fee) / latestOrder.quantity}`);

        if (quote.latestPrice * latestOrder.quantity >= (latestOrder.subtotal() + ((1.5 / 100) * latestOrder.subtotal())) + latestOrder.fee) {
            const order = new Order();
            order.direction = OrderDirection.SELL;
            order.price = quote.latestPrice;
            order.fee = (.1 / 100) * (quote.latestPrice * latestOrder.quantity);
            order.quantity = latestOrder.quantity;
            order.transaction = new Transaction(`Sell XRP at ${order.price}`, order.subtotal() - order.fee);
            await orderRepository.save(order);

            mode.value = 'buy';
            await settingRepository.save(mode);
        }
    }
}
