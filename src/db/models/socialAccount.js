/**
 * Social Account
 *
 * This will contain the social account database:
 * Social Account & Social Account Type
 *
 * This will help put a person into all their social account
 */
import mongoose, { Schema, Model } from "mongoose";
import { ERROR_MESSAGES } from "../index";

const debug = require("debug")("Akazam:SocialAccount");

export const SOCIAL_ACCOUNT_ERROR_MESSAGES = Object.freeze({
    SOCIAL_ACCOUNT: {
        NEED_USERNAME: "Username is required",
    },
    SOCIAL_ACCOUNT_TYPE: {
        NEED_NAME: "Name is required",
    },
});

const socialAccountTypeSchema = new Schema({
    socialAccountTypeName: {
        type: String,
        unique: true,
        dropDups: true,
        required: [true, "Need a name for social account type"],
    },
    link: String,
});

const socialAccountSchema = new Schema({
    username: {
        type: String,
        required: [true, "Need an username for social account"],
    },
    socialAccountType: {
        type: Schema.Types.ObjectId,
        ref: "SocialAccountType",
    },
});

/**
 * Convert a mongoose social account type document to json format
 *
 * @param {*} data document to be converted
 */
const convertSocialAccountTypeDocumentToJSON = data => ({
    _id: data._id,
    socialAccountTypeName: data.socialAccountTypeName,
    link: data.link ? data.link : null,
});

class SocialAccountTypeModel extends Model {
    /**
     * Inserting a new SocialAccountType into database
     *
     * @param {*} rawData data to be inserted
     * @param {*} updateIfExist whether to overwrite existing data if already existed
     */
    static async createNew(rawData, updateIfExist = false) {
        try {
            if (!rawData.socialAccountTypeName) throw new Error(ERROR_MESSAGES.GENERAL.INVALID_INPUTS);
            const isAlreadyExistData = await this.findOne({
                socialAccountTypeName: rawData.socialAccountTypeName,
            });
            if (updateIfExist || !isAlreadyExistData) {
                const newSocialAccountType = new SocialAccountType(rawData);
                const newSocialAccountTypeDocument = await newSocialAccountType.save();
                return convertSocialAccountTypeDocumentToJSON(newSocialAccountTypeDocument);
            } else {
                return convertSocialAccountTypeDocumentToJSON(isAlreadyExistData);
            }
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.INSERT_ERROR);
        }
    }

    /**
     * Retrieve a social account type from name
     *
     * @param {*} socialAccountTypeName name of the retrieving social account type
     */
    static async getSocialAccountTypeByName(socialAccountTypeName) {
        try {
            if (!socialAccountTypeName) throw new Error(SOCIAL_ACCOUNT_ERROR_MESSAGES.SOCIAL_ACCOUNT_TYPE.NEED_NAME);
            const socialAccountType = await this.findOne({ socialAccountTypeName });
            if (!socialAccountType) return null;
            return convertSocialAccountTypeDocumentToJSON(socialAccountType);
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.READ_ERROR);
        }
    }

    /**
     * Update a social acount type
     *
     * @param {*} socialAccountTypeName name of the social account type
     * @param {*} updatedRawData data that will be update
     * @param {*} shouldCreateNew whether or not to create new if not exist
     */
    static async updateSocialAccountTypeByName(socialAccountTypeName, updatedRawData, shouldCreateNew = false) {
        try {
            if (!socialAccountTypeName) throw new Error(SOCIAL_ACCOUNT_ERROR_MESSAGES.SOCIAL_ACCOUNT_TYPE.NEED_NAME);
            const updatedSocialAccountTypeData = await this.findOneAndUpdate(
                { socialAccountTypeName },
                updatedRawData,
                {
                    new: true,
                    upsert: shouldCreateNew,
                }
            );
            if (!updatedSocialAccountTypeData) return null;
            return convertSocialAccountTypeDocumentToJSON(updatedSocialAccountTypeData);
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.UPDATE_ERROR);
        }
    }

    /**
     * Delete a social account type
     *
     * @param {*} socialAccountTypeName name of the social account type to be deleted
     */
    static async deleteSocialAccountTypeByName(socialAccountTypeName) {
        try {
            if (!socialAccountTypeName) throw new Error(SOCIAL_ACCOUNT_ERROR_MESSAGES.SOCIAL_ACCOUNT_TYPE.NEED_NAME);
            const isDeleted = await this.findOneAndDelete({ socialAccountTypeName });
            return isDeleted ? true : false;
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.DELETE_ERROR);
        }
    }
}

