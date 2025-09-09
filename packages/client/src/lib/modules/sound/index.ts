import * as Tone from "tone"
import { soundLibrary } from "./sound-library"
import type { TimingOptions } from "./types"

export async function initSound(): Promise<void> {
  try {
    await Tone.start()

    Tone.getTransport().loop = true
    Tone.getTransport().loopStart = 0
    Tone.getTransport().loopEnd = 42.456 // Length of the main sample
    Tone.getTransport().start()
    Tone.getTransport().on("loop", e => {
      console.log("just looped", e)
      // Tone.getTransport().bpm.rampTo(Tone.getTransport().bpm.value * 2, "4m")
    })

    // Load and play the main audio
    const mainPlayer = new Tone.Player({
      url: soundLibrary.ratfun.main.src,
      loop: true,
      onload: () => {
        mainPlayer.start(0) // start on beginning of transport loop
      }
    })
      .toDestination()
      .sync()

    const loopingUp = new Tone.Player({
      url: soundLibrary.ratfun.upwardspiral.src,
      loop: false,
      onload: () => {
        loopingUp.start("1m") // start after 4 measures
      }
    })
      .toDestination()
      .sync()

    console.log("Audio context started during init")
  } catch (error) {
    console.log("Audio context requires user gesture, will start later")
  }
}

/**
 * Plays a sound based on category and id. Provides options for looping and fade effects.
 *
 * @export
 * @param {string} category - The category of the sound.
 * @param {string} id - The id of the sound within the category.
 * @param {boolean} [loop=false] - Determines if the sound should loop.
 * @param {boolean} [fade=false] - Determines if the sound should have fade in/out effects.
 * @param {number} [pitch=1] - The pitch of the sound.
 * @param {boolean} [play=true] - useful to just fetch the sound
 * @param {TimingOptions} [timing] - Advanced timing options for precise scheduling
 * @returns {Promise<Tone.Player | undefined>} - The Tone.js Player object of the sound.
 */
export async function playSound(
  category: string,
  id: string,
  loop: boolean = false,
  fade: boolean = false,
  pitch: number = 1,
  play: boolean = true,
  timing?: TimingOptions
): Promise<Tone.Player | undefined> {
  const sound = new Tone.Player({
    url: soundLibrary[category][id].src,
    loop,
    autostart: true
  })

  if (!play) {
    return sound
  }

  // Calculate timing
  const when = timing?.when || "+0"
  const duration = timing?.duration

  if (fade) {
    const FADE_TIME = timing?.fadeTime || 2000
    const fadeTimeInSeconds = FADE_TIME / 1000

    // Set initial volume to 0
    sound.volume.setValueAtTime(0, when)
    // Fade in to target volume
    sound.volume.rampTo(soundLibrary[category][id].volume, fadeTimeInSeconds, when)

    if (duration) {
      // Fade out at the end if duration is specified
      const endTime =
        typeof when === "string"
          ? when
          : when + (typeof duration === "number" ? duration / 1000 : 0)
      sound.volume.rampTo(0, fadeTimeInSeconds, endTime)
    }
  }

  try {
    sound.start(when, 0, duration)
  } catch (error) {
    console.warn(`Failed to play sound: ${category}.${id}`, error)
  }

  return sound
}
/**
 * @returns {number} - A random pitch
 */
export function randomPitch(): number {
  const max = 2
  const min = 0.8
  return Math.random() * (max - min) + min
}

export const typeHit = async () => {
  // const sound = await playSound("ratfun", "type", false, false, randomPitch())
  // if (sound) {
  //   sound.start()
  // }
}
