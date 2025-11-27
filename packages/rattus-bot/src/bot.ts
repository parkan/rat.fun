import Anthropic from "@anthropic-ai/sdk"
import type { Config, Rat } from "./types"
import {
  setupMud,
  spawn,
  createRat,
  approveMaxTokens,
  getAllowance,
  getAvailableTrips,
  getPlayer,
  getRat,
  getGameConfig,
  canRatEnterTrip,
  getRatTotalValue
} from "./modules/mud"
import { enterTrip } from "./modules/server"
import { selectTrip } from "./modules/trip-selector"
import { addressToId, sleep, retryUntilResult } from "./modules/utils"
import {
  logInfo,
  logSuccess,
  logWarning,
  logError,
  logTrip,
  logRat,
  logDeath,
  logStats
} from "./modules/logger"

export async function runBot(config: Config) {
  logInfo("Starting Rattus Bot...")
  logInfo(`Chain ID: ${config.chainId}`)
  logInfo(`Server URL: ${config.serverUrl}`)
  logInfo(`Trip selector: ${config.tripSelector}`)
  logInfo(`Auto-respawn: ${config.autoRespawn}`)

  // Initialize Anthropic client if using Claude selector
  let anthropic: Anthropic | undefined
  if (config.tripSelector === "claude") {
    anthropic = new Anthropic({ apiKey: config.anthropicApiKey })
    logInfo("Claude API client initialized")
  }

  // Setup MUD
  logInfo("Setting up MUD connection...")
  const mud = await setupMud(config.privateKey, config.chainId, config.worldAddress)
  logSuccess("MUD setup complete!")

  const walletAddress = mud.walletClient.account.address
  const playerId = addressToId(walletAddress)
  logInfo(`Wallet address: ${walletAddress}`)
  logInfo(`Player ID: ${playerId}`)

  // Check if player exists
  logInfo("Checking player status...")
  let player = getPlayer(mud, playerId)

  if (!player) {
    logWarning("Player not found, spawning...")
    await spawn(mud, config.ratName)

    // Wait for player to appear in MUD state
    logInfo("Waiting for player to sync...")
    player = await retryUntilResult(() => getPlayer(mud, playerId), 10000, 500)

    if (!player) {
      throw new Error("Failed to create player - timeout waiting for sync")
    }
    logSuccess(`Player spawned: ${player.name}`)
  } else {
    logSuccess(`Player found: ${player.name}`)
  }

  // Check token allowance
  logInfo("Checking token allowance...")
  const gameConfig = getGameConfig(mud)
  const allowance = await getAllowance(mud, walletAddress)
  const requiredAllowance = BigInt(gameConfig.ratCreationCost) * BigInt(10 ** 18)

  if (allowance < requiredAllowance) {
    logWarning("Insufficient token allowance, approving max...")
    await approveMaxTokens(mud)
    logSuccess("Token allowance approved!")
  } else {
    logSuccess("Token allowance sufficient")
  }

  // Check for current rat
  logInfo("Checking rat status...")
  let rat: Rat | null = null
  let ratId = player.currentRat

  if (ratId) {
    rat = getRat(mud, ratId)
    if (rat && !rat.dead) {
      logSuccess(`Found live rat: ${rat.name} (balance: ${rat.balance})`)
    } else if (rat?.dead) {
      logWarning(`Rat ${rat.name} is dead`)
      rat = null
      ratId = null
    }
  }

  // Create rat if needed
  if (!rat) {
    logInfo(`Creating new rat: ${config.ratName}...`)
    await createRat(mud, config.ratName)

    // Wait for rat to appear
    logInfo("Waiting for rat to sync...")
    await sleep(3000) // Give the chain time to process

    // Re-fetch player to get the new currentRat
    player = getPlayer(mud, playerId)
    if (player?.currentRat) {
      ratId = player.currentRat
      rat = await retryUntilResult(() => getRat(mud, ratId!), 10000, 500)
    }

    if (!rat) {
      throw new Error("Failed to create rat - timeout waiting for sync")
    }
    logSuccess(`Rat created: ${rat.name} (balance: ${rat.balance})`)
  }

  // Main bot loop
  let tripCount = 0
  const startingBalance = rat.balance
  const startingRatName = rat.name

  logInfo("Starting main loop...")
  logInfo("==========================================")

  while (true) {
    // Get available trips
    const trips = getAvailableTrips(mud)
    logInfo(`Found ${trips.length} available trips`)

    if (trips.length === 0) {
      logWarning("No trips available, waiting 10 seconds...")
      await sleep(10000)
      continue
    }

    // Filter trips that the rat can actually enter
    const enterableTrips = trips.filter(trip => canRatEnterTrip(mud, rat!, trip))
    logInfo(`${enterableTrips.length} trips are enterable with current rat value`)

    if (enterableTrips.length === 0) {
      logWarning("Rat value too low to enter any trips, waiting 10 seconds...")
      await sleep(10000)
      continue
    }

    // Select a trip
    const selectedTrip = await selectTrip(config, enterableTrips, rat!, anthropic)
    if (!selectedTrip) {
      logError("Failed to select a trip")
      await sleep(5000)
      continue
    }

    tripCount++
    logTrip(tripCount, `Entering: "${selectedTrip.prompt.slice(0, 60)}..."`)
    logTrip(tripCount, `Trip balance: ${selectedTrip.balance}`)

    // Enter the trip
    try {
      const outcome = await enterTrip(config.serverUrl, mud.walletClient, selectedTrip.id, rat!.id)

      // Log the story
      if (outcome.log && outcome.log.length > 0) {
        console.log("")
        for (const entry of outcome.log) {
          console.log(`  ${entry.text}`)
        }
        console.log("")
      }

      // Check if rat died
      if (outcome.ratDead) {
        logDeath(rat!.name, tripCount)

        logStats({
          ratName: startingRatName,
          totalTrips: tripCount,
          startingBalance,
          finalBalance: 0
        })

        if (config.autoRespawn) {
          logInfo("Auto-respawn enabled, creating new rat...")

          await createRat(mud, config.ratName)
          await sleep(3000)

          // Re-fetch player and rat
          player = getPlayer(mud, playerId)
          if (player?.currentRat) {
            ratId = player.currentRat
            rat = await retryUntilResult(() => getRat(mud, ratId!), 10000, 500)
          }

          if (!rat) {
            throw new Error("Failed to create new rat after death")
          }

          logSuccess(`New rat created: ${rat.name} (balance: ${rat.balance})`)
          tripCount = 0 // Reset trip count for new rat
        } else {
          logInfo("Auto-respawn disabled, exiting...")
          break
        }
      } else {
        // Refresh rat state
        await sleep(2000) // Wait for chain state to update
        rat = getRat(mud, rat!.id)
        if (rat) {
          const totalValue = getRatTotalValue(mud, rat)
          logRat(
            rat.name,
            `Balance: ${rat.balance}, Total Value: ${totalValue}, Trips: ${tripCount}`
          )
        }
      }

      // Small delay between trips
      await sleep(2000)
    } catch (error) {
      logError(`Failed to enter trip: ${error instanceof Error ? error.message : String(error)}`)
      await sleep(5000)
    }
  }

  logInfo("Bot stopped.")
}
