/**
 * src/db.js
 * DATABASE INITIALIZATION
 * this will expose functionality of database to the project
 */
import mongoose from "mongoose";

const debug = require("debug")("Akazam:DBMain");

export const ERROR_MESSAGES = Object.freeze({
    GENERAL: {
        INVALID_INPUTS: "Invalid Inputs",
        INSERT_ERROR: "Could not intiate writing process",
        UPDATE_ERROR: "Could not initiate updating process",
        READ_ERROR: "Could not initiate reading process",
        DELETE_ERROR: "Could not initiate deleting process",
    },
    INITIALIZATION: {
        CONNECTION_ESTABLISHMENT: "Unable to establish connection",
    },
});

/**
 * Database Initialization function
 *
 * return a mongoose instance that is connected to specified URI
 *
 * @param {*} uri MongoDB URI endpoint to connect to
 * @param {*} options MongoDB configuration
 */
const initDB = async (uri, options) => {
    try {
        const mgoose = await mongoose.connect(
            uri,
            options
        );
        return mgoose;
    } catch (err) {
        debug(err);
        throw new Error(ERROR_MESSAGES.INITIALIZATION.CONNECTION_ESTABLISHMENT);
    }
};

export default async (uri, options) => await initDB(uri, options);
