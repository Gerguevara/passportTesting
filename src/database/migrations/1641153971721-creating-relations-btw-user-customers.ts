import {MigrationInterface, QueryRunner} from "typeorm";

export class creatingRelationsBtwUserCustomers1641153971721 implements MigrationInterface {
    name = 'creatingRelationsBtwUserCustomers1641153971721'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_758b8ce7c18b9d347461b30228d"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "customer_id_seq" OWNED BY "customer"."id"`);
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "id" SET DEFAULT nextval('"customer_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_758b8ce7c18b9d347461b30228d" FOREIGN KEY ("user_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_758b8ce7c18b9d347461b30228d"`);
        await queryRunner.query(`ALTER TABLE "customer" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "customer_id_seq"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_758b8ce7c18b9d347461b30228d" FOREIGN KEY ("user_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
