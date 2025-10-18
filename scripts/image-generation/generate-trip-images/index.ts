import Replicate from "replicate"
import type { FileOutput } from "replicate"
import sharp = require("sharp")
import { PROMPTS } from "./prompts"
import * as path from "path"
import * as fs from "fs"
import { program } from "commander"
import { createClient } from "@sanity/client"

// Load .env from parent directory
import dotenv = require("dotenv")
dotenv.config({ path: path.resolve(__dirname, "../../.env") })

// Sanity CMS client setup
const PUBLIC_SANITY_CMS_ID = process.env.PUBLIC_SANITY_CMS_ID
const PUBLIC_SANITY_CMS_TOKEN = process.env.PUBLIC_SANITY_CMS_TOKEN

const publicSanityClient = createClient({
  projectId: PUBLIC_SANITY_CMS_ID,
  dataset: "production",
  token: PUBLIC_SANITY_CMS_TOKEN,
  useCdn: false, // `false` if you want to ensure fresh data
  apiVersion: "2025-04-18"
})

// CMS query for template images
const TEMPLATE_IMAGES_QUERY =
  '*[_id == "template-images"]{..., "tripImages": tripImages[].asset->url}[0]'

// Types
interface ResolvedTemplateImages {
  tripImages?: string[]
}

// const FIXED_PROMPT =
//   "The rat is stuck in casino. If it gets to the center a group of clowns will allow it to make a wish."

// const FIXED_PROMPT = "An insane clown gvies the rat a gift."

// const FIXED_PROMPT = "A rat is being chased by a dog."

// const FIXED_PROMPT =
//   "If the rat is not a true communist it is shot in the head with a Bulgarian AK47."

// const FIXED_PROMPT = "Rat gets Swastika tattooed on his forehead."
// const FIXED_PROMPT = "A happy beautiful place that gives the rat health an peace."

// const FIXED_PROMPT = "A rat spa with happy ending."

// const FIXED_PROMPT = "Rat can trade an item for its opposite."

// const FIXED_PROMPT = "Rat is crucified on a cross."

const FIXED_PROMPT = "Paradise on Earth for the rat."

// const FIXED_PROMPT = "asdf00ß9aw0483nq23r0934rmn02ß1349rimcaso9d"

const client = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
})

const pickRandomMultiple = <T>(array: T[], count: number): T[] => {
  return array.sort(() => Math.random() - 0.5).slice(0, count)
}

const pickRandom = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

const MODEL = {
  // SD: "google/imagen-4-fast" as const
  SD: "stability-ai/stable-diffusion-3.5-medium" as const
  // SD: "bytedance/sdxl-lightning-4step:5599ed30703defd1d160a25a63321b4dec97101d98b4674bcc56e41f62f35637" as const
}

const sanitizePrompt = (prompt: string): string => {
  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .substring(0, 100)
}

const createOutputDirectory = (prompt: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  const sanitizedPrompt = sanitizePrompt(prompt)
  const dirName = `${timestamp}_${sanitizedPrompt}`
  const outputDir = path.join(process.cwd(), "output", dirName)

  fs.mkdirSync(outputDir, { recursive: true })

  return outputDir
}

const makePrompt = (prompt: string) => {
  // const randomPrompts = pickRandomMultiple(PROMPTS, 2).join(" ")
  const postFix = "rat-faced, 4K, highly detailed, high contrast,  extreme fisheye distortion"
  return `SCENE: ${prompt}. STYLE: ${postFix}`
}

/**
 * Load data from Sanity CMS
 * @param query - GROQ query string
 * @param params - Query parameters
 * @returns Promise with the fetched data
 */
