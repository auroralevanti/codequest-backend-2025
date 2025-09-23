import { MigrationInterface, QueryRunner } from "typeorm";

export class addDiscordIdToUsers1694960000000 implements MigrationInterface {
  name = 'addDiscordIdToUsers1694960000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add nullable discord_id column
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "discord_id" character varying(64)`);
    // Add unique index on discord_id when not null
    await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_discord_id" ON "users" ("discord_id") WHERE "discord_id" IS NOT NULL`);

    // Optionally: If you have a mapping of existing discord IDs to users, you could update them here.
    // For now, we leave existing rows with NULL discord_id.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_discord_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "discord_id"`);
  }
}
