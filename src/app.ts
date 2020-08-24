import "reflect-metadata";

import * as cors from "cors";
import * as cron from "node-cron";
import * as express from "express";
import * as https from "https";
import * as fs from "fs";
import { createConnection } from "typeorm";
import { Request, Response } from "express";
import { Order } from "./entity/Order";
import { checkPrice } from "./batch/checkPrice";
import { Transaction } from "./entity/Transaction";

createConnection({
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: 'trade-bot',
    synchronize: false,
    logging: false,
    entities: [ "src/entity/**/*.ts" ],
}).then(async connection => {
    cron.schedule('*/5 * * * *', () => checkPrice(connection));

    const app = express();
    app.use(cors());
    app.use(express.json());

    const orderRepository = connection.getRepository(Order);
    const transactionRepository = connection.getRepository(Transaction);

    app.get("/orders", async (req: Request, res: Response) => {
        res.json(await orderRepository.find({ order: { createdAt: 'DESC' }}));
    })

    app.get("/transactions", async (req: Request, res: Response) => {
        res.json(await transactionRepository.find({ order: { createdAt: 'DESC' }}));
    })

    app.post("/transactions", async (req: Request, res: Response) => {
        const transaction = await transactionRepository.create(req.body);
        res.json(await transactionRepository.save(transaction));
    })

    https
        .createServer({
            key: fs.readFileSync('./key.pem'),
            cert: fs.readFileSync('./cert.pem'),
            passphrase: process.env.PEM_PHRASE,
        }, app)
        .listen(8080);
}).catch(error => console.log(error));
