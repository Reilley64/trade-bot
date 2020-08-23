import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Base } from "./Base";
import { Transaction } from "./Transaction";

export enum OrderDirection {
    BUY = 'BUY', SELL = 'SELL'
}

@Entity()
export class Order extends Base {
    @Column('enum', { enum: OrderDirection })
    direction: OrderDirection;

    @Column('decimal')
    price: number;

    @Column('decimal')
    quantity: number;

    @Column('decimal')
    fee: number;

    @OneToOne(() => Transaction, { cascade: true })
    @JoinColumn()
    transaction: Transaction;
}
