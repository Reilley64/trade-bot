import { Column, Entity } from 'typeorm';

import { Base } from './Base';

@Entity()
export class Setting extends Base {
  @Column()
  key: string;

  @Column()
  value: string;
}
