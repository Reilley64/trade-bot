import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";

export abstract class Base {
    @PrimaryGeneratedColumn("uuid")
    uuid: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
