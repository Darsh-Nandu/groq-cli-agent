import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

if(!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is missing! Add it to your .env file.")
}

export const groqClient = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const MODEL = "llama-3.3-70b-versatile";