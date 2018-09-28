import { expect } from "chai";
import initDB from "../../../src/db";
import Location from "../../../src/db/models/location";

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

    const validTestData = [
        {
            name: "valid data 1",
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
            name: "valid data 2",
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
            name: "valid data 3",
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
            name: "valid data 4",
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
                city: "",
                state: "",
                zipCode: "",
            },
        },
    ];

    const nonExistingInputs = [
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
    ];

    const invalidInputs = [
        {
            name: "Invalid Input 1",
            input: {
                name: undefined,
            },
        },
        {
            name: "Invalid Input 2",
            input: {
                name: null,
            },
        },
        {
            name: "Invalid Input 3",
            input: {
                name: false,
            },
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
                        expect(error).to.not.be.null;
                    }
                });
            });
        });
        describe("Insert to database with invalid data", () => {
            const invalidTestData = [
                {
                    name: "Invalid Test Case 1",
                    input: {
                        address: "Foo Bar",
                    },
                },
                {
                    name: "Invalid Test Case 1",
                    input: {
                        name: "Yo",
                        foo: "bar",
                        address: "Foo Bar",
                    },
                },
                {
                    name: "Invalid Test Case 2",
                    input: {},
                },
                {
                    name: "Invalid Test Case 3", // Duplicated with valid test case
                    input: {
                        name: "Dat's Home",
                        address: "124 North Throndike street, Cambridge MA 02141",
                    },
                },
            ];
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
        describe("Retriving Existing Data", () => {
            validTestData.forEach(testCase => {
                it(`should return data if with ${testCase.name}`, async () => {
                    try {
                        const location = await Location.getLocationFromName(testCase.input.name);
                        expect(location).to.not.be.null;
                        Object.keys(testCase.expected).forEach(key => {
                            expect(location[key]).to.equal(testCase.expected[key]);
                        });
                    } catch (error) {
                        expect(error).to.be.null;
                    }
                });
            });
        });
        describe("Retriving Non-existing data", () => {
            nonExistingInputs.forEach(testCase => {
                it(`should return null with ${testCase.name}`, async () => {
                    try {
                        const location = await Location.getLocationFromName(testCase.input.name);
                        expect(location).to.be.null;
                    } catch (error) {
                        expect(error).to.be.null;
                    }
                });
            });
        });
        describe("Retriving with invalid inputs", () => {
            invalidInputs.forEach(testCase => {
                it(`should throw error with ${testCase.name}`, async () => {
                    try {
                        await Location.getLocationFromName(testCase.input.name);
                    } catch (error) {
                        expect(error).to.not.be.null;
                    }
                });
            });
        });
    });
    describe("Updating Data", () => {
        describe("Update Existing Data", () => {
            validTestData.forEach(testCase => {
                it(`should update the data in database with ${testCase.name}`, async () => {
                    try {
                        const location = await Location.updateLocationByName(testCase.input.name, testCase.updateValue);
                        expect(location).to.not.be.null;
                        Object.keys(testCase.expectedAfterUpdate).forEach(key => {
                            expect(location[key]).to.equal(testCase.expectedAfterUpdate[key]);
                        });
                    } catch (error) {
                        expect(error).to.not.be.null;
                    }
                });
            });
        });
        describe("Update Non-existing Data", () => {
            describe("Insert data if not existed", () => {
                const insertedData = [
                    {
                        name: "Inserting Data Using Edit 1",
                        input: {
                            name: "Goo's house",
                            address: "187 Broadway street, Somerville MA 02145",
                        },
                        expected: {
                            name: "Goo's house",
                            address: "187 Broadway street",
                            city: "Somerville",
                            state: "MA",
                            zipCode: "02145",
                        },
                    },
                ];
                insertedData.forEach(testCase => {
                    it(`should return inserted data from ${testCase.name}`, async () => {
                        try {
                            const location = await Location.updateLocationByName(
                                testCase.input.name,
                                testCase.input,
                                true
                            );
                            expect(location).to.not.be.null;
                            Object.keys(testCase.expected).forEach(key => {
                                expect(location[key]).to.equal(testCase.expected[key]);
                            });
                        } catch (error) {
                            expect(error).to.not.be.null;
                        }
                    });
                });
            });
            describe("Not Insert data if not existed", () => {
                const nonExistedData = [
                    {
                        name: "Non Existing Data 1",
                        input: {
                            name: "yoo",
                            address: "yaz",
                        },
                    },
                ];
                nonExistedData.forEach(testCase => {
                    it(`should return null with ${testCase.name}`, async () => {
                        try {
                            const location = await Location.updateLocationByName(
                                testCase.input.name,
                                testCase.input,
                                false
                            );
                            expect(location).to.be.null;
                        } catch (error) {
                            expect(error).to.not.be.null;
                        }
                    });
                });
            });
        });
        describe("Update with invalid inputs", () => {
            invalidInputs.forEach(testCase => {
                it(`should throw error with ${testCase.name}`, async () => {
                    try {
                        await Location.updateLocationByName(testCase.input.name);
                    } catch (error) {
                        expect(error).to.not.be.null;
                    }
                });
            });
        });
    });
    describe("Deleting Data", () => {
        describe("Delete existing data", () => {
            validTestData.forEach(testCase => {
                it(`should return true with ${testCase.name}`, async () => {
                    try {
                        const isDeleted = await Location.deleteLocationByName(testCase.input.name);
                        expect(isDeleted).to.be.true;
                    } catch (error) {
                        expect(error).to.be.null;
                    }
                });
            });
        });
        describe("Delete non existing data", () => {
            nonExistingInputs.forEach(testCase => {
                it(`should throw error with ${testCase.name}`, async () => {
                    try {
                        await Location.deleteLocationByName(testCase.input.name);
                        expect(location).to.be.null;
                    } catch (error) {
                        expect(error).to.not.be.null;
                    }
                });
            });
        });
        describe("Delete data with invalid input", () => {
            invalidInputs.forEach(testCase => {
                it(`should throw error with ${testCase.name}`, async () => {
                    try {
                        await Location.deleteLocationByName(testCase.input.name);
                    } catch (error) {
                        expect(error).to.not.be.null;
                    }
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
