import { Howl, Howler } from "howler"
import { soundLibrary } from "$lib/modules/sound/sound-library"
import type { SoundAssets, PlaySoundConfig } from "./types"
import { backgroundMusic } from "$lib/modules/sound/stores"

export type { PlaySoundConfig }

// =============================================================================
// AUDIO CONTEXT MANAGEMENT
// =============================================================================

/**
 * Attempts to resume the Web Audio API AudioContext if it's suspended.
 * This is required on iOS where AudioContext starts suspended and must be
 * resumed after a user gesture.
 */
function tryResumeAudioContext(): void {
  const ctx = Howler.ctx
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {
      // Silently ignore - context will resume on next user gesture
    })
  }
}

// =============================================================================
// LAZY LOADING CACHE FOR MASCOT & TRANSITION SOUNDS
// =============================================================================

const MASCOT_CACHE_SIZE = 8 // Keep last 8 mascot sounds in memory
const TRANSITION_CACHE_SIZE = 3 // Keep last 3 transition sounds in memory

type CacheEntry = {
  sound: Howl
  lastUsed: number
}

const mascotCache = new Map<string, CacheEntry>()
const transitionCache = new Map<string, CacheEntry>()

/**
 * Gets a sound from cache or loads it lazily.
 * Uses LRU eviction when cache is full.
 */
function getOrLoadSound(
  category: string,
  id: string,
  cache: Map<string, CacheEntry>,
  maxSize: number
): Howl | undefined {
  const cacheKey = `${category}.${id}`

  // Check cache first
  if (cache.has(cacheKey)) {
    const entry = cache.get(cacheKey)!
    entry.lastUsed = Date.now()
    return entry.sound
  }

  // Load the sound
  const libraryItem = soundLibrary[category]?.[id]
  if (!libraryItem) {
    console.warn(`Sound "${id}" not found in category "${category}"`)
    return undefined
  }

  const sound = new Howl({
    src: [libraryItem.src],
    volume: libraryItem.volume,
    preload: true,
    html5: false
  })

  // Evict oldest entry if cache is full
  if (cache.size >= maxSize) {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of cache) {
      if (entry.lastUsed < oldestTime) {
        oldestTime = entry.lastUsed
        oldestKey = key
      }
    }

    if (oldestKey) {
      const oldEntry = cache.get(oldestKey)
      if (oldEntry) {
        oldEntry.sound.unload()
      }
      cache.delete(oldestKey)
    }
  }

  // Add to cache
  cache.set(cacheKey, {
    sound,
    lastUsed: Date.now()
  })

  return sound
}

// =============================================================================
// EAGER PRELOADING (UI SOUNDS ONLY)
// =============================================================================

/**
 * Preloads a sound library by creating Howl instances for each sound.
 * This ensures that there's minimal delay when the sounds are played for the first time.
 *
 * Forces Web Audio API usage to avoid iOS HTML5 Audio element limits (~20-30 elements).
 */
function preloadSoundLibrary(library: SoundAssets): void {
  for (const key in library) {
    library[key].sound = new Howl({
      src: [library[key].src],
      volume: library[key].volume,
      preload: true,
      html5: false // Force Web Audio API to avoid iOS HTML5 Audio pool exhaustion
    })
  }
}

// =============================================================================
// INITIALIZATION & CLEANUP
// =============================================================================

/**
 * Initializes the sound system.
 * - UI sounds are eagerly preloaded (frequently used, need instant response)
 * - Music, mascot, and transition sounds are loaded on demand (saves ~80-100MB RAM)
 */
export function initSound(): void {
  // Only preload UI sounds - they're small and frequently used
  preloadSoundLibrary(soundLibrary.ratfunUI)

  // Music, mascot, and transitions are loaded on demand
  // This saves significant memory (~80-100MB)

  document.addEventListener("visibilitychange", handleVisibilityChange)
}

/**
 * Cleans up all sound resources.
 * Unloads all Howl instances and clears caches to free memory.
 */
