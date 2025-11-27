import Anthropic from "@anthropic-ai/sdk"
import type { Trip, Rat } from "../../types"

/**
 * Use Claude to evaluate and select the best trip
 */
export async function selectTripWithClaude(
  anthropic: Anthropic,
  trips: Trip[],
  rat: Rat
): Promise<Trip | null> {
  if (trips.length === 0) return null
  if (trips.length === 1) return trips[0]

  const tripsForPrompt = trips.map(t => ({
    id: t.id,
    prompt: t.prompt,
    balance: t.balance
  }))

  const prompt = `You are an AI assistant helping a rat named "${rat.name}" choose which trip to enter in a game.

The rat currently has:
- Balance: ${rat.balance} credits
- ${rat.inventory.length} items in inventory

Available trips to choose from:
${JSON.stringify(tripsForPrompt, null, 2)}

Analyze each trip's prompt and balance. Consider:
1. Which trip scenario seems most favorable for the rat?
2. Which trip has a good balance (more potential rewards)?
3. Which trip prompt suggests interesting or manageable challenges?

Respond with ONLY the trip ID of your chosen trip. No explanation, just the ID.`

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 100,
      messages: [{ role: "user", content: prompt }]
    })

    const content = response.content[0]
    if (content.type !== "text") {
      console.warn("Unexpected response type from Claude, falling back to heuristic")
      return trips.sort((a, b) => b.balance - a.balance)[0]
    }

    const selectedId = content.text.trim()

    // Find the trip with this ID
    const selectedTrip = trips.find(t => t.id === selectedId)

    if (!selectedTrip) {
      console.warn(`Claude selected unknown trip ID: ${selectedId}, falling back to heuristic`)
      return trips.sort((a, b) => b.balance - a.balance)[0]
    }

    return selectedTrip
  } catch (error) {
    console.error("Error calling Claude API:", error)
    console.warn("Falling back to heuristic selection")
    return trips.sort((a, b) => b.balance - a.balance)[0]
  }
}
