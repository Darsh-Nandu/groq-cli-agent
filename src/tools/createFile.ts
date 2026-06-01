import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

export function createFile(filePath: string, content: string): string {

    try {

        const resolved = path.resolve(filePath);
        const dir = path.dirname(resolved);

        // Create parent directories if they don't exist
        if(!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true})
        }

        fs.writeFileSync(resolved, content, "utf-8");

        logger.success(`Created file: ${resolved}`)
        return `File created successfully at ${resolved}`

    } catch(err: any) {

        logger.error(`Failed to create file: ${err.message}`);
        return `Error creating file: ${err.message}`;
        
    }
}