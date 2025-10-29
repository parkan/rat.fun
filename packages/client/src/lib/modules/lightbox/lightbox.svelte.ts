interface LightboxStateType {
  isOpen: boolean
  src: string
  alt: string
}

export class LightboxState {
  private state = $state<LightboxStateType>({
    isOpen: false,
    src: "",
    alt: ""
  })

  get isOpen() {
    return this.state.isOpen
  }

  get src() {
    return this.state.src
  }

  get alt() {
    return this.state.alt
  }

  open(src: string, alt: string = "") {
    this.state.src = src
    this.state.alt = alt
    this.state.isOpen = true
  }

  close() {
    this.state.isOpen = false
  }
}
