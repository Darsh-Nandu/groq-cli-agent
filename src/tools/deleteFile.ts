import fs from "fs";
import path from "path";
import { logger } from "../utils/logger";

export function deleteFile(filePath: string): string {

  try {
    
    const resolved = path.resolve(filePath);

    if (!fs.existsSync(resolved)) {
      return `Error: File not found at ${resolved}`;
    }

    fs.unlinkSync(resolved);
    logger.success(`Deleted file: ${resolved}`);
    return `File deleted successfully: ${resolved}`;

  } catch (err: any) {

    logger.error(`Failed to delete file: ${err.message}`);
    return `Error deleting file: ${err.message}`;

  }
}