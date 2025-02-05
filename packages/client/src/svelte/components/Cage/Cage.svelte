<script lang="ts">
  import { T } from "@threlte/core"
  import { OrbitControls } from "@threlte/extras"
  import Rat from "../World/Models/Rat.svelte"
  import Lighting from "@components/World/Lighting/Lighting.svelte"
</script>

<T.PerspectiveCamera
  on:create={({ ref }) => {
    ref.lookAt(0, 0, 0)
  }}
  fov={45}
  makeDefault
  position={[-2, 4, 6]}
>
  <OrbitControls />
</T.PerspectiveCamera>

<Rat />
