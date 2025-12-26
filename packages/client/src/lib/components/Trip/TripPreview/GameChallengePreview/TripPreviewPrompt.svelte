<script lang="ts">
  import { renderSafeString } from "@ratfun/shared-utils"
  import { ResizableText } from "$lib/components/Shared"

  const { trip }: { trip: Trip } = $props()
</script>

<div class="trip-preview-prompt">
  <ResizableText>
    {renderSafeString(trip.prompt)}
  </ResizableText>
</div>

<style lang="scss">
  .trip-preview-prompt {
    word-break: break-word;
    overflow-wrap: anywhere;
    width: 100%;
    font-family: var(--special-font-stack);
    height: 100%;
    padding: 10px 20px 60px;

    @media screen and (max-width: 800px) {
      padding: 10px 10px 20px;
    }
  }
</style>
