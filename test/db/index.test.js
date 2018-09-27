import mongoose, { Schema } from "mongoose";
import { expect } from "chai";
import initDB from "../../src/db";

require("dotenv").config();

const env = process.env;

const DB_TEST_URI = `mongodb://${env.DB_TEST_USER}:${env.DB_TEST_PASS}@${env.DB_TEST_HOSTNAME}:${env.DB_TEST_PORT}/${
    env.DB_TEST_NAME
}`;

const MONGOOSE_TEST_OPTS = {
    useNewUrlParser: true,
};

const TestSchema = new Schema({
    foo: { type: String, required: true },
});

const TestModel = mongoose.model("Test", TestSchema);

let mgoose = null;

describe("Database General Functionality", () => {
    describe("Establishing connection with test database", () => {
        it("should throw error if input is invalid", done => {
            mgoose = initDB()
                .then(() => {
                    done(new Error("Invalid input should not create connection"));
                })
                .catch(() => {
                    done();
                });
        });

        it("should established a native mongoose connection object if input is valid", async () => {
            mgoose = await initDB(DB_TEST_URI, MONGOOSE_TEST_OPTS);
            expect(mgoose).to.not.be.null;
        });

        after(done => {
            if (mgoose) {
                mgoose.connection.close(done);
            } else {
                done();
            }
        });
    });

    describe("Communication with database connection", async () => {
        before(async () => {
            mgoose = await initDB(DB_TEST_URI, MONGOOSE_TEST_OPTS);
            mgoose.connection.db.dropDatabase();
        });

        describe("Interact with database", () => {
            it("new test document with foo value of bar", done => {
                const testDoc = new TestModel({ foo: "bar" });
                testDoc.save(done);
            });

            it("does not save incorrect format to database", done => {
                const incorrectTestDoc = new TestModel({ foz: "baz" });
                incorrectTestDoc.save(err => {
                    if (err) done();
                    else done(new Error("Incorrect format should not be stored"));
                });
            });

            it("retrieves data from database", done => {
                TestModel.find({ foo: "bar" }, (err, result) => {
                    if (err) done(err);
                    else if (result.length === 0) done(new Error("Should be able to retrieve data"));
                    else done();
                });
            });
        });

        after(done => {
            mgoose.connection.close(done);
        });
    });
});
