import OpenAI from "openai";

export function getLLMClient(apiKey: string): OpenAI {
    return new OpenAI({
        baseURL: 'https://api.x.ai/v1',
        apiKey
    });
}