export function cleanupSound(): void {
  document.removeEventListener("visibilitychange", handleVisibilityChange)

  // Unload all preloaded UI sounds
  for (const key in soundLibrary.ratfunUI) {
    if (soundLibrary.ratfunUI[key].sound) {
      soundLibrary.ratfunUI[key].sound!.unload()
      soundLibrary.ratfunUI[key].sound = undefined
    }
  }

  // Clear and unload mascot cache
  for (const entry of mascotCache.values()) {
    entry.sound.unload()
  }
  mascotCache.clear()

  // Clear and unload transition cache
  for (const entry of transitionCache.values()) {
    entry.sound.unload()
  }
  transitionCache.clear()

  // Clean up the music manager (unloads current music track)
  backgroundMusic.cleanup()
}

// =============================================================================
// SOUND PLAYBACK
// =============================================================================

/**
 * Plays a sound based on category and id. Provides options for looping and fade effects.
 *
 * - UI sounds are preloaded and play instantly
 * - Mascot and transition sounds are lazy-loaded with caching
 * - Music should be played via backgroundMusic.play() instead
 */
export function playSound(config: PlaySoundConfig): Howl | undefined {
  const { category, id } = config

  // Check if category exists
  if (!soundLibrary[category]) {
    console.warn(`Sound category "${category}" not found in sound library`)
    return undefined
  }

  // Check if sound ID exists in category
  if (!soundLibrary[category][id]) {
    console.warn(`Sound "${id}" not found in category "${category}"`)
    return undefined
  }

  let sound: Howl | undefined

  // Determine how to get the sound based on category
  if (category === "ratfunUI") {
    // UI sounds are preloaded
    sound = soundLibrary[category][id].sound
  } else if (category === "ratfunMascot") {
    // Mascot sounds are lazy-loaded with cache
    sound = getOrLoadSound(category, id, mascotCache, MASCOT_CACHE_SIZE)
  } else if (category === "ratfunTransitions") {
    // Transition sounds are lazy-loaded with cache
    sound = getOrLoadSound(category, id, transitionCache, TRANSITION_CACHE_SIZE)
  } else if (category === "ratfunMusic") {
    // Music should go through backgroundMusic.play() for proper management
    // But support direct playback for backwards compatibility
    sound = soundLibrary[category][id].sound
    if (!sound) {
      // Lazy load if not already loaded
      sound = new Howl({
        src: [soundLibrary[category][id].src],
        volume: soundLibrary[category][id].volume,
        preload: true,
        html5: false
      })
      soundLibrary[category][id].sound = sound
    }
  }

  if (!sound) {
    console.warn(`Sound "${id}" in category "${category}" could not be loaded.`)
    return undefined
  }

  // Don't play sounds that are still loading to avoid Howler.js recursion bugs
  if (sound.state() === "loading") {
    // Wait for load and then play
    sound.once("load", () => {
      playLoadedSound(sound!, config)
    })
    return sound
  }

  return playLoadedSound(sound, config)
}

/**
 * Plays a sound that is already loaded.
 */
function playLoadedSound(sound: Howl, config: PlaySoundConfig): Howl | undefined {
  const { category, id, loop = false, fadeIn = false, pitch = 1, volume } = config

  // Try to resume AudioContext if suspended (iOS requirement)
  tryResumeAudioContext()

  // Set volume
  if (volume !== undefined) {
    sound.volume(volume)
  }

  // Set loop state
  sound.loop(loop)

  // Play sound - wrapped in try-catch for iOS AudioContext errors
  let soundId: number | undefined
  try {
    soundId = sound.play() as number
  } catch {
    // Silently fail - audio will work after user interaction
    return undefined
  }

  // Set pitch AFTER play() to avoid Howler.js queue recursion bug
  // Pass sound ID to target specific instance
  if (soundId !== undefined && pitch !== 1) {
    sound.rate(pitch, soundId)
  }

  if (fadeIn && soundId !== undefined) {
    const FADE_TIME = 2000
    sound.fade(
      0,
      volume !== undefined ? volume : soundLibrary[category][id].volume,
      FADE_TIME,
      soundId
    )
  }

  return sound
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * @returns A random pitch between 0.8 and 2.0
 */
export function randomPitch(): number {
  const max = 2
  const min = 0.8
  return Math.random() * (max - min) + min
}

export const typeHit = () => {
  playSound({ category: "ratfunUI", id: "type" })
}

export function handleVisibilityChange() {
  if (document.hidden) {
    console.log("hidden")
    backgroundMusic.pause()
  } else {
    backgroundMusic.unpause()
  }
}
