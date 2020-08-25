import 'reflect-metadata';

import * as cors from 'cors';
import * as express from 'express';
import { Request, Response } from 'express';
import * as cron from 'node-cron';
import { createConnection } from 'typeorm';

import { checkPrice } from './batch/checkPrice';
import { createSnapshot } from './batch/createSnapshot';
import { Snapshot } from './entity/Snapshot';
import { TradeRepository } from './repository/TradeRepository';

createConnection({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: 'trade-bot',
  synchronize: true,
  entities: ['src/entity/**/*.ts'],
}).then(async (connection) => {
  cron.schedule('*/5 * * * *', () => checkPrice(connection));
  cron.schedule('0 0 * * *', () => createSnapshot(connection));

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(express.static(`${__dirname}/static`, { dotfiles: 'allow' }));

  const snapshotRepository = connection.getRepository(Snapshot);
  const tradeRepository = connection.getCustomRepository(TradeRepository);

  app.get('/trades', async (req: Request, res: Response) => {
    res.json(await tradeRepository.find({ order: { createdAt: 'DESC' } }));
  });

  app.get('/snapshots', async (req: Request, res: Response) => {
    res.json(await snapshotRepository.find({ order: { createdAt: 'DESC' } }));
  });

  app.listen(80);
}).catch((error) => console.log(error));
