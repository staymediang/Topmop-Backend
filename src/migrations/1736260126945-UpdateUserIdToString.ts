import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserIdToString1736260126945 implements MigrationInterface {
    name = 'UpdateUserIdToString1736260126945';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check and drop the foreign key on "service"
        const serviceConstraint = await queryRunner.query(`
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'service'::regclass AND conname = 'FK_87cf55c0575ef49843d7bf29397';
        `);

        if (serviceConstraint.length > 0) {
            await queryRunner.query(`
                ALTER TABLE "service" DROP CONSTRAINT "FK_87cf55c0575ef49843d7bf29397";
            `);
        }

        // Check and drop the foreign key on "bookings"
        const bookingsConstraint = await queryRunner.query(`
            SELECT conname
            FROM pg_constraint
            WHERE conrelid = 'bookings'::regclass AND conname = 'FK_38a69a58a323647f2e75eb994de';
        `);

        if (bookingsConstraint.length > 0) {
            await queryRunner.query(`
                ALTER TABLE "bookings" DROP CONSTRAINT "FK_38a69a58a323647f2e75eb994de";
            `);
        }

        // Change the data type of the "id" column in the "user" table
        await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "id" SET DATA TYPE character varying USING "id"::text;
        `);

        // Change the foreign key columns to match the new data type
        await queryRunner.query(`
            ALTER TABLE "service"
            ALTER COLUMN "createdById" SET DATA TYPE character varying USING "createdById"::text;
        `);
        await queryRunner.query(`
            ALTER TABLE "bookings"
            ALTER COLUMN "userId" SET DATA TYPE character varying USING "userId"::text;
        `);

        // Add the foreign key constraints back
        await queryRunner.query(`
            ALTER TABLE "service"
            ADD CONSTRAINT "FK_87cf55c0575ef49843d7bf29397" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);
        await queryRunner.query(`
            ALTER TABLE "bookings"
            ADD CONSTRAINT "FK_38a69a58a323647f2e75eb994de" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        `);

        // Additional schema modifications
        await queryRunner.query(`
            ALTER TABLE "user"
            ALTER COLUMN "role" SET DEFAULT 'user';
        `);

        await queryRunner.query(`
            ALTER TABLE "bookings" ADD COLUMN "userId" uuid;
        `);
        

        await queryRunner.query(`
            CREATE TABLE "notifications" (
                "id" SERIAL NOT NULL,
                "title" character varying(255) NOT NULL,
                "message" text NOT NULL,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
            );
        `);

        await queryRunner.query(`
            ALTER TABLE "bookings"
            ALTER COLUMN "frequency" TYPE character varying(50),
            ALTER COLUMN "preferredDay" TYPE character varying(20),
            ALTER COLUMN "preferredTime" TYPE character varying(20),
            ALTER COLUMN "cleaningStartDate" TYPE date,
            ALTER COLUMN "accessInstructions" TYPE text,
            ALTER COLUMN "additionalInfo" TYPE text,
            ALTER COLUMN "referralSource" TYPE character varying(100),
            ALTER COLUMN "firstName" TYPE character varying(100),
            ALTER COLUMN "lastName" TYPE character varying(100),
            ALTER COLUMN "contactNumber" TYPE character varying(15),
            ALTER COLUMN "email" TYPE character varying(100),
            ALTER COLUMN "address" TYPE text,
            ALTER COLUMN "city" TYPE character varying(50),
            ALTER COLUMN "postalCode" TYPE character varying(20),
            ALTER COLUMN "paymentType" TYPE character varying(20),
            ALTER COLUMN "amount" SET NOT NULL;
        `);
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
