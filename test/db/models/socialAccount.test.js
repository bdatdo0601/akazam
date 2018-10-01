import { expect } from "chai";
import initDB from "../../../src/db";
import SocialAccount, { SocialAccountType } from "../../../src/db/models/socialAccount";
import mockSocialAccountData from "../../../__mock__/data/socialAccount.json";

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

    const validMockSocialAccountTypeData = mockSocialAccountData.socialAccount.map((data, index) => ({
        name: `Mock Data ${index}`,
        input: {
            ...data.socialAccountType,
        },
        expected: {
            ...data.socialAccountType,
        },
    }));

    const validSocialAccountTypeData = [
        {
            input: {},
            expected: {},
            edit: {},
            expectedAfterEdit: {},
        },
    ];

    const nonExistingSocialAccountTypeData = [
        {
            input: {},
        },
    ];

    const invalidSocialAccountTypeData = [
        {
            input: {},
        },
    ];

    describe("Social Account Type Schema", () => {
        describe("Create Data", () => {
            describe("Insert with valid data", () => {
                describe("Insert with mock data", () => {
                    validMockSocialAccountTypeData.forEach(testCase => {
                        it(`should insert to databse with ${testCase.name}`, async () => {
                            const newSocialAccountType = await SocialAccountType.createNew(testCase.input);
                            expect(newSocialAccountType).to.not.be.null;
                            Objects.keys(testCase.expected).forEach(key => {
                                expect(newSocialAccountType[key]).to.equal(testCase.expected[key]);
                            });
                        });
                    });
                });
                describe("Insert with non-existing data", () => {
                    validSocialAccountTypeData.forEach((testCase, index) => {
                        it(`should insert to database with valid data ${index}`, async () => {
                            const newSocialAccountType = await SocialAccountType.createNew(testCase.input);
                            expect(newSocialAccountType).to.not.be.null;
                            Objects.keys(testCase.expected).forEach(key => {
                                expect(newSocialAccountType[key]).to.equal(testCase.expected[key]);
                            });
                        });
                    });
                });
                describe("Insert with existing data", () => {
                    describe("Not allowing update existing", () => {
                        validSocialAccountTypeData.forEach((testCase, index) => {
                            it(`should throw error with existing data ${index}`, async () => {
                                try {
                                    const newSocialAccountType = await SocialAccountType.createNew(
                                        testCase.input,
                                        false
                                    );
                                    expect(newSocialAccountType).to.be.null;
                                } catch (error) {
                                    expect(error).to.not.be.null;
                                }
                            });
                        });
                    });
                    describe("Allowing update existing data", () => {
                        validSocialAccountTypeData.forEach((testCase, index) => {
                            it(`should return updated document with valid data ${index}`, async () => {
                                const newSocialAccountType = await SocialAccountType.createNew(testCase.input, true);
                                expect(newSocialAccountType).to.not.be.null;
                                Objects.keys(testCase.expected).forEach(key => {
                                    expect(newSocialAccountType[key]).to.equal(testCase.expected[key]);
                                });
                            });
                        });
                    });
                });
            });
            describe("Insert with invalid data", () => {
                invalidSocialAccountTypeData.forEach((testCase, index) => {
                    it(`should throw an error with invalid data ${index}`, async () => {
                        try {
                            const newSocialAccountType = await SocialAccountType.createNew(testCase.input);
                            expect(newSocialAccountType).to.be.null;
                        } catch (error) {
                            expect(error).to.not.be.null;
                        }
                    });
                });
            });
        });
        describe("Read Data", () => {
            describe("Read valid inputs", () => {
                describe("Read mock data", () => {});
                describe("Read existing data", () => {});
                describe("Read non-existing data", () => {});
            });
            describe("Read invalid inputs", () => {});
        });
        describe("Edit Data", () => {
            describe("Edit valid inputs", () => {
                describe("Edit existing data", () => {});
                describe("Edit non-existing data", () => {
                    describe("Not-allowing insertion", () => {});
                    describe("Allowing insertion", () => {});
                });
            });
            describe("Edit invalid inputs", () => {});
        });
        describe("Delete Data", () => {
            describe("Delete valid inputs", () => {
                describe("Delete Mock data", () => {});
                describe("Delete Existing Data", () => {});
                describe("Delete Non-Existing Data", () => {});
            });
            describe("Delete invalid inputs", () => {});
        });
    });

    describe("Social Account Schema", () => {
        before(() => {}); // add social account type
        describe("Create Data", () => {});
        describe("Read Data", () => {});
        describe("Edit Data", () => {});
        describe("Delete Data", () => {});
    });

    after(done => {
        mgoose.connection.db.dropDatabase(() => {
            mgoose.connection.close(done);
        });
    });
});
