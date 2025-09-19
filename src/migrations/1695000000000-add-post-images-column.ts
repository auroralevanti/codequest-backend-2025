import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPostImagesColumn1695000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('posts', new TableColumn({
      name: 'images',
      type: 'json',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('posts', 'images');
  }
}
