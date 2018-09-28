import { expect } from "chai";
import initDB from "../../../src/db";

require("dotenv").config();

const env = process.env;

const DB_TEST_URI = `mongodb://${env.DB_TEST_USER === "" ? "" : `${env.DB_TEST_USER}:${env.DB_TEST_PASS}@`}${
    env.DB_TEST_HOSTNAME
}:${env.DB_TEST_PORT}/${env.DB_TEST_NAME}`;

const MONGOOSE_TEST_OPTS = {
    useNewUrlParser: true,
};

let mgoose = null;

describe("Social Account Model Test", () => {
    before(async () => {
        mgoose = await initDB(DB_TEST_URI, MONGOOSE_TEST_OPTS);
    });

    after(done => {
        mgoose.connection.db.dropDatabase(() => {
            mgoose.connection.close(done);
        });
    });
});
