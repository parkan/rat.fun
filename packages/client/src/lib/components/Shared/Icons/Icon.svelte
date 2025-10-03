<script lang="ts">
  import Asterisk from "./Asterisk.svelte"
  import Cross from "./Cross.svelte"
  import Paw from "./Paw.svelte"
  import Handshake from "./Handshake.svelte"

  let {
    name,
    width = 24,
    fill = "white"
  }: { name: "Asterisk" | "Cross" | "Paw" | "Handshake"; width?: number; fill?: string } = $props()

  let components = {
    Asterisk,
    Cross,
    Paw,
    Handshake
  }

  let Component = $derived(components[name])
</script>

<Component {width} {fill} />
