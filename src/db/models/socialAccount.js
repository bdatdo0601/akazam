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

class SocialAccountType extends Model {}

export const socialAccountTypeModel = mongoose.model(SocialAccountType, socialAccountTypeSchema, "SocialAccountType");

class SocialAccount extends Model {}

export default mongoose.model(SocialAccount, socialAccountSchema, "SocialAccount");
