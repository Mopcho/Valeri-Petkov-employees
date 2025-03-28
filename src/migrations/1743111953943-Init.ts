import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1743111953943 implements MigrationInterface {
    name = 'Init1743111953943'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "project" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee_project_record" ("id" SERIAL NOT NULL, "employeeId" integer NOT NULL, "projectId" integer NOT NULL, "from" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "to" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f12e993a0bffba41c826e94fbe4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employee" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "password" character varying NOT NULL, CONSTRAINT "PK_3c2bc72f03fd5abbbc5ac169498" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "employee_project_record" ADD CONSTRAINT "FK_ec5aa51e4744a1aaa41c66bea39" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE RESTRICT`);
        await queryRunner.query(`ALTER TABLE "employee_project_record" ADD CONSTRAINT "FK_27f706cfff89e2f9796f8d2a7a3" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE RESTRICT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employee_project_record" DROP CONSTRAINT "FK_27f706cfff89e2f9796f8d2a7a3"`);
        await queryRunner.query(`ALTER TABLE "employee_project_record" DROP CONSTRAINT "FK_ec5aa51e4744a1aaa41c66bea39"`);
        await queryRunner.query(`DROP TABLE "employee"`);
        await queryRunner.query(`DROP TABLE "employee_project_record"`);
        await queryRunner.query(`DROP TABLE "project"`);
    }

}
