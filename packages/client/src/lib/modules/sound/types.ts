import type { Howl } from "howler"

export type Sound = {
  src: string
  volume: number
  sound?: Howl
  author?: string
}

export type SoundAssets = {
  [index: string]: Sound
}

export type SoundLibrary = {
  [index: string]: SoundAssets
}

export type PlaySoundConfig = {
  category: string
  id: string
  loop?: boolean
  fadeIn?: boolean
  pitch?: number
  volume?: number
}
