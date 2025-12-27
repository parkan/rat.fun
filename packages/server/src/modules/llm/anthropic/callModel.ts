import { MessageParam } from "@anthropic-ai/sdk/resources"
import Anthropic from "@anthropic-ai/sdk"
import { z } from "zod"
import {
  LLMError,
  LLMAPIError,
  LLMParseError,
  LLMSchemaError,
  LLMOverloadedError,
  LLMTruncatedError,
  LLMRefusalError,
  LLMToolUseError,
  LLMPausedError,
  LLMRateLimitError,
  LLMAuthenticationError,
  LLMPermissionError,
  LLMRequestTooLargeError,
  LLMInvalidRequestError
} from "@modules/error-handling/errors"

const MAX_TOKENS = Number(process.env.LLM_MAX_TOKENS) || 4096

// Overload: with schema - returns typed result
export async function callModel<T extends z.ZodTypeAny>(
  anthropic: Anthropic,
  messages: MessageParam[],
  system: string,
  model: string,
  temperature: number,
  schema: T
): Promise<z.infer<T>>

// Overload: without schema - returns unknown
export async function callModel(
  anthropic: Anthropic,
  messages: MessageParam[],
  system: string,
  model: string,
  temperature?: number
): Promise<unknown>

// Implementation
export async function callModel<T extends z.ZodTypeAny>(
  anthropic: Anthropic,
  messages: MessageParam[],
  system: string,
  model: string,
  temperature: number = 1,
  schema?: T
): Promise<unknown> {
  try {
    const msg = await anthropic.messages.create({
      model,
      max_tokens: MAX_TOKENS,
      messages,
      system: [
        {
          type: "text",
          text: system,
          cache_control: { type: "ephemeral" }
        }
      ],
      temperature
    })

    // Check stop_reason for various error conditions
    switch (msg.stop_reason) {
      case "max_tokens":
        throw new LLMTruncatedError(
          `LLM response truncated: hit max_tokens limit (${MAX_TOKENS}). input_tokens: ${msg.usage.input_tokens}, output_tokens: ${msg.usage.output_tokens}`,
          msg.stop_reason,
          msg.usage.input_tokens,
          msg.usage.output_tokens,
          MAX_TOKENS
        )

      case "refusal":
        throw new LLMRefusalError(
          `LLM refused to respond (policy violation). model: ${msg.model}, content_blocks: [${msg.content.map(b => b.type).join(", ")}]`,
          msg.model,
          msg.content.map(b => b.type)
        )

      case "tool_use": {
        const toolNames = msg.content
          .filter((b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use")
          .map(b => b.name)
        throw new LLMToolUseError(
          `LLM attempted to use tools instead of returning JSON. model: ${msg.model}, tools: [${toolNames.join(", ")}]`,
          msg.model,
          toolNames
        )
      }

      case "pause_turn":
        throw new LLMPausedError(
          `LLM response was paused mid-turn. model: ${msg.model}, input_tokens: ${msg.usage.input_tokens}, output_tokens: ${msg.usage.output_tokens}`,
          msg.model
        )
    }

    return parseReturnMessage(msg, schema)
  } catch (error) {
    // If it's already one of our custom errors, rethrow it
    if (error instanceof LLMError) {
      throw error
    }

    // Handle Anthropic SDK errors (APIError has status property)
    if (error instanceof Anthropic.APIError) {
      const status = error.status
      const errorType = (error as { error?: { type?: string } }).error?.type
      const errorMessage = error.message

      switch (status) {
        case 400:
          throw new LLMInvalidRequestError(
            `Anthropic API invalid request (400): ${errorMessage}. error_type: ${errorType}`,
            error
          )

        case 401:
          throw new LLMAuthenticationError(
            `Anthropic API authentication failed (401): ${errorMessage}. error_type: ${errorType}`,
            error
          )

        case 403:
          throw new LLMPermissionError(
            `Anthropic API permission denied (403): ${errorMessage}. error_type: ${errorType}`,
            error
          )

        case 413:
          throw new LLMRequestTooLargeError(
            `Anthropic API request too large (413): ${errorMessage}. error_type: ${errorType}`,
            error
          )

        case 429:
          throw new LLMRateLimitError(
            `Anthropic API rate limit exceeded (429): ${errorMessage}. error_type: ${errorType}`,
            error
          )

        case 500:
          throw new LLMAPIError(
            `Anthropic API internal error (500): ${errorMessage}. error_type: ${errorType}`,
            error
          )

        case 529:
          throw new LLMOverloadedError(
            `Anthropic API overloaded (529): ${errorMessage}. error_type: ${errorType}`,
            error
          )

        default:
          throw new LLMAPIError(
            `Anthropic API error (${status}): ${errorMessage}. error_type: ${errorType}`,
            error
          )
      }
    }

    // Otherwise, wrap it in our custom error
    throw new LLMAPIError(
      `Error calling Anthropic API: ${error instanceof Error ? error.message : String(error)}`,
      error
    )
  }
}

function parseReturnMessage<T extends z.ZodTypeAny>(
  msg: Anthropic.Messages.Message,
  schema?: T
): unknown {
  try {
    // Check for empty content array
    if (!msg.content || msg.content.length === 0) {
      throw new LLMParseError(
        `LLM returned empty content array. stop_reason: ${msg.stop_reason}, model: ${msg.model}`,
        ""
      )
    }

    // Collect all text from text blocks
    let rawText = ""
    const blockTypes: string[] = []
    for (const contentBlock of msg.content) {
      blockTypes.push(contentBlock.type)
      if (contentBlock.type === "text") {
        rawText += contentBlock.text
      }
    }

    // Check if no text blocks were found
    if (!rawText) {
      throw new LLMParseError(
        `LLM response contained no text blocks. Content block types: [${blockTypes.join(", ")}], stop_reason: ${msg.stop_reason}, model: ${msg.model}`,
        ""
      )
    }

    // Check for empty/whitespace-only text
    if (!rawText.trim()) {
      throw new LLMParseError(
        `LLM returned empty text content. Content block types: [${blockTypes.join(", ")}], stop_reason: ${msg.stop_reason}, model: ${msg.model}`,
        rawText
      )
    }

    // Remove Markdown-style code block indicators
    rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/, "")

    // Parse the text into a native object
    let parsedValue: unknown
    try {
      parsedValue = JSON.parse(rawText)
    } catch (parseError) {
      throw new LLMParseError(
        `Failed to parse LLM response as JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`,
        rawText
      )
    }

    // If a schema is provided, validate and transform the parsed value
    if (schema) {
      const result = schema.safeParse(parsedValue)
      if (!result.success) {
        throw new LLMSchemaError(
          `LLM response failed schema validation: ${result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ")}`,
          rawText,
          result.error.issues
        )
      }
      return result.data
    }

    return parsedValue
  } catch (error) {
    // If it's already one of our custom errors, rethrow it
    if (error instanceof LLMError) {
      throw error
    }

    // Otherwise, wrap it in our custom error
    throw new LLMError(
      "LLM_PARSE_ERROR",
      "LLM processing error",
      `Error parsing LLM response: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
