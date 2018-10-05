import chai, { expect } from "chai";
import initDB, { ERROR_MESSAGES } from "../../../src/db";
import Location from "../../../src/db/models/location";
import mockLocationData from "../../../__mock__/data/location.json";

chai.use(require("chai-like"));
chai.use(require("chai-as-promised"));

require("dotenv").config();

const env = process.env;

const DB_TEST_URI = `mongodb://${env.DB_TEST_USER === "" ? "" : `${env.DB_TEST_USER}:${env.DB_TEST_PASS}@`}${
    env.DB_TEST_HOSTNAME
}:${env.DB_TEST_PORT}/${env.DB_TEST_NAME}`;

const MONGOOSE_TEST_OPTS = {
    useNewUrlParser: true,
};

let mgoose = null;

describe("Location Model Test", () => {
    before(async () => {
        mgoose = await initDB(DB_TEST_URI, MONGOOSE_TEST_OPTS);
    });

    const validMockLocationData = mockLocationData.location.map((item, index) => ({
        name: `mock data ${index}`,
        input: item,
        expected: item,
    }));

    const validLocationData = [
        {
            input: {
                name: "Foo",
                address: "Bar",
            },
            updateValue: {
                address: "Baz",
            },
            expected: {
                name: "Foo",
                address: "Bar",
            },
            expectedAfterUpdate: {
                name: "Foo",
                address: "Baz",
            },
        },
        {
            input: {
                name: "Foo's Home",
                address: "1100 Throndike street",
            },
            updateValue: {
                name: "Bar's Home",
                address: "10 Thorndike street",
            },
            expected: {
                name: "Foo's Home",
                address: "1100 Throndike street",
            },
            expectedAfterUpdate: {
                name: "Bar's Home",
                address: "10 Thorndike street",
            },
        },
        {
            input: {
                name: "Bar's Home",
                address: "124 Throndike street, Cambridge MA 02141",
            },
            updateValue: {
                name: "Bar's Home",
                address: "124 Throndike street, Somerville MA 02145",
            },
            expected: {
                name: "Bar's Home",
                address: "124 Throndike St",
                city: "Cambridge",
                state: "MA",
                zipCode: "02141",
            },
            expectedAfterUpdate: {
                name: "Bar's Home",
                address: "124 Throndike St",
                city: "Somerville",
                state: "MA",
                zipCode: "02145",
            },
        },
        {
            input: {
                name: "Baz's Home",
                address: "124 North Throndike street, Cambridge MA 02141",
            },
            updateValue: {
                name: "Baz's Home",
                address: "124 South Throndike street",
            },
            expected: {
                name: "Baz's Home",
                address: "124 N Throndike St",
                city: "Cambridge",
                state: "MA",
                zipCode: "02141",
            },
            expectedAfterUpdate: {
                name: "Baz's Home",
                address: "124 South Throndike street",
            },
        },
    ];

    const nonExistingLocationToBeInsertedData = [
        {
            input: {
                name: "Goo's house",
                address: "187 Broadway street, Somerville MA 02145",
            },
            expected: {
                name: "Goo's house",
                address: "187 Broadway St",
                city: "Somerville",
                state: "MA",
                zipCode: "02145",
            },
        },
    ];

    const nonExistingLocationToNotBeInsertedData = [
        {
            name: "Non Existing Input 1",
            input: {
                name: "fosoos",
            },
        },
        {
            name: "Non Existing Input 2",
            input: {
                name: "fooosff",
            },
        },
        {
            name: "Non Existing Data 1",
            input: {
                name: "yoo",
                address: "yaz",
            },
        },
    ];

    const invalidLocationData = [
        {
            input: {
                name: undefined,
            },
        },
        {
            input: {
                name: null,
            },
        },
        {
            input: {
                name: false,
            },
        },
        {
            input: {
                address: "Foo Bar",
            },
        },
        {
            input: {
                foo: "bar",
                address: "Foo Bar",
            },
        },
        {
            input: {},
        },
    ];

    describe("Creating New Data", () => {
        describe("Insert to database with mock data", () => {
            validMockLocationData.forEach(testCase => {
                it(`should insert to database with ${testCase.name}`, async () => {
                    const newLocation = await Location.createNew(testCase.input);
                    expect(newLocation).to.be.like(testCase.expected);
                });
            });
        });
        describe("Insert to database with valid data", () => {
            describe("Insert with non-existing data", () => {
                validLocationData.forEach((testCase, index) => {
                    it(`should insert to database with valid data ${index}`, async () => {
                        const newLocation = await Location.createNew(testCase.input);
                        expect(newLocation).to.be.like(testCase.expected);
                    });
                });
            });
            describe("Insert with existing data", () => {
                describe("Not allowing update existing data", () => {
                    validLocationData.forEach((testCase, index) => {
                        it(`should return existed data with existing data ${index}`, async () => {
                            const newLocation = await Location.createNew(testCase.input, false);
                            expect(newLocation).to.be.like(testCase.expected);
                        });
                    });
                });
                describe("Allowing update existing data", () => {
                    validLocationData.forEach((testCase, index) => {
                        it(`should return updated data with existing data ${index}`, async () => {
                            const newLocation = await Location.createNew(testCase.input, true);
                            expect(newLocation).to.be.like(testCase.expected);
                        });
                    });
                });
            });
        });
        describe("Insert to database with invalid data", () => {
            invalidLocationData.forEach((testCase, index) => {
                it(`Should throw error with invalid data ${index}`, async () => {
                    await expect(Location.createNew(testCase.input)).to.eventually.be.rejectedWith(
                        ERROR_MESSAGES.GENERAL.INSERT_ERROR
                    );
                });
            });
        });
    });
    describe("Reading Stored Data", () => {
        describe("Retriving Existing Data", () => {
            validMockLocationData.forEach(testCase => {
                it(`should return data with ${testCase.name}`, async () => {
                    const location = await Location.getLocationFromName(testCase.input.name);
                    expect(location).to.be.like(testCase.expected);
                });
            });
            validLocationData.forEach((testCase, index) => {
                it(`should return data with valid data ${index}`, async () => {
                    const location = await Location.getLocationFromName(testCase.input.name);
                    expect(location).to.be.like(testCase.expected);
                });
            });
        });
        describe("Retriving Non-existing data", () => {
            nonExistingLocationToBeInsertedData
                .concat(nonExistingLocationToNotBeInsertedData)
                .forEach((testCase, index) => {
                    it(`should return null with non existing data ${index}`, async () => {
                        const location = await Location.getLocationFromName(testCase.input.name);
                        expect(location).to.be.null;
                    });
                });
        });
        describe("Retriving with invalid inputs", () => {
            invalidLocationData.forEach((testCase, index) => {
                it(`should throw error with invalid data ${index}`, async () => {
                    await expect(Location.getLocationFromName(testCase.input.name)).to.eventually.be.rejectedWith(
                        ERROR_MESSAGES.GENERAL.READ_ERROR
                    );
                });
            });
        });
    });
    describe("Updating Data", () => {
        describe("Update Existing Data", () => {
            validLocationData.forEach((testCase, index) => {
                it(`should update the data in database with valid data ${index}`, async () => {
                    const location = await Location.updateLocationByName(testCase.input.name, testCase.updateValue);
                    expect(location).to.be.like(testCase.expectedAfterUpdate);
                });
            });
        });
        describe("Update Non-existing Data", () => {
            describe("Insert data if not existed", () => {
                nonExistingLocationToBeInsertedData.forEach((testCase, index) => {
                    it(`should return inserted data from non-existing data ${index}`, async () => {
                        const location = await Location.updateLocationByName(testCase.input.name, testCase.input, true);
                        expect(location).to.be.like(testCase.expected);
                    });
                });
            });
            describe("Not Insert data if not existed", () => {
                nonExistingLocationToNotBeInsertedData.forEach((testCase, index) => {
                    it(`should return null with non-existing data ${index}`, async () => {
                        const location = await Location.updateLocationByName(testCase.input.name, testCase.input);
                        expect(location).to.be.null;
                    });
                });
            });
        });
        describe("Update with invalid inputs", () => {
            invalidLocationData.forEach((testCase, index) => {
                it(`should throw error with invalid data ${index}`, async () => {
                    await expect(Location.updateLocationByName(testCase.input.name)).to.eventually.be.rejectedWith(
                        ERROR_MESSAGES.GENERAL.UPDATE_ERROR
                    );
                });
            });
        });
    });
    describe("Deleting Data", () => {
        describe("Delete existing data", () => {
            validMockLocationData.forEach(testCase => {
                it(`should return true with ${testCase.name}`, async () => {
                    const isDeleted = await Location.deleteLocationByName(testCase.input.name);
                    expect(isDeleted).to.be.true;
                });
            });
            validLocationData.forEach((testCase, index) => {
                it(`should return true with valid data ${index}`, async () => {
                    const isDeleted = await Location.deleteLocationByName(testCase.input.name);
                    expect(isDeleted).to.be.true;
                });
            });
        });
        describe("Delete non existing data", () => {
            nonExistingLocationToNotBeInsertedData.forEach((testCase, index) => {
                it(`should return false with non-existing data ${index}`, async () => {
                    const isDeleted = await Location.deleteLocationByName(testCase.input.name);
                    expect(isDeleted).to.be.false;
                });
            });
        });
        describe("Delete data with invalid input", () => {
            invalidLocationData.forEach((testCase, index) => {
                it(`should throw error with invalid data ${index}`, async () => {
                    await expect(Location.deleteLocationByName(testCase.input.name)).to.eventually.be.rejectedWith(
                        ERROR_MESSAGES.GENERAL.DELETE_ERROR
                    );
                });
            });
        });
    });
    after(done => {
        mgoose.connection.db.dropDatabase(() => {
            mgoose.connection.close(done);
        });
    });
});
