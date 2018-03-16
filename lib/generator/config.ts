import * as yaml from "js-yaml";
import * as fs from "fs";
import { IJekyllConfig } from "./config.interface";

/**
 * Loads config
 */
export const loadConfig = (path): Promise<IJekyllConfig> => new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (error, data) => {
        if (error) {
            return reject(error);
        }
        try {
            resolve(yaml.safeLoad(data));
        } catch (parseError) {
            reject(parseError);
        }
    });
});
