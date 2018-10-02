/**
 * Social Account
 *
 * This will contain the social account database:
 * Social Account & Social Account Type
 *
 * This will help put a person into all their social account
 */
import mongoose, { Schema, Model } from "mongoose";

const debug = require("debug")("Akazam:SocialAccount");

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
    type: {
        type: Schema.Types.ObjectId,
        ref: "SocialAccountType",
        required: [true, "Need a type for social account"],
    },
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
            if (!rawData.socialAccountTypeName) throw new Error("Invalid inputs");
            const isAlreadyExistData = await this.findOne({
                socialAccountTypeName: rawData.socialAccountTypeName,
            });
            if (updateIfExist || !isAlreadyExistData) {
                const newSocialAccountType = new SocialAccountType(rawData);
                const newSocialAccountTypeDocument = await newSocialAccountType.save();
                return newSocialAccountTypeDocument;
            } else {
                return isAlreadyExistData;
            }
        } catch (error) {
            debug(error);
            throw new Error("Cannot create a new social account type");
        }
    }

    /**
     * Retrieve a social account type from name
     *
     * @param {*} socialAcccountTypeName name of the retrieving social account type
     */
    static async getSocialAccountTypeByName(socialAccountTypeName) {
        try {
            if (!socialAccountTypeName) throw new Error("Invalid Inputs");
            const socialAccountType = await this.findOne({ socialAccountTypeName });
            return socialAccountType;
        } catch (error) {
            debug(error);
            throw new Error("Could not initiate retrieving process");
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
            if (!socialAccountTypeName) throw new Error("Invalid inputs");
            const updatedSocialAccountData = await this.findOneAndUpdate({ socialAccountTypeName }, updatedRawData, {
                new: true,
                upsert: shouldCreateNew,
            });
            return updatedSocialAccountData;
        } catch (error) {
            debug(error);
            throw new Error("Could not initiate updating process");
        }
    }

    static async deleteSocialAccountTypeByName(socialAccountTypeName) {
        try {
            if (!socialAccountTypeName) throw new Error("Invalid Inputs");
            const isDeleted = await this.findOneAndDelete({ socialAccountTypeName });
            if (isDeleted) {
                return true;
            }
            return false;
        } catch (error) {
            debug(error);
            throw new Error("Could not initiate deleting process");
        }
    }
}

export const SocialAccountType = mongoose.model(SocialAccountTypeModel, socialAccountTypeSchema, "SocialAccountType");

class SocialAccountModel extends Model {}

export default mongoose.model(SocialAccountModel, socialAccountSchema, "SocialAccount");
