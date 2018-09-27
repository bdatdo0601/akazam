/**
 * src/db.js
 * DATABASE INITIALIZATION
 * this will expose functionality of database to the project
 */
import mongoose from "mongoose";

const debug = require("debug")("Akazam:DBMain");

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
        throw new Error("Unable to establish connection");
    }
};

export default async (uri, options) => await initDB(uri, options);
