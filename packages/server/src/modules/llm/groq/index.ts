import OpenAI from "openai";

export function getLLMClient(apiKey: string): OpenAI {
    return new OpenAI({
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey
    });
}