<script lang="ts">
  import type { Outcome } from "@sanity-types"
  let { outcome }: { outcome: Outcome } = $props()
</script>

{outcome._id}
