import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateBookingTable1740756699850 implements MigrationInterface {
    name = 'UpdateBookingTable1740756699850'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "service" ADD CONSTRAINT "FK_87cf55c0575ef49843d7bf29397" 
            FOREIGN KEY ("createdById") REFERENCES "user"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION`
        );

        await queryRunner.query(
            `ALTER TABLE "bookings" ADD CONSTRAINT "FK_38a69a58a323647f2e75eb994de" 
            FOREIGN KEY ("userId") REFERENCES "user"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "bookings" DROP CONSTRAINT "FK_38a69a58a323647f2e75eb994de"`
        );

        await queryRunner.query(
            `ALTER TABLE "service" DROP CONSTRAINT "FK_87cf55c0575ef49843d7bf29397"`
        );
    }
}
