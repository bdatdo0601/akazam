import jsf from "json-schema-faker";
import faker from "faker";

const DATA_AMOUNT = 10;

const schemas = [{ name: "Location", schema: "__mock__/schema/location.json" }];

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

export const createMockData = async () => {
    const result = {};
    for (const schema of schemas) {
        const data = await generateMockDataFromSchema(schema.schema, DATA_AMOUNT);
        result[schema.name] = data;
    }
    return result;
};
