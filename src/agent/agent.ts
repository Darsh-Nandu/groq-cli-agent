import { groqClient, MODEL} from "../config/groq";
import { logger } from "../utils/logger";
import { runTool } from "./toolRunner";
import { saveMessage, getHistory } from "../db/memory";

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

export async function runAgent(userInput: string, sessionId: string): Promise<void> {
    logger.agent(`Processing: ${userInput}`);

    // Save user message to DB
    await saveMessage(sessionId, "user", userInput);

    // Load conversation from history from DB
    const history = await getHistory(sessionId, 10);
    
    const messages: any[] = [
        {
            role: "system",
            content: `You are a helpful CLI agent that manages the filesystem.

            IMPORTANT RULES:
            1. Only use a tool when the user EXPLICITLY asks to create, read, edit, delete, or scan files/directories.
            2. If the user is just chatting, greeting, or asking questions — respond conversationally WITHOUT using any tool.
            3. Do NOT create files to store conversation information unless the user specifically asks you to save something.
            4. Only call multiple tools if the user's request clearly requires multiple filesystem operations.
            5. When in doubt — just talk, do NOT use a tool.

            Examples of when to USE tools:
            - "create a file called hello.ts"
            - "read the file config.json"
            - "scan the current directory"
            - "delete temp.txt"

            Examples of when NOT to use tools:
            - "hi my name is Darsh" → just say hello back
            - "what is my name?" → answer from conversation history
            - "what can you do?" → explain your capabilities
            - "thanks!" → respond naturally`,
        },
        // Inject conversation history so agent remembers past messages
        ...history.map((msg) => ({
          role: msg.role,
          content: msg.content
        })),
    ];

    // Multi - tool loop
    let continueLoop = true;
    let finalResponse = "";

    while (continueLoop) {
      const response = await groqClient.chat.completions.create({
        model: MODEL,
        messages,
        tools,
        tool_choice: "auto"
      });

      const message = response.choices[0].message;
      messages.push(message);

      if (message.tool_calls && message.tool_calls.length > 0) {
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name;
          const toolArgs = JSON.parse(toolCall.function.arguments);
          
          const toolResult = runTool(toolName, toolArgs);

          // Save tool call to DB
          await saveMessage(
              sessionId,
              "tool",
              `Tool: ${toolName} | Args ${JSON.stringify(toolArgs)}`,
              toolName,
              toolResult,
          );

          // Add tool result to the conversation for the next loop
          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        } 
      } else {
        finalResponse = message.content ?? "Done!";
        continueLoop = false; 
      }
    }

    // Save final assistant response to DB
    await saveMessage(sessionId, "assistant", finalResponse);
    logger.agent(finalResponse);
}