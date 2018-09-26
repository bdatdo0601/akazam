import mongoose, { Schema, Model } from "mongoose";
import addressParser, { parseAddress } from "parse-address";

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
    static async updateLocationByName(name, updatedRawData, shouldCreateNew = true) {
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
