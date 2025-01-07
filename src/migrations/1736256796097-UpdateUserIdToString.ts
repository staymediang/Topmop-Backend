import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserIdToString1736256796097 implements MigrationInterface {
    name = 'UpdateUserIdToString1736256796097'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "frequency"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "frequency" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "preferredDay"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "preferredDay" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "preferredTime"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "preferredTime" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "cleaningStartDate"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "cleaningStartDate" date`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "accessInstructions"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "accessInstructions" text`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "additionalInfo"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "additionalInfo" text`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "referralSource"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "referralSource" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "firstName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "lastName" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "contactNumber"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "contactNumber" character varying(15) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "email" character varying(100) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "address" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "city" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "postalCode"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "postalCode" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "paymentType"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "paymentType" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "amount" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_87cf55c0575ef49843d7bf29397" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service" DROP CONSTRAINT "FK_87cf55c0575ef49843d7bf29397"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "amount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "paymentType"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "paymentType" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "postalCode"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "postalCode" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "city" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "address" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "email" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "contactNumber"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "contactNumber" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "lastName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "firstName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "referralSource"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "referralSource" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "additionalInfo"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "additionalInfo" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "accessInstructions"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "accessInstructions" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "cleaningStartDate"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "cleaningStartDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "preferredTime"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "preferredTime" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "preferredDay"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "preferredDay" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "frequency"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "frequency" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
