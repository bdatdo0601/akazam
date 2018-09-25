import mongoose, { Schema, Model } from "mongoose";
import addressParser from "parse-address";

const locationSchema = new Schema({
    name: {
        type: String,
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
    static async createNewLocation(rawData, callback = () => {}) {
        try {
            const convertedAddress = convertAddress(rawData.address);
            const data = convertedAddress ? { ...rawData, ...convertedAddress } : rawData;
            const newLocation = new Location(data);
            const newLocationDocument = await newLocation.save();
            callback();
            return newLocationDocument;
        } catch (error) {
            console.error(error);
            throw new Error("cannot create new location");
        }
    }
}

export default mongoose.model(Location, locationSchema, "Location");
