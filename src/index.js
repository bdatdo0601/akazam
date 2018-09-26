/**
 * src/index.js
 * BASE POINT OF THE PROJECT
 * environment configurations should be set here along with establishing server
 */
require("dotenv").config();

// setting up debug flag for this file
const debug = require("debug")("Akazam:Main");

import initDB from "./db";

// retrieve environment variable
const env = process.env;

const DB_URI = `mongodb://${env.DB_HOSTNAME}:${env.DB_PORT}/${env.DB_NAME}`;

const MONGOOSE_OPTS = {
    useNewUrlParser: true,
    user: env.DB_USER,
    pass: env.DB_PASS,
};

/**
 * Main function
 *
 * Application start here. This should be used to initialize other module in the project
 */
const main = async () => {
    // initialize database
    const db = await initDB(DB_URI, MONGOOSE_OPTS);
    debug("DB Connection Established");
};

// execute function
main().catch(error => {
    debug(error);
});

// exporting main function for testing
export default main;
