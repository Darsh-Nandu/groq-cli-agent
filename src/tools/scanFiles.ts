import fs from "fs";
import path from 'path';
import { logger } from "../utils/logger";

export function scanFiles(dirPath: string = "."): string {
    try {

        const resolved = path.resolve(dirPath);

        if (!fs.existsSync(resolved)) {
            return `Error: Directory not found at ${resolved}`;
        }

        const entries = fs.readdirSync(resolved, { withFileTypes: true });

        const result = entries.map(
            (e) => (e.isDirectory() ? `📁 ${e.name}/` : `📄 ${e.name}`)
        ).join("\n");

        logger.success(`Scanned directory: ${resolved}`)
        return result || "Directory is empty."

    } catch(err: any) {

        logger.error(`Failed to scan directory: ${err.message}`)
        return `Error scanning directory: ${err.message}`

    }   
}