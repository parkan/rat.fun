import { pickRandom } from "@modules/utils"
import Replicate from "replicate"
import type { FileOutput } from "replicate"

import dotenv from "dotenv"
dotenv.config()

const client = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
})

const PREPROMPT = "STYLE: Extreme fisheye distortion. High contrast black and white. Everything needs to be rat sized. NEVER include any humans. Cursed atmosphere. Liminal space. CONTENT: Security camera view of a clinical experiment room with the description: "
const MODEL = "black-forest-labs/flux-dev"
const IMAGE_TEMPLATES = [
  "https://rat-room-pyrope.netlify.app/images/room-templates/room-1.jpg",
  "https://rat-room-pyrope.netlify.app/images/room-templates/room-2.jpg",
  "https://rat-room-pyrope.netlify.app/images/room-templates/room-3.jpg",
  "https://rat-room-pyrope.netlify.app/images/room-templates/room-4.jpg",
  "https://rat-room-pyrope.netlify.app/images/room-templates/room-5.jpg",
  "https://rat-room-pyrope.netlify.app/images/room-templates/room-6.jpg",
  "https://rat-room-pyrope.netlify.app/images/room-templates/room-7.jpg"
]

export const generateImage = async (prompt: string = "A rat") => {
  const input = {
    image: pickRandom(IMAGE_TEMPLATES),
    prompt: `${PREPROMPT} ${prompt}.`,
    go_fast: true,
    guidance: 3.5,
    megapixels: "1",
    num_outputs: 1,
    aspect_ratio: "4:3",
    output_format: "webp",
    output_quality: 80,
    prompt_strength: 0.90, // 0.73
    num_inference_steps: 20, // 28
  }

  try {
    const output = await client.run(MODEL, { input }) as FileOutput[]

    if (!output[0]) throw new Error("No output received from Replicate")

    // Get the image data directly as a blob
    const blob = await output[0].blob()
    
    // Convert blob to buffer
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return buffer
  } catch (error) {
    throw new Error(error as string)
  }
}
