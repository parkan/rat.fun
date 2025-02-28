import { MessageParam } from '@anthropic-ai/sdk/resources';
import OpenAI from 'openai';

export async function callModel(openai: OpenAI, messages: MessageParam[], system: string)  {
    const combinedMessages = [
        { role: "system", content: system },
        { role: "user", content: messages.map(m => m.content).join("\n") }
    ]

    const completion = await openai.chat.completions.create({
        messages: combinedMessages,
        model: "llama-3.3-70b-versatile"
      });

    return parseReturnMessage(completion);
}

function parseReturnMessage(msg: OpenAI.Chat.Completions.ChatCompletion) {
    let rawText = msg.choices[0].message.content ?? "";

    console.log('rawText', rawText);

    // Remove Markdown-style code block indicators
    rawText = rawText.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```$/, "");

    console.log('rawText cleaned', rawText);

    try {
        const returnValue = JSON.parse(rawText);
        return returnValue;
    } catch (error) {
        console.error("Failed to parse JSON:", error);
    }
}