import { Column, Entity } from "typeorm";
import { Base } from "./Base";

@Entity()
export class Transaction extends Base {
    @Column()
    description: string;

    @Column('decimal')
    amount: number;
    
    constructor(description: string, amount: number) {
        super();
        this.description = description;
        this.amount = amount;
    }
}
