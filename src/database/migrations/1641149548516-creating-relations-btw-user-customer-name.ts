import {MigrationInterface, QueryRunner} from "typeorm";

export class creatingRelationsBtwUserCustomerName1641149548516 implements MigrationInterface {
    name = 'creatingRelationsBtwUserCustomerName1641149548516'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_6c687a8fa35b0ae35ce766b56ce"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "customerId" TO "user_id"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "REL_6c687a8fa35b0ae35ce766b56c" TO "UQ_758b8ce7c18b9d347461b30228d"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_758b8ce7c18b9d347461b30228d" FOREIGN KEY ("user_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_758b8ce7c18b9d347461b30228d"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME CONSTRAINT "UQ_758b8ce7c18b9d347461b30228d" TO "REL_6c687a8fa35b0ae35ce766b56c"`);
        await queryRunner.query(`ALTER TABLE "user" RENAME COLUMN "user_id" TO "customerId"`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_6c687a8fa35b0ae35ce766b56ce" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
