<script lang="ts">
  import { RoomListing } from "$lib/components/Room"
  import { SEO } from "$lib/components/Shared"

  console.log("### routes/(main)/(game)/+page.svelte ###")
</script>

<SEO prependTitle="" />

<!-- Will be rendered in the right column -->
<RoomListing />
