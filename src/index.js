/**
 * src/index.js
 * BASE POINT OF THE PROJECT
 * environment configurations should be set here along with establishing server
 */
require("dotenv").config();

const debug = require("debug")("Akazam:Main");

import initDB from "./db";

const env = process.env;

const DB_URI = `mongodb://${env.DB_HOSTNAME}:${env.DB_PORT}/${env.DB_NAME}`;

const MONGOOSE_OPTS = {
    useNewUrlParser: true,
    user: env.DB_USER,
    pass: env.DB_PASS,
};

const main = async () => {
    const db = await initDB(DB_URI, MONGOOSE_OPTS);
    debug("DB Connection Established");
};

main().catch(error => {
    debug(error);
});
