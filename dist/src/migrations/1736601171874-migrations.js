"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migrations1736601171874 = void 0;
class Migrations1736601171874 {
    constructor() {
        this.name = 'Migrations1736601171874';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "service" ("id" SERIAL NOT NULL, "title" character varying(100) NOT NULL, "description" text NOT NULL, "optional" text, "price" text, "imageUrl" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "createdById" uuid, CONSTRAINT "PK_85a21558c006647cd76fdce044b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bookings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "frequency" character varying(50) NOT NULL, "hoursRequired" integer NOT NULL, "preferredDay" character varying(20), "preferredTime" character varying(20), "meetCleanerFirst" boolean NOT NULL DEFAULT false, "cleaningStartDate" date, "needsIroning" boolean NOT NULL DEFAULT false, "accessInstructions" text, "additionalInfo" text, "referralSource" character varying(100), "title" character varying(20), "firstName" character varying(100), "lastName" character varying(100), "contactNumber" character varying(15), "email" character varying(100), "city" character varying(50), "postalCode" character varying(20), "dirtLevel" character varying(50), "roomSelection" text, "additionalServices" text, "paymentType" character varying(20) NOT NULL, "amount" numeric(10,2) NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "addressStreet" character varying(100), "addressNumber" character varying(50), "addressCity" character varying(50), "addressPostalcode" character varying(20), CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying NOT NULL, "phoneNumber" character varying(15), "address" text, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "title" character varying(255) NOT NULL, "message" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_87cf55c0575ef49843d7bf29397" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_38a69a58a323647f2e75eb994de" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_38a69a58a323647f2e75eb994de"`);
        await queryRunner.query(`ALTER TABLE "service" DROP CONSTRAINT "FK_87cf55c0575ef49843d7bf29397"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "bookings"`);
        await queryRunner.query(`DROP TABLE "service"`);
    }
}
exports.Migrations1736601171874 = Migrations1736601171874;
