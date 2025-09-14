import 'dotenv/config';
import { DataSource } from 'typeorm';
import { envs } from './config';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: envs.dbUrl,
  synchronize: false,
  logging: false,
  entities: [__dirname + '/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
});

export default AppDataSource;
