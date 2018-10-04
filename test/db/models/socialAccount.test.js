import chai, { expect } from "chai";
import initDB, { ERROR_MESSAGES } from "../../../src/db";
import _ from "lodash";
import SocialAccount, { SocialAccountType, SOCIAL_ACCOUNT_ERROR_MESSAGES } from "../../../src/db/models/socialAccount";
import mockSocialAccountData from "../../../__mock__/data/socialAccount.json";

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
                            expect(newSocialAccountType).to.be.like(testCase.expected);
                        });
                    });
                });
                describe("Insert with non-existing data", () => {
                    validSocialAccountTypeData.forEach((testCase, index) => {
                        it(`should insert to database with valid data ${index}`, async () => {
                            const newSocialAccountType = await SocialAccountType.createNew(testCase.input);
                            expect(newSocialAccountType).to.be.like(testCase.expected);
                        });
                    });
                });
                describe("Insert with existing data", () => {
                    describe("Not allowing update existing", () => {
                        validSocialAccountTypeData.forEach((testCase, index) => {
                            it(`should return existing data with existing data ${index}`, async () => {
                                const newSocialAccountType = await SocialAccountType.createNew(testCase.input, false);
                                expect(newSocialAccountType).to.be.like(testCase.input);
                            });
                        });
                    });
                    describe("Allowing update existing data", () => {
                        validSocialAccountTypeData.forEach((testCase, index) => {
                            it(`should return updated document with valid data ${index}`, async () => {
                                const newSocialAccountType = await SocialAccountType.createNew(testCase.input, true);
                                expect(newSocialAccountType).to.be.like(testCase.expected);
                            });
                        });
                    });
                });
            });
            describe("Insert with invalid data", () => {
                invalidSocialAccountTypeData.forEach((testCase, index) => {
                    it(`should throw insert error with invalid data ${index}`, async () => {
                        await expect(SocialAccountType.createNew(testCase.input)).to.eventually.be.rejectedWith(
                            ERROR_MESSAGES.GENERAL.INSERT_ERROR
                        );
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
                            expect(socialAccountType).to.be.like(testCase.expected);
                        });
                    });
                });
                describe("Read existing data", () => {
                    validSocialAccountTypeData.forEach((testCase, index) => {
                        it(`should retrieve data from db with valid data ${index}`, async () => {
                            const socialAccountType = await SocialAccountType.getSocialAccountTypeByName(
                                testCase.input.socialAccountTypeName
                            );
                            expect(socialAccountType).to.be.like(testCase.expected);
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
                    it(`should throw a read error with invalid data ${index}`, async () => {
                        await expect(
                            SocialAccountType.getSocialAccountTypeByName(testCase.input.socialAccountTypeName)
                        ).to.eventually.be.rejectedWith(ERROR_MESSAGES.GENERAL.READ_ERROR);
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
                            expect(updatedSocialAccountType).to.be.like(testCase.expectedAfterEdit);
                        });
                    });
                });
                describe("Edit non-existing data", () => {
                    describe("Not-allowing insertion", () => {
                        nonExistingSocialAccountTypeToNotBeInsertedData.forEach((testCase, index) => {
                            it(`should return null with non-existing data to not be inserted ${index}`, async () => {
                                const updatedSocialAccountType = await SocialAccountType.updateSocialAccountTypeByName(
                                    testCase.input.socialAccountTypeName,
                                    testCase.input
                                );
                                expect(updatedSocialAccountType).to.be.null;
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
                                expect(newSocialAccountType).to.be.like(testCase.input);
                            });
                        });
                    });
                });
            });
            describe("Edit invalid inputs", () => {
                invalidSocialAccountTypeData.forEach((testCase, index) => {
                    it(`should throw an updating error with invalid data ${index}`, async () => {
                        await expect(
                            SocialAccountType.updateSocialAccountTypeByName(
                                testCase.input.socialAccountTypeName,
                                testCase.input
                            )
                        ).to.eventually.be.rejectedWith(ERROR_MESSAGES.GENERAL.UPDATE_ERROR);
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
                        await expect(
                            SocialAccountType.deleteSocialAccountTypeByName(testCase.input.socialAccountTypeName)
                        ).to.eventually.be.rejectedWith(ERROR_MESSAGES.GENERAL.DELETE_ERROR);
                    });
                });
            });
        });
    });

    const validMockSocialAccountData = mockSocialAccountData.socialAccount.map((data, index) => ({
        name: `Mock Data ${index}`,
        input: data,
        expected: data,
    }));

    const validSocialAccountData = [
        {
            input: {
                username: "foop",
                socialAccountType: {
                    socialAccountTypeName: "discordia",
                    link: "http://discord.com",
                },
            },
            expected: {
                username: "foop",
                socialAccountType: {
                    socialAccountTypeName: "discordia",
                    link: "http://discord.com",
                },
            },
            edit: {
                username: "foope",
                socialAccountType: {
                    socialAccountTypeName: "discordias",
                    link: "http://discordias.com",
                },
            },
            expectedAfterEdit: {
                username: "foope",
                socialAccountType: {
                    socialAccountTypeName: "discordias",
                    link: "http://discordias.com",
                },
            },
        },
        {
            input: {
                username: "boopo",
            },
            expected: {
                username: "boopo",
            },
            edit: {
                socialAccountType: {
                    socialAccountTypeName: "doop",
                },
            },
            expectedAfterEdit: {
                username: "boopo",
                socialAccountType: {
                    socialAccountTypeName: "doop",
                },
            },
        },
        {
            input: {
                username: "voopo",
            },
            expected: {
                username: "voopo",
            },
            edit: {
                username: "voodoo",
            },
            expectedAfterEdit: {
                username: "voodoo",
            },
        },
    ];

    const nonExistingSocialAccountToBeInsertedData = [
        {
            input: {
                username: "bop",
                socialAccountType: {
                    socialAccountTypeName: "Slack",
                    link: "http://slack.com",
                },
            },
        },
    ];

    const nonExistingSocialAccountToNotBeInsertedData = [
        {
            input: {
                username: "nope",
                socialAccountType: {
                    socialAccountTypeName: "NONP",
                    link: "http://nonnp.org",
                },
            },
        },
    ];

    const invalidSocialAccountData = [
        {
            input: {
                username: false,
            },
        },
        {
            input: {
                user: "nos",
            },
        },
        {
            input: {
                usernam: "asfasf",
            },
        },
    ];

    describe("Social Account Schema", () => {
        before(async () => {
            // add mock social account type
            await validMockSocialAccountTypeData.forEach(async data => {
                await SocialAccountType.createNew(data.input);
            });
        });
        describe("Create Data", () => {
            describe("Insert with valid data", () => {
                describe("Insert with mock data", () => {
                    validMockSocialAccountData.forEach(testCase => {
                        it(`should insert to databse with ${testCase.name}`, async () => {
                            const newSocialAccount = await SocialAccount.createNew(testCase.input);
                            expect(newSocialAccount).to.be.like(testCase.expected);
                        });
                    });
                });
                describe("Insert with non-existing data", () => {
                    validSocialAccountData.forEach((testCase, index) => {
                        it(`should insert to database with valid data ${index}`, async () => {
                            const newSocialAccount = await SocialAccount.createNew(testCase.input);
                            expect(newSocialAccount).to.be.like(testCase.expected);
                        });
                    });
                });
                describe("Insert with existing data", () => {
                    describe("Not allowing update existing", () => {
                        validSocialAccountData.forEach((testCase, index) => {
                            it(`should return existing data with existing data ${index}`, async () => {
                                const newSocialAccount = await SocialAccount.createNew(testCase.input, false);
                                expect(newSocialAccount).to.be.like(testCase.expected);
                            });
                        });
                    });
                    describe("Allowing update existing data", () => {
                        validSocialAccountData.forEach((testCase, index) => {
                            it(`should return updated document with valid data ${index}`, async () => {
                                const newSocialAccount = await SocialAccount.createNew(testCase.input, true);
                                expect(newSocialAccount).to.be.like(testCase.expected);
                            });
                        });
                    });
                });
            });
            describe("Insert with invalid data", () => {
                invalidSocialAccountData.forEach((testCase, index) => {
                    it(`should throw an insert error with invalid data ${index}`, async () => {
                        await expect(SocialAccount.createNew(testCase.input)).to.eventually.be.rejectedWith(
                            ERROR_MESSAGES.GENERAL.INSERT_ERROR
                        );
                    });
                });
            });
        });
        describe("Read Data", () => {
            describe("Read valid inputs", () => {
                describe("Read mock data", () => {
                    validMockSocialAccountData.forEach(testCase => {
                        it(`should retrieve data from db with ${testCase.name}`, async () => {
                            const socialAccount = await SocialAccount.getSocialAccountByUsername(
                                testCase.input.username
                            );
                            expect(socialAccount).to.be.like(testCase.expected);
                        });
                    });
                });
                describe("Read existing data", () => {
                    validSocialAccountData.forEach((testCase, index) => {
                        it(`should retrieve data from db with valid data ${index}`, async () => {
                            const socialAccount = await SocialAccount.getSocialAccountByUsername(
                                testCase.input.username
                            );
                            expect(socialAccount).to.be.like(testCase.expected);
                        });
                    });
                });
                describe("Read non-existing data", () => {
                    nonExistingSocialAccountToNotBeInsertedData
                        .concat(nonExistingSocialAccountToBeInsertedData)
                        .forEach((testCase, index) => {
                            it(`should return null from db with non existing data ${index}`, async () => {
                                const socialAccount = await SocialAccount.getSocialAccountByUsername(
                                    testCase.input.username
                                );
                                expect(socialAccount).to.be.null;
                            });
                        });
                });
            });
            describe("Read invalid inputs", () => {
                invalidSocialAccountData.forEach((testCase, index) => {
                    it(`should throw a read error with invalid data ${index}`, async () => {
                        await expect(
                            SocialAccount.getSocialAccountByUsername(testCase.input.username)
                        ).to.eventually.be.rejectedWith(ERROR_MESSAGES.GENERAL.READ_ERROR);
                    });
                });
            });
        });
        describe("Edit Data", () => {
            describe("Edit valid inputs", () => {
                describe("Edit existing data", () => {
                    validSocialAccountData.forEach((testCase, index) => {
                        it(`should return updated data from valid data ${index}`, async () => {
                            const updatedSocialAccount = await SocialAccount.updateSocialAccountByUsername(
                                testCase.input.username,
                                testCase.edit
                            );
                            expect(updatedSocialAccount).to.be.like(testCase.expectedAfterEdit);
                        });
                    });
                });
                describe("Edit non-existing data", () => {
                    describe("Not-allowing insertion", () => {
                        nonExistingSocialAccountToNotBeInsertedData.forEach((testCase, index) => {
                            it(`should return null with non-existing data to not be inserted ${index}`, async () => {
                                const updatedSocialAccount = await SocialAccount.updateSocialAccountByUsername(
                                    testCase.input.username,
                                    testCase.input
                                );
                                expect(updatedSocialAccount).to.be.null;
                            });
                        });
                    });
                    describe("Allowing insertion", () => {
                        nonExistingSocialAccountToBeInsertedData.forEach((testCase, index) => {
                            it(`should return new with non-existing data to be inserted ${index}`, async () => {
                                const newSocialAccount = await SocialAccount.updateSocialAccountByUsername(
                                    testCase.input.username,
                                    testCase.input,
                                    true
                                );
                                expect(newSocialAccount).to.be.like(testCase.input);
                            });
                        });
                    });
                });
            });
            describe("Edit invalid inputs", () => {
                invalidSocialAccountData.forEach((testCase, index) => {
                    it(`should throw an update error with invalid data ${index}`, async () => {
                        await expect(
                            SocialAccount.updateSocialAccountByUsername(testCase.input.username, testCase.input)
                        ).to.eventually.be.rejectedWith(ERROR_MESSAGES.GENERAL.UPDATE_ERROR);
                    });
                });
            });
        });
        describe("Delete Data", () => {
            describe("Delete valid inputs", () => {
                describe("Delete Mock data", () => {
                    validMockSocialAccountData.forEach(testCase => {
                        it(`should return true with ${testCase.name}`, async () => {
                            const isDeleted = await SocialAccount.deleteSocialAccountByUsername(
                                testCase.input.username
                            );
                            expect(isDeleted).to.be.true;
                        });
                    });
                });
                describe("Delete Existing Data", () => {
                    validSocialAccountData.forEach((testCase, index) => {
                        it(`should return true with valid data ${index}`, async () => {
                            const isDeleted = await SocialAccount.deleteSocialAccountByUsername(
                                testCase.expectedAfterEdit.username
                            );
                            expect(isDeleted).to.be.true;
                        });
                    });
                });
                describe("Delete Non-Existing Data", () => {
                    nonExistingSocialAccountToNotBeInsertedData.forEach((testCase, index) => {
                        it(`should return false with non-existing data ${index}`, async () => {
                            const isDeleted = await SocialAccount.deleteSocialAccountByUsername(
                                testCase.input.username
                            );
                            expect(isDeleted).to.be.false;
                        });
                    });
                });
            });
            describe("Delete invalid inputs", () => {
                invalidSocialAccountData.forEach((testCase, index) => {
                    it(`should throw a deletion error with invalid data ${index}`, async () => {
                        await expect(
                            SocialAccount.deleteSocialAccountByUsername(testCase.input.username)
                        ).to.eventually.be.rejectedWith(ERROR_MESSAGES.GENERAL.DELETE_ERROR);
                    });
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
