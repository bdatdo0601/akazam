import { expect, assert } from "chai";
import initDB from "../../../src/db";
import Location from "../../../src/db/models/location";

require("dotenv").config();

const env = process.env;

const DB_TEST_URI = `mongodb://${env.DB_TEST_USER}:${env.DB_TEST_PASS}@${env.DB_TEST_HOSTNAME}:${env.DB_TEST_PORT}/${
    env.DB_TEST_NAME
}`;

const MONGOOSE_TEST_OPTS = {
    useNewUrlParser: true,
};

let mgoose = null;

describe("Location Model Test", () => {
    before(async () => {
        mgoose = await initDB(DB_TEST_URI, MONGOOSE_TEST_OPTS);
    });

    const validTestData = [
        {
            name: "valid data 1",
            input: {
                name: "Foo",
                address: "Bar",
            },
            expected: {
                name: "Foo",
                address: "Bar",
            },
        },
        {
            name: "valid data 2",
            input: {
                name: "Dat's Home",
                address: "1100 Throndike street",
            },
            expected: {
                name: "Dat's Home",
                address: "1100 Throndike street",
            },
        },
        {
            name: "valid data 3",
            input: {
                name: "Dat's Home",
                address: "124 Throndike street, Cambridge MA 02141",
            },
            expected: {
                name: "Dat's Home",
                address: "124 Throndike St",
                city: "Cambridge",
                state: "MA",
                zipCode: "02141",
            },
        },
        {
            name: "valid data 4",
            input: {
                name: "Dat's Home",
                address: "124 North Throndike street, Cambridge MA 02141",
            },
            expected: {
                name: "Dat's Home",
                address: "124 N Throndike St",
                city: "Cambridge",
                state: "MA",
                zipCode: "02141",
            },
        },
    ];

    const invalidTestData = [
        {
            name: "Invalid Test Case 1",
            input: {
                address: "Foo Bar",
            },
        },
        {
            name: "Invalid Test Case 2",
            input: {},
        },
    ];

    describe("Creating New Data", () => {
        describe("Insert to database with valid data", () => {
            validTestData.forEach(testCase => {
                it(`should insert to database with ${testCase.name}`, async () => {
                    try {
                        const newLocation = await Location.createNewLocation(testCase.input);
                        expect(newLocation).to.not.be.null;
                        Object.keys(testCase.expected).forEach(key => {
                            expect(newLocation[key]).to.equal(testCase.expected[key]);
                        });
                    } catch (error) {
                        assert.fail(error, null, error);
                    }
                });
            });
        });
        describe("Insert to database with invalid data", () => {
            invalidTestData.forEach(testCase => {
                it(`Should throw error with ${testCase.name}`, async () => {
                    try {
                        await Location.createNewLocation(testCase.input);
                    } catch (error) {
                        expect(error).to.not.be.null;
                    }
                });
            });
        });
    });
    describe("Reading Stored Data", () => {
        it("should return data if it exist", () => {});
        it("should return null if data not exist", () => {});
    });
    describe("Updating Existing Data", () => {
        it("should update data if it exist", () => {});
        it("should throw error if data does not exist", () => {});
    });
    describe("Deleting Existing Data", () => {
        it("should delete data if it exist", () => {});
        it("should throw error if data does not exist", () => {});
    });
    after(done => {
        mgoose.connection.db.dropDatabase(() => {
            mgoose.connection.close(done);
        });
    });
});
