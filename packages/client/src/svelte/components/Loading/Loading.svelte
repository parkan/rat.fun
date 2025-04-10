<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte"
  import { ready, loadingMessage } from "@modules/network"
  import { initNetwork } from "@svelte/initNetwork"
  import { initEntities } from "@modules/systems/initEntities"
  import { ENVIRONMENT } from "@mud/enums"

  export let environment: ENVIRONMENT

  const dispatch = createEventDispatcher()

  const done = () => dispatch("done")

  // Finished when chain is ready
  $: if ($ready) {
    initSequence()
  }

  const initSequence = async () => {
    initEntities()
    await new Promise(resolve => setTimeout(resolve, 3000))
    done()
  }

  onMount(async () => {
    await initNetwork(environment)
  })
</script>

<div class="loading" class:done={Number($loadingMessage) === 100}>
  <div class="inner">
    <img src="/images/logo.png" alt="logo" />
    <div class="message">
      <span class="highlight">{$loadingMessage}</span>
    </div>
  </div>
</div>

<style lang="scss">
  .loading {
    text-align: center;

    .inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      img {
        width: 200px;
      }

      .message {
        margin-top: 10px;

        .highlight {
          background: var(--color-value);
          color: black;
          padding: 5px;
        }
      }
    }
  }
</style>
