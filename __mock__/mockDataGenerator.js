import { createMockData } from "./index";
import fs from "fs";

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