const loadDataPublicSanity = async (query: string, params: any) => {
  try {
    const res = await publicSanityClient.fetch(query, params)
    if (res === null) {
      throw new Error("404 - Data not found")
    }
    return res
  } catch (err) {
    throw new Error(`CMS Error: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/**
 * Get template images from CMS (matches server module)
 * @returns The template images document
 */
const getTemplateImages = async (): Promise<ResolvedTemplateImages> => {
  try {
    console.log("Fetching template images from CMS...")
    const templateImages = (await loadDataPublicSanity(
      TEMPLATE_IMAGES_QUERY,
      {}
    )) as ResolvedTemplateImages

    if (!templateImages) {
      throw new Error("Missing template images data")
    }

    console.log(`✓ Found ${templateImages.tripImages?.length || 0} template images`)
    return templateImages
  } catch (error) {
    console.error("Error fetching template images:", error)
    throw new Error(
      `Failed to get template images: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

interface GenerationLog {
  timestamp: string
  model: string
  input: {
    prompt: string
    negative_prompt?: string
    image?: string
    cfg?: number
    guidance_scale?: number
    aspect_ratio?: string
    output_format?: string
    output_quality?: number
    prompt_strength?: number
    steps?: number
    num_inference_steps?: number
  }
  output: {
    filename: string
    bufferSize: number
  }
  error?: string
}

/**
 * Generate an image using Replicate (matches server module structure)
 * @param prompt - The prompt for the image
 * @param templateImages - The template images to use for the image
 * @param skipSharpProcessing - Whether to skip sharp image processing
 * @param skipInputImage - Whether to skip using an input template image
 * @returns The generated image buffer and metadata
 */
export const generateImage = async (
  prompt: string,
  templateImages: ResolvedTemplateImages,
  skipSharpProcessing: boolean = false,
  skipInputImage: boolean = false
) => {
  // Pick a random image from tripImages (matching server module) unless disabled
  const image = skipInputImage
    ? undefined
    : templateImages?.tripImages
      ? pickRandom(templateImages.tripImages)
      : undefined
  const fullPrompt = makePrompt(prompt)

  const INPUT = {
    SD: {
      image,
      prompt: fullPrompt,
      negative_prompt:
        "video game, illustration, manga, comic, cartoon, anime,drawing, sketch, line art, flat color, abstract, minimalistic, flat, flat shading, flat lighting",
      cfg: 1.3,
      guidance_scale: 20,
      aspect_ratio: "1:1",
      output_format: "webp",
      output_quality: 100,
      prompt_strength: 1.0,
      steps: 1,
      num_inference_steps: 1
    }
  }

  try {
    const output = await client.run(MODEL.SD as any, { input: INPUT.SD })

    if (!output) {
      throw new Error("No output received from Replicate")
    }

    let buffer: Buffer

    // Handle different output formats (matching server module)
    if (Array.isArray(output) && output[0]) {
      // Legacy format: array of FileOutput objects
      console.log("Handling array format with FileOutput objects")
      const fileOutput = output[0] as FileOutput

      let blob
      try {
        blob = await fileOutput.blob()
        console.log("Blob obtained successfully:", blob)
      } catch (blobError) {
        console.error("Error getting blob:", blobError)
        throw new Error(`Failed to get blob from output: ${blobError}`)
      }

      const arrayBuffer = await blob.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else if (typeof output === "string") {
      // New format: direct URL string
      console.log("Handling string format (URL):", output)

      try {
        const response = await fetch(output)
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
        console.log("Image fetched from URL, buffer size:", buffer.length)
      } catch (fetchError) {
        console.error("Error fetching image from URL:", fetchError)
        throw new Error(`Failed to fetch image from URL: ${fetchError}`)
      }
    } else if (output && typeof output === "object" && "getReader" in output) {
      // Newest format: ReadableStream
      console.log("Handling ReadableStream format")

      try {
        const reader = (output as ReadableStream<Uint8Array>).getReader()
        const chunks: Uint8Array[] = []

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          chunks.push(value)
        }

        // Combine all chunks into a single buffer
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
        const combinedBuffer = new Uint8Array(totalLength)
        let offset = 0

        for (const chunk of chunks) {
          combinedBuffer.set(chunk, offset)
          offset += chunk.length
        }

        buffer = Buffer.from(combinedBuffer)
        console.log("ReadableStream processed, buffer size:", buffer.length)
      } catch (streamError) {
        console.error("Error processing ReadableStream:", streamError)
        throw new Error(`Failed to process ReadableStream: ${streamError}`)
      }
    } else {
      throw new Error(`Unexpected output format: ${typeof output}`)
    }

    // Process image with sharp (matching server module) unless disabled
    const finalBuffer = skipSharpProcessing
      ? buffer
      : await sharp(buffer)
          // Merge with noise texture first
          .composite([
            {
              input: await sharp(path.join(__dirname, "noise2.png"))
                .modulate({ brightness: 0.3 })
                .toBuffer(),
              blend: "overlay"
            }
          ])
          // Add coarse grain before sharp modulation
          // .convolve({
          //   width: 3,
          //   height: 3,
          //   kernel: [-1, -1, -1, -1, 9, -1, -1, -1, -1]
          // })
          // .linear(1.5, 20) // Contrast: 1.5x multiplier, Brightness: +20 offset
          .modulate({
            saturation: 2,
            hue: Math.floor(Math.random() * 360)
          })
          .toBuffer()

    return {
      buffer: finalBuffer,
      prompt: fullPrompt,
      input: INPUT.SD
    }
  } catch (error) {
    console.error(error)
    throw new Error(error as string)
  }
}

const logGeneration = (outputDir: string, logEntry: GenerationLog) => {
  const logPath = path.join(outputDir, "generation-log.txt")
  const logLine = `${logEntry.timestamp} | ${logEntry.model} | ${logEntry.input.prompt} | ${logEntry.output.filename} | ${logEntry.output.bufferSize} bytes${logEntry.error ? ` | ERROR: ${logEntry.error}` : ""}\n`

  // Append to generation log
  fs.appendFileSync(logPath, logLine)

  // Also append to detailed JSON log
  const jsonLogPath = path.join(outputDir, "generation-details.json")
  const existingLogs = fs.existsSync(jsonLogPath)
    ? JSON.parse(fs.readFileSync(jsonLogPath, "utf8"))
    : []
  existingLogs.push(logEntry)
  fs.writeFileSync(jsonLogPath, JSON.stringify(existingLogs, null, 2))
}

const processRun = async (
  variations: number,
  skipSharpProcessing: boolean = false,
  skipInputImage: boolean = false
) => {
  const prompt = FIXED_PROMPT
  console.log(`\nProcessing run with prompt: "${prompt}"`)
  console.log(`Generating ${variations} variations...`)

  // Get template images from CMS (matching server module) unless skipping input image
  const templateImages = skipInputImage ? { tripImages: [] } : await getTemplateImages()

  const outputDir = createOutputDirectory(prompt)
  console.log(`Saving images to: ${outputDir}`)

  // Write run metadata
  const runMetadata = {
    timestamp: new Date().toISOString(),
    prompt,
    variations,
    model: MODEL.SD,
    outputDirectory: outputDir,
    templateImagesCount: templateImages.tripImages?.length || 0,
    templateImages: templateImages.tripImages,
    skipSharpProcessing,
    skipInputImage
  }
  fs.writeFileSync(path.join(outputDir, "run-metadata.json"), JSON.stringify(runMetadata, null, 2))

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < variations; i++) {
    console.log(`Generating image ${i + 1}/${variations}...`)
    const generationTimestamp = new Date().toISOString()

    try {
      const result = await generateImage(
        prompt,
        templateImages,
        skipSharpProcessing,
        skipInputImage
      )
      const { buffer: imageBuffer, prompt: fullPrompt, input } = result

      const sanitizedPrompt = sanitizePrompt(fullPrompt)
      const filename = `${timestamp}__${i + 1}__${sanitizedPrompt}.webp`
      const outputPath = path.join(outputDir, filename)

      fs.writeFileSync(outputPath, imageBuffer)
      console.log(`✓ Saved image to: ${outputPath}`)

      // Log successful generation
      const logEntry: GenerationLog = {
        timestamp: generationTimestamp,
        model: MODEL.SD,
        input: {
          prompt: fullPrompt,
          image: input.image,
          cfg: input.cfg,
          aspect_ratio: input.aspect_ratio,
          output_format: input.output_format,
          output_quality: input.output_quality,
          prompt_strength: input.prompt_strength,
          steps: input.steps
        },
        output: {
          filename,
          bufferSize: imageBuffer.length
        }
      }

      logGeneration(outputDir, logEntry)
      successCount++
    } catch (error) {
      console.error(`✗ Error generating image ${i + 1}:`, error)
      errorCount++

      // Log failed generation
      const logEntry: GenerationLog = {
        timestamp: generationTimestamp,
        model: MODEL.SD,
        input: {
          prompt: prompt,
          negative_prompt:
            "video game, illustration, manga, comic, cartoon, anime,drawing, sketch, line art, flat color, abstract, minimalistic, flat, flat shading, flat lighting",
          cfg: 10, // 2
          guidance_scale: 50,
          aspect_ratio: "1:1",
          output_format: "webp",
          output_quality: 80,
          prompt_strength: 0.8,
          steps: 28,
          num_inference_steps: 1
        },
        output: {
          filename: `failed_${i + 1}`,
          bufferSize: 0
        },
        error: error instanceof Error ? error.message : String(error)
      }

      logGeneration(outputDir, logEntry)
    }
  }

  console.log(`\nGeneration complete!`)
  console.log(`✓ Successful: ${successCount}`)
  console.log(`✗ Failed: ${errorCount}`)
  console.log(`📁 Output directory: ${outputDir}`)
}

const main = async () => {
  program
    .requiredOption("-n, --number <number>", "Number of images to generate", parseInt)
    .option("--skip-sharp", "Skip sharp image processing (saturation adjustment)")
    .option("--skip-input-image", "Skip using input template images (text-to-image only)")
    .parse(process.argv)

  const { number, skipSharp, skipInputImage } = program.opts()
  await processRun(number, skipSharp, skipInputImage)
  console.log("\nAll generations complete!")
}

main().catch(console.error)
