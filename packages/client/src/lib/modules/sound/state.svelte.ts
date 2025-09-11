import type { Snapshot } from "./$types"
import * as Tone from "tone"
import { soundLibrary } from "$lib/modules/sound/sound-library"

export type ChannelConfig = {
  volume: number
  muted: boolean
  solo: boolean
  pan: number
}

let channelStates = $state<Record<string, ChannelConfig>>({
  ui: { volume: 0, muted: false, solo: false, pan: 0 },
  music: { volume: 0, muted: false, solo: false, pan: 0 }
})
let uiChannel = $state<Tone.InputNode>()
let musicChannel = $state<Tone.InputNode>()
let channels = $state<Record<string, Tone.Channel>>({})
let players = $state<Record<string, Tone.InputNode>>()

let masterVolume = $state(-10)

export const getMixerState = () => {
  const setPlayers = (newPlayersState: Record<string, Tone.Player>) => {
    players = newPlayersState
  }

  const setChannelStates = states => {
    channelStates = states
  }

  const setChannelVolume = (channel: string, volume: number) => {
    if (channelStates[channel]) {
      channelStates[channel].volume = volume
      updateChannelVolume(channel)
    }
  }

  const setChannelMute = (channel: string, muted: boolean) => {
    if (channelStates[channel]) {
      channelStates[channel].muted = muted
      updateChannelVolume(channel)
    }
  }

  const setChannelSolo = (channel: string, solo: boolean) => {
    if (channelStates[channel]) {
      channelStates[channel].solo = solo
      updateAllChannelVolumes()
    }
  }

  const setMasterVolume = (volume: number) => {
    masterVolume = volume
    if (Tone.getDestination()) {
      Tone.getDestination().volume.value = volume
    }
  }

  /**
   *
   * @param channel
   * @returns
   */
  const updateChannelVolume = (channel: string) => {
    const state = channelStates[channel]
    const toneChannel = channels[channel]

    if (!toneChannel) return

    const anySolo = Object.values(channelStates).some(s => s.solo)

    const isAudible = !anySolo || state.solo
    const isMuted = state.muted

    if (isMuted || !isAudible) {
      toneChannel.mute = true
    } else {
      toneChannel.mute = false
      toneChannel.volume.value = state.volume
    }
  }

  const registerChannel = (name: string, channel: Tone.ToneAudioNode) => {
    channels[name] = channel
    if (!channelStates[name]) {
      channelStates[name] = { volume: 0, muted: false, solo: false, pan: 0 }
    }
    updateChannelVolume(name)
  }

  const updateAllChannelVolumes = () => {
    Object.keys(channelStates).forEach(updateChannelVolume)
  }

  return {
    // Channel controls
    registerChannel,
    setChannelStates,
    setPlayers,
    setChannelVolume,
    setChannelMute,
    setChannelSolo,
    // Master control
    setMasterVolume,
    get channels() {
      return channels
    },
    get players() {
      return players
    },
    get channelStates() {
      return channelStates
    },
    get masterVolume() {
      return masterVolume
    }
  }
}

const registerMusic = (channel: Tone.ToneAudioNode): Record<string, Tone.Player> => {
  // Looping music ONLY
  // Main
  const mainSound = new Tone.Player({
    url: soundLibrary.tcm.main.src,
    loop: true,
    volume: 0,
    autostart: true
  })
    .connect(channel)
    .sync()

  // Admin
  const adminSound = new Tone.Player({
    url: soundLibrary.ratfun.admin.src,
    loop: true,
    autostart: true
  })
    .connect(channel)
    .sync()

  // Spawn
  const spawnSound = new Tone.Player({
    url: soundLibrary.tcm.podBg.src,
    loop: true,
    autostart: true
  })
    .connect(channel)
    .sync()

  // Non-looping music

  // Trip setup
  const tripSetup = new Tone.Player({
    url: soundLibrary.ratfun.tripSetup.src,
    volume: -Infinity,
    loop: false,
    autostart: false
  })
    .connect(channel)
    .sync()

  const tripProcessing = new Tone.Player({
    url: soundLibrary.ratfun.tripProcessing.src,
    volume: -Infinity,
    loop: false,
    autostart: false
  })
    .connect(channel)
    .sync()

  const tripResultGood = new Tone.Player({
    url: soundLibrary.ratfun.tripResultGood.src,
    volume: -Infinity,
    loop: false,
    autostart: false
  })
    .connect(channel)
    .sync()

  const result = {
    mainSound,
    adminSound,
    spawnSound,
    tripSetup,
    tripProcessing,
    tripResultGood
  }

  return result
}

// Initialise the sound
export async function initSound(): Promise<void> {
  try {
    await Tone.start()
    const mixer = getMixerState()

    // Set up master volume
    Tone.getDestination().volume.value = mixer.masterVolume

    Tone.getTransport().loop = true
    Tone.getTransport().loopStart = 0
    Tone.getTransport().loopEnd = 42.456 // Length of the main sample
    Tone.getTransport().start()
    Tone.getTransport().on("loop", e => {
      console.log("loop")
    })

    // Create and register Music channel
    musicChannel = new Tone.Channel().toDestination()
    mixer.registerChannel("music", musicChannel)

    // Create and register UI channel
    uiChannel = new Tone.Channel().toDestination()
    mixer.registerChannel("ui", uiChannel)

    // Register the music players and apply them to the music channel
    const musicPlayers = registerMusic(musicChannel)
    mixer.setPlayers(musicPlayers)

    // @todo: Try to play the correct music based on the current page
    if (mixer.players) {
      mixer.players?.mainSound?.volume?.rampTo(0, "1m")
    }

    // We will use the individual players to change play state
  } catch (error) {}
}

export const snapshotFactory = (): Snapshot => {
  const mixer = getMixerState()
  return {
    capture: () => {
      return {
        channelStates: mixer.channelStates
      }
    },
    restore: value => {
      mixer.setChannelStates(value.channelStates)
    }
  }
}
