<script lang="ts">
  import type { Hex } from "viem"
  import { Trip } from "$lib/components/GameRun"

  let { data }: { data: { roomId: Hex } } = $props()
</script>

<Trip roomId={data.roomId} />
