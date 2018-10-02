import { expect } from "chai";
import initDB from "../../../src/db";
import _ from "lodash";
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

    const validMockSocialAccountTypeData = _.uniqBy(
        mockSocialAccountData.socialAccount,
        item => item.socialAccountType.socialAccountTypeName
    ).map((data, index) => ({
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
            input: { socialAccountTypeName: "Slack", link: "http://slack.com" },
            expected: { socialAccountTypeName: "Slack", link: "http://slack.com" },
            edit: { socialAccountTypeName: "Slack", link: "http://slack.org" },
            expectedAfterEdit: { socialAccountTypeName: "Slack", link: "http://slack.org" },
        },
    ];

    const nonExistingSocialAccountTypeToBeInsertedData = [
        { input: { socialAccountTypeName: "voodoo", link: "http://voodoo.com" } },
    ];

    const nonExistingSocialAccountTypeToNotBeInsertedData = [
        { input: { socialAccountTypeName: "foo", link: "http://bar.com" } },
    ];

    const invalidSocialAccountTypeData = [{ input: { socialAccountTypeName: undefined } }];

    describe("Social Account Type Schema", () => {
        describe("Create Data", () => {
            describe("Insert with valid data", () => {
                describe("Insert with mock data", () => {
                    validMockSocialAccountTypeData.forEach(testCase => {
                        it(`should insert to databse with ${testCase.name}`, async () => {
                            const newSocialAccountType = await SocialAccountType.createNew(testCase.input);
                            expect(newSocialAccountType).to.not.be.null;
                            Object.keys(testCase.expected).forEach(key => {
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
                            Object.keys(testCase.expected).forEach(key => {
                                expect(newSocialAccountType[key]).to.equal(testCase.expected[key]);
                            });
                        });
                    });
                });
                describe("Insert with existing data", () => {
                    describe("Not allowing update existing", () => {
                        validSocialAccountTypeData.forEach((testCase, index) => {
                            it(`should return existing data with existing data ${index}`, async () => {
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
                                Object.keys(testCase.expected).forEach(key => {
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
                describe("Read mock data", () => {
                    validMockSocialAccountTypeData.forEach(testCase => {
                        it(`should retrieve data from db with ${testCase.name}`, async () => {
                            const socialAccountType = await SocialAccountType.getSocialAccountTypeByName(
                                testCase.input.socialAccountTypeName
                            );
                            expect(socialAccountType).to.not.be.null;
                            Object.keys(testCase.expected).forEach(key => {
                                expect(socialAccountType[key]).to.equal(testCase.expected[key]);
                            });
                        });
                    });
                });
                describe("Read existing data", () => {
                    validSocialAccountTypeData.forEach((testCase, index) => {
                        it(`should retrieve data from db with valid data ${index}`, async () => {
                            const socialAccountType = await SocialAccountType.getSocialAccountTypeByName(
                                testCase.input.socialAccountTypeName
                            );
                            expect(socialAccountType).to.not.be.null;
                            Object.keys(testCase.expected).forEach(key => {
                                expect(socialAccountType[key]).to.equal(testCase.expected[key]);
                            });
                        });
                    });
                });
                describe("Read non-existing data", () => {
                    nonExistingSocialAccountTypeToNotBeInsertedData
                        .concat(nonExistingSocialAccountTypeToBeInsertedData)
                        .forEach((testCase, index) => {
                            it(`should return null from db with non existing data ${index}`, async () => {
                                const socialAccountType = await SocialAccountType.getSocialAccountTypeByName(
                                    testCase.input.socialAccountTypeName
                                );
                                expect(socialAccountType).to.be.null;
                            });
                        });
                });
            });
            describe("Read invalid inputs", () => {
                invalidSocialAccountTypeData.forEach((testCase, index) => {
                    it(`should throw an error with invalid data ${index}`, async () => {
                        try {
                            const socialAccountType = await SocialAccountType.getSocialAccountTypeByName(
                                testCase.input.socialAccountTypeName
                            );
                            expect(socialAccountType).to.be.null;
                        } catch (error) {
                            expect(error).to.not.be.null;
                        }
                    });
                });
            });
        });
        describe("Edit Data", () => {
            describe("Edit valid inputs", () => {
                describe("Edit existing data", () => {
                    validSocialAccountTypeData.forEach((testCase, index) => {
                        it(`should return updated data from valid data ${index}`, async () => {
                            const updatedSocialAccountType = await SocialAccountType.updateSocialAccountTypeByName(
                                testCase.input.socialAccountTypeName,
                                testCase.edit
                            );
                            expect(updatedSocialAccountType).to.not.be.null;
                            Object.keys(testCase.expectedAfterEdit).forEach(key => {
                                expect(updatedSocialAccountType[key]).to.equal(testCase.expectedAfterEdit[key]);
                            });
                        });
                    });
                });
                describe("Edit non-existing data", () => {
                    describe("Not-allowing insertion", () => {
                        nonExistingSocialAccountTypeToNotBeInsertedData.forEach((testCase, index) => {
                            it(`should throw error with non-existing data to not be inserted ${index}`, async () => {
                                try {
                                    const updatedSocialAccountType = await SocialAccountType.updateSocialAccountTypeByName(
                                        testCase.input.socialAccountTypeName,
                                        testCase.input
                                    );
                                    expect(updatedSocialAccountType).to.be.null;
                                } catch (error) {
                                    expect(error).to.not.be.null;
                                }
                            });
                        });
                    });
                    describe("Allowing insertion", () => {
                        nonExistingSocialAccountTypeToBeInsertedData.forEach((testCase, index) => {
                            it(`should return new with non-existing data to be inserted ${index}`, async () => {
                                const newSocialAccountType = await SocialAccountType.updateSocialAccountTypeByName(
                                    testCase.input.socialAccountTypeName,
                                    testCase.input,
                                    true
                                );
                                expect(newSocialAccountType).to.not.be.null;
                                Object.keys(testCase.input).forEach(key => {
                                    expect(newSocialAccountType[key]).to.equal(testCase.input[key]);
                                });
                            });
                        });
                    });
                });
            });
            describe("Edit invalid inputs", () => {
                invalidSocialAccountTypeData.forEach((testCase, index) => {
                    it(`should throw an error with invalid data ${index}`, async () => {
                        try {
                            const newSocialAccountType = await SocialAccountType.updateSocialAccountTypeByName(
                                testCase.input.socialAccountTypeName,
                                testCase.input
                            );
                            expect(newSocialAccountType).to.be.null;
                        } catch (error) {
                            expect(error).to.not.be.null;
                        }
                    });
                });
            });
        });
        describe("Delete Data", () => {
            describe("Delete valid inputs", () => {
                describe("Delete Mock data", () => {
                    validMockSocialAccountTypeData.forEach(testCase => {
                        it(`should return true with ${testCase.name}`, async () => {
                            const isDeleted = await SocialAccountType.deleteSocialAccountTypeByName(
                                testCase.input.socialAccountTypeName
                            );
                            expect(isDeleted).to.be.true;
                        });
                    });
                });
                describe("Delete Existing Data", () => {
                    validSocialAccountTypeData.forEach((testCase, index) => {
                        it(`should return true with valid data ${index}`, async () => {
                            const isDeleted = await SocialAccountType.deleteSocialAccountTypeByName(
                                testCase.expectedAfterEdit.socialAccountTypeName
                            );
                            expect(isDeleted).to.be.true;
                        });
                    });
                });
                describe("Delete Non-Existing Data", () => {
                    nonExistingSocialAccountTypeToNotBeInsertedData.forEach((testCase, index) => {
                        it(`should return false with non-existing data ${index}`, async () => {
                            const isDeleted = await SocialAccountType.deleteSocialAccountTypeByName(
                                testCase.input.socialAccountTypeName
                            );
                            expect(isDeleted).to.be.false;
                        });
                    });
                });
            });
            describe("Delete invalid inputs", () => {
                invalidSocialAccountTypeData.forEach((testCase, index) => {
                    it(`should throw an error with invalid data ${index}`, async () => {
                        try {
                            const isDeleted = await SocialAccountType.deleteSocialAccountTypeByName(
                                testCase.input.socialAccountTypeName
                            );
                            expect(isDeleted).to.be.false;
                        } catch (error) {
                            expect(error).to.not.be.null;
                        }
                    });
                });
            });
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
