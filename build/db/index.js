"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * src/db.js
 * DATABASE INITIALIZATION
 * this will expose functionality of database to the project
 */
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
    const mgoose = await _mongoose2.default.connect(uri, options);
    return mgoose;
  } catch (err) {
    debug(err);
    throw new Error("Unable to establish connection");
  }
};

exports.default = async (uri, options) => await initDB(uri, options);
//# sourceMappingURL=index.js.map