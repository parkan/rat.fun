import OpenAI from "openai";

export function getLLMClient(apiKey: string): OpenAI {
    return new OpenAI({
        baseURL: "https://api.lambdalabs.com/v1",
        apiKey
    });
}