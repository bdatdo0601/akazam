"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require("mongoose");

var _mongoose2 = _interopRequireDefault(_mongoose);

var _parseAddress = require("parse-address");

var _parseAddress2 = _interopRequireDefault(_parseAddress);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const debug = require("debug")("Akazam:Location");

const EMPTY_ADDRESS = {
  address: "",
  city: "",
  state: "",
  zipCode: ""
};
const locationSchema = new _mongoose.Schema({
  name: {
    type: String,
    unique: true,
    dropDups: true,
    required: [true, "Location needs name"]
  },
  address: String,
  zipCode: String,
  state: String,
  city: String,
  country: String,
  lat: Number,
  long: Number
});
/**
 * Converting address
 *
 * breaking input address into multiple part
 * (e.g: 123 A B Street, C, AB 12345 --> address: 123 A B St, city: C, state: AB, zipCode: 12345)
 *
 * @param {*} address original address
 */

const convertAddress = address => {
  const parsedAddress = _parseAddress2.default.parseAddress(address);

  if (!parsedAddress) return null;
  return {
    address: `${parsedAddress.number} ${parsedAddress.prefix ? parsedAddress.prefix + " " : ""}${parsedAddress.street} ${parsedAddress.type}`,
    city: parsedAddress.city,
    state: parsedAddress.state,
    zipCode: parsedAddress.zip
  };
};

class Location extends _mongoose.Model {
  /**
   * Inserting new location into database
   *
   * @param {*} rawData data to be inserted
   */
  static async createNewLocation(rawData) {
    try {
      const convertedAddress = convertAddress(rawData.address);
      const data = convertedAddress ? _objectSpread({}, rawData, convertedAddress) : rawData;
      const newLocation = new Location(data);
      const newLocationDocument = await newLocation.save();
      return newLocationDocument;
    } catch (error) {
      debug(error);
      throw new Error("cannot create new location");
    }
  }
  /**
   * Get a location from database from name
   *
   * @param {*} name name of the retriving location
   */


  static async getLocationFromName(name) {
    try {
      if (!name) throw new Error("Invalid Inputs");
      const location = await this.findOne({
        name
      });
      return location;
    } catch (error) {
      debug(error);
      throw new Error("Could not initiate searching process");
    }
  }
  /**
   * Update a location with new data
   *
   * @param {*} name name of the location that should be updated
   * @param {*} updatedRawData updated information
   * @param {*} shouldCreateNew determine if an input is non-existed, should the data be created
   */


  static async updateLocationByName(name, updatedRawData, shouldCreateNew = true) {
    try {
      if (!name) throw new Error("Invalid Inputs");
      const convertedAddress = convertAddress(updatedRawData.address);
      const data = convertedAddress ? _objectSpread({}, updatedRawData, EMPTY_ADDRESS, convertedAddress) : updatedRawData;
      const location = await this.updateOne({
        name
      }, data, {
        upsert: shouldCreateNew
      });
      return location;
    } catch (error) {
      debug(error);
      throw new Error("Could not initiate searching process");
    }
  }
  /**
   * Delete a given location in database
   *
   * @param {*} name name of the deleted location
   */


  static async deleteLocationByName(name) {
    try {
      if (!name) throw new Error("Invalid Inputs");
      await this.deleteOne({
        name
      });
      return true;
    } catch (error) {
      debug(error);
      throw new Error("Could not initiate searching process");
    }
  }

}

exports.default = _mongoose2.default.model(Location, locationSchema, "Location");
//# sourceMappingURL=location.js.map