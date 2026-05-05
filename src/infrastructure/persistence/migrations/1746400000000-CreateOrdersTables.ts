import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTables1746400000000 implements MigrationInterface {
  name = 'CreateOrdersTables1746400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id"          uuid          NOT NULL,
        "customer_id" uuid          NOT NULL,
        "status"      varchar(20)   NOT NULL,
        "total"       decimal(10,2) NOT NULL,
        "created_at"  TIMESTAMP     NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP     NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id"         uuid          NOT NULL,
        "product_id" uuid          NOT NULL,
        "name"       varchar(255)  NOT NULL,
        "price"      decimal(10,2) NOT NULL,
        "quantity"   integer       NOT NULL,
        "order_id"   uuid,
        CONSTRAINT "PK_order_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_order"
          FOREIGN KEY ("order_id")
          REFERENCES "orders"("id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
  }
}
