import { createFile, readFile, scanFiles, deleteFile, editFile } from  "../tools";
import { logger } from "../utils/logger";

export function runTool(toolName: string, toolArgs: Record<string,string>): string {
    logger.tool(`Running tool: ${toolName}`);

    switch (toolName) {
        case "create_file":
            return createFile(toolArgs.file_path, toolArgs.content);

        case "read_file":
            return readFile(toolArgs.file_path);

        case "scan_files":
            return scanFiles(toolArgs.dir_path ?? ".");

        case "delete_file":
            return deleteFile(toolArgs.file_path);

        case "edit_file":
            return editFile(toolArgs.file_path, toolArgs.new_content);

        default:
            logger.error(`Unknown tool: ${toolName}`);
            return `Error: Unknown tool "${toolName}"`;
    }
}