export const SocialAccountType = mongoose.model(SocialAccountTypeModel, socialAccountTypeSchema, "SocialAccountType");

/**
 * Convert a mongoose social account document to json format
 *
 * @param {*} data document to be converted
 */

const convertSocialAccountDocumentToJSON = data => ({
    _id: data._id,
    username: data.username,
    socialAccountType: data.socialAccountType ? convertSocialAccountTypeDocumentToJSON(data.socialAccountType) : null,
});

class SocialAccountModel extends Model {
    /**
     * Create a new social account
     *
     * @param {*} rawData data to be inserted to db
     * @param {*} updateIfExist whether to overwrite if data already exist
     */
    static async createNew(rawData, updateIfExist = false) {
        try {
            if (!rawData.username) throw new Error(ERROR_MESSAGES.GENERAL.INVALID_INPUTS);
            // check if data already exist
            const isAlreadyExistData = await this.findOne({ username: rawData.username });
            if (updateIfExist || !isAlreadyExistData) {
                // handle social account type
                const data = {
                    username: rawData.username,
                };
                if (rawData.socialAccountType) {
                    const socialAccountType = await SocialAccountType.createNew(rawData.socialAccountType);
                    data.socialAccountType = socialAccountType._id;
                }
                const newSocialAccount = new SocialAccountModel(data);
                const newSocialAccountDocument = await newSocialAccount.save();
                return convertSocialAccountDocumentToJSON(
                    await newSocialAccountDocument
                        .populate({ path: "socialAccountType", model: SocialAccountTypeModel })
                        .execPopulate()
                );
            } else {
                return convertSocialAccountDocumentToJSON(
                    await isAlreadyExistData
                        .populate({ path: "socialAccountType", model: SocialAccountTypeModel })
                        .execPopulate()
                );
            }
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.INSERT_ERROR);
        }
    }

    /**
     * Retrieve a social account from the database
     *
     * @param {*} username name to be searched
     */
    static async getSocialAccountByUsername(username) {
        try {
            if (!username) throw new Error(SOCIAL_ACCOUNT_ERROR_MESSAGES.SOCIAL_ACCOUNT.NEED_USERNAME);
            const socialAccount = await this.findOne({ username });
            if (!socialAccount) return null;
            return convertSocialAccountDocumentToJSON(
                await socialAccount
                    .populate({
                        path: "socialAccountType",
                        model: SocialAccountTypeModel,
                    })
                    .execPopulate()
            );
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.READ_ERROR);
        }
    }
    /**
     * Update a social account in database
     *
     * @param {*} username name to be updated
     * @param {*} updatedSocialAccount data to update
     * @param {*} shouldCreateNew whether to create new if it is not exist
     */
    static async updateSocialAccountByUsername(username, updatedSocialAccount, shouldCreateNew = false) {
        try {
            if (!username) throw new Error(SOCIAL_ACCOUNT_ERROR_MESSAGES.SOCIAL_ACCOUNT.NEED_USERNAME);
            const dataToUpdate = {
                username: updatedSocialAccount.username ? updatedSocialAccount.username : username,
            };
            if (updatedSocialAccount.socialAccountType) {
                const socialAccountType = await SocialAccountType.updateSocialAccountTypeByName(
                    updatedSocialAccount.socialAccountType.socialAccountTypeName,
                    updatedSocialAccount.socialAccountType,
                    true
                );
                dataToUpdate.socialAccountType = socialAccountType._id;
            }
            const socialAccount = await this.findOneAndUpdate({ username }, dataToUpdate, {
                new: true,
                upsert: shouldCreateNew,
            });
            if (!socialAccount) return null;
            return convertSocialAccountDocumentToJSON(
                await socialAccount
                    .populate({
                        path: "socialAccountType",
                        model: SocialAccountTypeModel,
                    })
                    .execPopulate()
            );
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.UPDATE_ERROR);
        }
    }

    /**
     * delete a social account from database
     *
     * @param {*} username account to be deleted
     */
    static async deleteSocialAccountByUsername(username) {
        try {
            if (!username) throw new Error(SOCIAL_ACCOUNT_ERROR_MESSAGES.SOCIAL_ACCOUNT.NEED_USERNAME);
            const isDeleted = await this.findOneAndDelete({ username });
            return isDeleted ? true : false;
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.DELETE_ERROR);
        }
    }
}

export default mongoose.model(SocialAccountModel, socialAccountSchema, "SocialAccount");
