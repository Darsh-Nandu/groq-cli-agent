import { groqClient, MODEL} from "../config/groq";
import { logger } from "../utils/logger";
import { runTool } from "./toolRunner";

// Tool defination
const tools = [
  {
    type: "function" as const,
    function: {
      name: "create_file",
      description: "Create a new file with the given content at the specified path",
      parameters: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Path where the file should be created" },
          content: { type: "string", description: "Content to write into the file" },
        },
        required: ["file_path", "content"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "read_file",
      description: "Read and return the contents of a file",
      parameters: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Path of the file to read" },
        },
        required: ["file_path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "scan_files",
      description: "List all files and folders in a directory",
      parameters: {
        type: "object",
        properties: {
          dir_path: { type: "string", description: "Directory path to scan (defaults to current directory)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_file",
      description: "Delete a file at the specified path",
      parameters: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Path of the file to delete" },
        },
        required: ["file_path"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "edit_file",
      description: "Edit/overwrite an existing file with new content",
      parameters: {
        type: "object",
        properties: {
          file_path: { type: "string", description: "Path of the file to edit" },
          new_content: { type: "string", description: "New content to write into the file" },
        },
        required: ["file_path", "new_content"],
      },
    },
  },
];

export async function runAgent(userInput: string): Promise<void> {
    logger.agent(`Processing: ${userInput}`);

    const messages: any[] = [
        {
            role: "system",
            content: `You are a helpful CLI agent that manages the filesystem.
            When the user asks you to do somethingm, use the appropriate tool if any tool is needed to dp that task.
            After using a tool, summarize what you did in one clear sentance.`,
        },
        {
            role: "user",
            content: userInput,
        }
    ];

    const response = await groqClient.chat.completions.create({
        model: MODEL,
        messages,
        tools,
        tool_choice: "auto"
    });

    const message = response.choices[0].message;

    // Check if ai want to use a tool
    if(message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);

        // Run the tool
        const toolResult = runTool(toolName, toolArgs);

        // Send tool results back to Groq for final response
        messages.push(message);
        messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult
        });
        
        const finalResponse = await groqClient.chat.completions.create({
            model: MODEL,
            messages,
            tools,
        });

        logger.agent(finalResponse.choices[0].message.content ?? "Done!");
    } else {
        logger.agent(message.content ?? "No response.");
    }
}