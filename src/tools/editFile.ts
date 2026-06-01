import fs from 'fs';
import path from "path";
import { logger } from "../utils/logger";

export function editFile(filePath: string, newContent: string): string {

    try {
        const resolved = path.resolve(filePath);

        if (!fs.existsSync(resolved)) {
            return `Error: File not found at ${resolved}`;
        }

        fs.writeFileSync(resolved, newContent, "utf-8");
        logger.success(`Edited file: ${resolved}`);
        return `File edited successfully: ${resolved}`

    } catch(err: any) {

        logger.error(`Failed to edit file: ${err.message}`);
        return `Error editing file: ${err.message}`;

    }
}