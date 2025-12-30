import { Howl, Howler } from "howler"
import type { PlaySoundConfig } from "./types"
import { soundLibrary } from "./sound-library"
import { LocalStorage } from "$lib/modules/state/local.svelte"
import { createLogger } from "$lib/modules/logger"

const logger = createLogger("sound")

// Store for tracking if music is enabled (persisted to localStorage)
export const musicEnabled = new LocalStorage<boolean>("musicEnabled", true)

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

class BackgroundMusicManager {
  private currentHowl: Howl | undefined
  private currentSoundId: number | undefined
  private intendedConfig: PlaySoundConfig | undefined
  private currentTrackKey: string | undefined

  /**
   * Gets or loads a music track. Unloads any previously loaded track to save memory.
   * Only one music track should be in memory at a time.
   */
  private getOrLoadTrack(category: string, id: string): Howl | undefined {
    const trackKey = `${category}.${id}`
    const libraryItem = soundLibrary[category]?.[id]

    if (!libraryItem) {
      logger.warn(`Music "${id}" not found in category "${category}"`)
      return undefined
    }

    // If we already have this track loaded, return it
    if (this.currentTrackKey === trackKey && this.currentHowl) {
      return this.currentHowl
    }

    // Unload previous track to free memory (only one music track in memory at a time)
    if (this.currentHowl) {
      this.currentHowl.unload()
      this.currentHowl = undefined
      this.currentSoundId = undefined
      this.currentTrackKey = undefined
    }

    // Load new track
    const sound = new Howl({
      src: [libraryItem.src],
      volume: libraryItem.volume,
      preload: true,
      html5: false // Force Web Audio API to avoid iOS HTML5 Audio pool exhaustion
    })

    this.currentHowl = sound
    this.currentTrackKey = trackKey

    return sound
  }

  /**
   * Plays a background music track. Automatically stops any currently playing track.
   * Music is loaded on demand and the previous track is unloaded to save memory.
   */
  play(config: PlaySoundConfig): void {
    // Store the intended config so we can resume if music is re-enabled
    this.intendedConfig = config

    // Check if music is enabled before playing
    // EXCEPTION for trip processing "music"
    if (!musicEnabled.current && !config.id.toLowerCase().includes("processing")) {
      return
    }

    // Stop any currently playing track first (but don't unload - getOrLoadTrack handles that)
    if (this.currentHowl && this.currentSoundId !== undefined) {
      this.currentHowl.stop(this.currentSoundId)
      this.currentSoundId = undefined
    }

    const { category, id } = config

    // Check if category exists
    if (!soundLibrary[category]) {
      logger.warn(`Sound category "${category}" not found in sound library`)
      return
    }

    // Check if sound ID exists in category
    if (!soundLibrary[category][id]) {
      logger.warn(`Sound "${id}" not found in category "${category}"`)
      return
    }

    // Get or load the track (lazy loading with automatic unload of previous)
    const sound = this.getOrLoadTrack(category, id)

    if (!sound) {
      return
    }

    // Handle loading state - wait for load then play
    if (sound.state() === "loading") {
      sound.once("load", () => {
        this.playLoadedSound(sound, config)
      })
      return
    }

    this.playLoadedSound(sound, config)
  }

  /**
   * Internal method to play a sound that is already loaded.
   */
  private playLoadedSound(sound: Howl, config: PlaySoundConfig): void {
    const { category, id, loop = false, fadeIn = false, pitch = 1, volume } = config

    // Try to resume AudioContext if suspended (iOS requirement)
    tryResumeAudioContext()

    // Set volume
    if (volume !== undefined) {
      sound.volume(volume)
    }

    // Set loop state
    sound.loop(loop)

    // Play sound and track the sound ID - wrapped in try-catch for iOS AudioContext errors
    let soundId: number | undefined
    try {
      soundId = sound.play() as number
    } catch {
      // Silently fail - audio will work after user interaction
      return
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

    // Store current playing sound ID
    this.currentSoundId = soundId
  }

  /**
   * Stops the currently playing background music track.
   * Does NOT unload - use cleanup() to fully release memory.
   */
  stop(): void {
    if (this.currentHowl && this.currentSoundId !== undefined) {
      this.currentHowl.stop(this.currentSoundId)
      this.currentSoundId = undefined
    }
  }

  /**
   * Pauses the currently playing background music track.
   */
  pause(): void {
    if (this.currentHowl && this.currentSoundId !== undefined) {
      this.currentHowl.pause(this.currentSoundId)
    }
  }

  /**
   * Unpauses the currently paused background music track.
   */
  unpause(): void {
    if (this.currentHowl && this.currentSoundId !== undefined) {
      // Try to resume AudioContext if suspended (iOS requirement)
      tryResumeAudioContext()

      try {
        this.currentHowl.play(this.currentSoundId)
      } catch {
        // Silently fail - audio will work after user interaction
      }
    }
  }

  /**
   * Resumes the intended music track if music is enabled and a track was previously set.
   * Uses lazy loading - the track is loaded on demand.
   */
  resume(): void {
    if (musicEnabled.current && this.intendedConfig) {
      // Re-play the intended config without storing it again (avoid recursion)
      const config = this.intendedConfig

      // Stop any currently playing track first (but don't unload - getOrLoadTrack handles that)
      if (this.currentHowl && this.currentSoundId !== undefined) {
        this.currentHowl.stop(this.currentSoundId)
        this.currentSoundId = undefined
      }

      const { category, id } = config

      // Check if category exists
      if (!soundLibrary[category]) {
        logger.warn(`Sound category "${category}" not found in sound library`)
        return
      }

      // Check if sound ID exists in category
      if (!soundLibrary[category][id]) {
        logger.warn(`Sound "${id}" not found in category "${category}"`)
        return
      }

      // Get or load the track (lazy loading with automatic unload of previous)
      const sound = this.getOrLoadTrack(category, id)

      if (!sound) {
        return
      }

      // Handle loading state - wait for load then play
      if (sound.state() === "loading") {
        sound.once("load", () => {
          this.playLoadedSound(sound, config)
        })
        return
      }

      this.playLoadedSound(sound, config)
    }
  }

  /**
   * Cleans up all resources. Unloads the current music track to free memory.
   * Should be called when the sound system is being torn down.
   */
  cleanup(): void {
    if (this.currentHowl) {
      this.currentHowl.unload()
      this.currentHowl = undefined
      this.currentSoundId = undefined
      this.currentTrackKey = undefined
    }
    this.intendedConfig = undefined
  }
}

export const backgroundMusic = new BackgroundMusicManager()
