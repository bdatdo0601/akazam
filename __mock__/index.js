import jsf from "json-schema-faker";
import faker from "faker";
import fs from "fs";

const DATA_AMOUNT = 10;

const schemas = [{ name: "location", schema: "__mock__/schema/location.json" }];

jsf.extend("faker", () => faker);

const generateMockDataFromSchema = async (schema, amount) => {
    const formattedSchema = {
        type: "array",
        items: {
            $ref: schema,
        },
        minItems: amount,
        maxItems: amount,
    };
    const data = await jsf.resolve(formattedSchema);
    return data;
};

const createMockData = async () => {
    const result = {};
    for (const schema of schemas) {
        const data = await generateMockDataFromSchema(schema.schema, DATA_AMOUNT);
        result[schema.name] = data;
    }
    return result;
};

createMockData().then(data => {
    Object.keys(data).forEach(key => {
        const jsonToWrite = {};
        jsonToWrite[key] = data[key];
        fs.writeFile(`__mock__/data/${key}.json`, JSON.stringify(jsonToWrite, null, 4), err => {
            if (err) {
                console.error(err);
                throw new Error("Cannot write file");
            }
        });
    });
});
