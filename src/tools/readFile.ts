import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

export function readFile(filePath: string): string {
    
    try {

        const resolved = path.resolve(filePath);

        if(!fs.existsSync(resolved)) {
            return `Error: File not found at ${resolved}`;
        }

        const content = fs.readFileSync(resolved, "utf-8");
        logger.success(`Read file: ${resolved}`);
        return content;

    } catch(err: any) {

        logger.error(`Failed to read file: ${err.message}`);
        return `Error reading file: ${err.message}`;

    }
}