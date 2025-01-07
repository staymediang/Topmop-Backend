"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserIdToString1736260126945 = void 0;
class UpdateUserIdToString1736260126945 {
    constructor() {
        this.name = 'UpdateUserIdToString1736260126945';
    }
    async up(queryRunner) {
        // Alter the "user" table instead of creating it again
        await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "id" TYPE character varying USING id::text;  -- Change UUID to string
            ALTER COLUMN "role" SET DEFAULT 'user';  -- Set default role if not already set
        `);
        // Create "notifications" table
        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" SERIAL NOT NULL, 
                "title" character varying(255) NOT NULL, 
                "message" text NOT NULL, 
                "isActive" boolean NOT NULL DEFAULT true, 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
            )
        `);
        // Add userId to bookings
        await queryRunner.query(`ALTER TABLE "bookings" ADD "userId" uuid NOT NULL`);
        // Modify columns in the "service" table
        await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "service" ADD "createdById" uuid`);
        // Alter various columns in the "bookings" table
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "frequency" TYPE character varying(50)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "preferredDay" TYPE character varying(20)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "preferredTime" TYPE character varying(20)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "cleaningStartDate" TYPE date`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "accessInstructions" TYPE text`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "additionalInfo" TYPE text`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "referralSource" TYPE character varying(100)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "firstName" TYPE character varying(100)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "lastName" TYPE character varying(100)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "contactNumber" TYPE character varying(15)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "email" TYPE character varying(100)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "address" TYPE text`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "city" TYPE character varying(50)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "postalCode" TYPE character varying(20)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "paymentType" TYPE character varying(20)`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "amount" SET NOT NULL`);
        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_87cf55c0575ef49843d7bf29397" FOREIGN KEY ("createdById") REFERENCES "user"("id")`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_38a69a58a323647f2e75eb994de" FOREIGN KEY ("userId") REFERENCES "user"("id")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_38a69a58a323647f2e75eb994de"`);
        await queryRunner.query(`ALTER TABLE "service" DROP CONSTRAINT "FK_87cf55c0575ef49843d7bf29397"`);
        await queryRunner.query(`ALTER TABLE "bookings" ALTER COLUMN "amount" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "paymentType"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "paymentType" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "postalCode"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "postalCode" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "city"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "city" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "email" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "contactNumber"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "contactNumber" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "lastName" character varying`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD "firstName" character varying`);
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
        await queryRunner.query(`ALTER TABLE "bookings" ADD "frequency" character varying`);
        await queryRunner.query(`ALTER TABLE "service" DROP COLUMN "createdById"`);
        await queryRunner.query(`ALTER TABLE "service" ADD "createdById" uuid`);
        await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "userId"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
    }
}
exports.UpdateUserIdToString1736260126945 = UpdateUserIdToString1736260126945;
