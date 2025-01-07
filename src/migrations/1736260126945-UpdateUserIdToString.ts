import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserIdToString1736260126945 implements MigrationInterface {
    name = 'UpdateUserIdToString1736260126945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying(15), "address" text, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "message" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "service" ADD "createdById" uuid`);
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
        await queryRunner.query(`ALTER TABLE "bookings" ADD "firstName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "lastName" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "contactNumber"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "contactNumber" character varying(15)`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "email" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "address" text`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "city" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "postalCode"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "postalCode" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "paymentType"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "paymentType" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "amount" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_87cf55c0575ef49843d7bf29397" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_38a69a58a323647f2e75eb994de" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_38a69a58a323647f2e75eb994de"`);
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
        await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "service" ADD "createdById" integer`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "userId"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
