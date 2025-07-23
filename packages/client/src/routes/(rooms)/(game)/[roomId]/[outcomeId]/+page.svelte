<script lang="ts">
  // Outcome logs
  import { Outcome } from "$lib/components/Room"
  import { staticContent } from "$lib/modules/content"
  import { page } from "$app/state"

  let outcome = $derived($staticContent.outcomes.find(o => o._id === page.params.outcomeId))
</script>

{#if outcome}
  <Outcome {outcome} />
{/if}
