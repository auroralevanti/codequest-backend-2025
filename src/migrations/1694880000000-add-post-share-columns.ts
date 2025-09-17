import { MigrationInterface, QueryRunner } from "typeorm";

export class addPostShareColumns1694880000000 implements MigrationInterface {
  name = 'addPostShareColumns1694880000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "share_token" character varying(128)`);
    await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "share_expires_at" timestamptz`);
    await queryRunner.query(`ALTER TABLE "posts" ADD COLUMN "share_is_active" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_posts_share_token" ON "posts" ("share_token") WHERE "share_token" IS NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_posts_share_token"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "share_is_active"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "share_expires_at"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "share_token"`);
  }
}
