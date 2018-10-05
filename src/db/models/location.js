/**
 * Location Model
 *
 * hold a real world's location in a format that can be easily retrieve, search, etc
 */
import mongoose, { Schema, Model } from "mongoose";
import addressParser from "parse-address";

const debug = require("debug")("Akazam:Location");

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
    static async createNewLocation(rawData) {
        try {
            const convertedAddress = convertAddress(rawData.address);
            const data = convertedAddress ? { ...rawData, ...convertedAddress } : rawData;
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
            const location = await this.findOne({ name });
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
    static async updateLocationByName(name, updatedRawData, shouldCreateNew = false) {
        try {
            if (!name) throw new Error("Invalid Inputs");
            const convertedAddress = convertAddress(updatedRawData.address);
            const data = convertedAddress
                ? { ...updatedRawData, ...EMPTY_ADDRESS, ...convertedAddress }
                : updatedRawData;
            const location = await this.updateOne({ name }, data, { upsert: shouldCreateNew });
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
            await this.deleteOne({ name });
            return true;
        } catch (error) {
            debug(error);
            throw new Error("Could not initiate searching process");
        }
    }
}

export default mongoose.model(Location, locationSchema, "Location");
