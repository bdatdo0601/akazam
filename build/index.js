"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _db = require("./db");

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * src/index.js
 * BASE POINT OF THE PROJECT
 * environment configurations should be set here along with establishing server
 */
require("dotenv").config(); // setting up debug flag for this file


const debug = require("debug")("Akazam:Main");

// retrieve environment variable
const env = process.env;
const DB_URI = `mongodb://${env.DB_HOSTNAME}:${env.DB_PORT}/${env.DB_NAME}`;
const MONGOOSE_OPTS = {
  useNewUrlParser: true,
  user: env.DB_USER,
  pass: env.DB_PASS
};
/**
 * Main function
 *
 * Application start here. This should be used to initialize other module in the project
 */

const main = async () => {
  // initialize database
  const db = await (0, _db2.default)(DB_URI, MONGOOSE_OPTS);
  debug("DB Connection Established");
}; // execute function


main().catch(error => {
  debug(error);
}); // exporting main function for testing

exports.default = main;
//# sourceMappingURL=index.js.map