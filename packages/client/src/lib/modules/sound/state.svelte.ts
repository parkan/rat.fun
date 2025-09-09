import { writable } from "svelte/store"
import * as Tone from "tone"
import { soundLibrary } from "$lib/modules/sound/sound-library"

let channelVolume = $state({
  main: -50
})

export const getVolumeState = () => {
  const setChannelVolume = (channel: string, target: number) => {
    console.log("set channel volume called")
    channelVolume[channel] = target
  }

  return {
    set: setChannelVolume,
    get current() {
      return channelVolume
    }
  }
}

// Initialise the sound
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

    let mainChannel = new Tone.Channel()

    // Load and play the main audio
    const mainPlayer = new Tone.Player({
      url: soundLibrary.ratfun.main.src,
      loop: true,
      volume: channelVolume.main,
      onload: () => {
        mainPlayer.start(0) // start on beginning of transport loop
        mainPlayer.volume.rampTo(0, "1m")
      }
    })
      .connect(mainChannel)
      .sync()

    const loopingUp = new Tone.Player({
      url: soundLibrary.ratfun.upwardspiral.src,
      loop: false,
      onend: () => {
        console.log("we ended")
      },
      onload: () => {
        loopingUp.start("2m") // start after 4 measures
      }
    })
      .connect(mainChannel)
      .sync()

    // This line pipes everything to volume
    mainChannel.toDestination()

    console.log("Audio context started during init")
  } catch (error) {
    console.log("Audio context requires user gesture, will start later")
  }
}
