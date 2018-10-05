/**
 * Location Model
 *
 * hold a real world's location in a format that can be easily retrieve, search, etc
 */
import mongoose, { Schema, Model } from "mongoose";
import { ERROR_MESSAGES } from "../index";
import addressParser from "parse-address";

const debug = require("debug")("Akazam:Location");

export const LOCATION_ERROR_MESSAGES = Object.freeze({
    LOCATION: {
        NEED_NAME: "Location name is required",
    },
});

const EMPTY_ADDRESS = {
    address: "",
    city: "",
    state: "",
    zipCode: "",
};

const locationSchema = new Schema({
    name: {
        type: String,
        unique: true,
        dropDups: true,
        required: [true, "Location needs name"],
    },
    address: String,
    zipCode: String,
    state: String,
    city: String,
    country: String,
    lat: Number,
    long: Number,
});

const convertLocationDocumentToJSON = data => ({
    _id: data._id,
    name: data.name,
    address: data.address,
    zipCode: data.zipCode,
    state: data.state,
    city: data.city,
    country: data.country,
    lat: data.lat,
    long: data.long,
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
    const parsedAddress = addressParser.parseAddress(address);
    if (!parsedAddress) return null;
    return {
        address: `${parsedAddress.number} ${parsedAddress.prefix ? parsedAddress.prefix + " " : ""}${
            parsedAddress.street
        } ${parsedAddress.type}`,
        city: parsedAddress.city,
        state: parsedAddress.state,
        zipCode: parsedAddress.zip,
    };
};

class Location extends Model {
    /**
     * Inserting new location into database
     *
     * @param {*} rawData data to be inserted
     */
    static async createNew(rawData, updateIfExist = false) {
        try {
            if (!rawData.name) throw new Error(LOCATION_ERROR_MESSAGES.LOCATION.NEED_NAME);
            // check if data already exist
            const isAlreadyExistData = await this.findOne({ name: rawData.name });
            if (updateIfExist || !isAlreadyExistData) {
                const convertedAddress = convertAddress(rawData.address);
                const data = convertedAddress ? { ...rawData, ...convertedAddress } : rawData;
                const newLocation = new Location(data);
                const newLocationDocument = await newLocation.save();
                return convertLocationDocumentToJSON(newLocationDocument);
            } else {
                return convertLocationDocumentToJSON(isAlreadyExistData);
            }
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.INSERT_ERROR);
        }
    }
    /**
     * Get a location from database from name
     *
     * @param {*} name name of the retriving location
     */
    static async getLocationFromName(name) {
        try {
            if (!name) throw new Error(LOCATION_ERROR_MESSAGES.LOCATION.NEED_NAME);
            const location = await this.findOne({ name });
            if (!location) return null;
            return convertLocationDocumentToJSON(location);
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.READ_ERROR);
        }
    }
    /**
     * Update a location with new data
     *
     * @param {*} name name of the location that should be updated
     * @param {*} updatedRawData updated information
     * @param {*} shouldCreateNew determine if an input is non-existed, should the data be created
     */
    static async updateLocationByName(name, updatedRawData, shouldCreateNew = false) {
        try {
            if (!name) throw new Error(LOCATION_ERROR_MESSAGES.LOCATION.NEED_NAME);
            const convertedAddress = convertAddress(updatedRawData.address);
            const data = convertedAddress
                ? { ...updatedRawData, ...EMPTY_ADDRESS, ...convertedAddress }
                : updatedRawData;
            const location = await this.findOneAndUpdate({ name }, data, { new: true, upsert: shouldCreateNew });
            if (!location) return null;
            return convertLocationDocumentToJSON(location);
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.UPDATE_ERROR);
        }
    }
    /**
     * Delete a given location in database
     *
     * @param {*} name name of the deleted location
     */
    static async deleteLocationByName(name) {
        try {
            if (!name) throw new Error(LOCATION_ERROR_MESSAGES.LOCATION.NEED_NAME);
            const deletedLocation = await this.findOneAndDelete({ name });
            return deletedLocation ? true : false;
        } catch (error) {
            debug(error);
            throw new Error(ERROR_MESSAGES.GENERAL.DELETE_ERROR);
        }
    }
}

export default mongoose.model(Location, locationSchema, "Location");
