"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBookingTable1740756699850 = void 0;
class UpdateBookingTable1740756699850 {
    constructor() {
        this.name = 'UpdateBookingTable1740756699850';
    }
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "service" ADD CONSTRAINT "FK_87cf55c0575ef49843d7bf29397" 
            FOREIGN KEY ("createdById") REFERENCES "user"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bookings" ADD CONSTRAINT "FK_38a69a58a323647f2e75eb994de" 
            FOREIGN KEY ("userId") REFERENCES "user"("id") 
            ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "bookings" DROP CONSTRAINT "FK_38a69a58a323647f2e75eb994de"`);
        await queryRunner.query(`ALTER TABLE "service" DROP CONSTRAINT "FK_87cf55c0575ef49843d7bf29397"`);
    }
}
exports.UpdateBookingTable1740756699850 = UpdateBookingTable1740756699850;
