<script lang="ts">
  import { playSound } from "$lib/modules/sound"
  import { Tooltip } from "$lib/components/Shared"
  import { CURRENCY_SYMBOL } from "$lib/modules/ui/constants"
  import { ShaderLocal } from "$lib/components/Shared"

  let {
    text,
    cost,
    tippyText,
    disabled = false,
    onclick
  }: {
    text: string
    cost?: number
    tippyText?: string
    disabled?: boolean
    id?: string
    onclick: () => void
  } = $props()

  const onmousedown = () => {
    playSound("ratfunUI", "bigButtonDown")
  }

  const onmouseup = () => {
    playSound("ratfunUI", "bigButtonUp")
    onclick()
  }
</script>

<Tooltip content={tippyText}>
  <button class:disabled {onmouseup} {onmousedown}>
    <div class="button-content">
      <span class="button-text">{text}</span>
      {#if cost}
        <span class="button-cost">({CURRENCY_SYMBOL}{cost})</span>
      {/if}
    </div>
    <div class="canvas-container">
      <ShaderLocal shaderKey="plasma" />
    </div>
  </button>
</Tooltip>

<style lang="scss">
  button {
    width: 100%;
    height: 100%;
    background: var(--color-alert-priority);
    border: none;
    border-style: outset;
    border-width: 10px;
    border-color: rgba(0, 0, 0, 0.3);
    position: relative;
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    justify-content: center;
    border-radius: 40px;

    .button-content {
      z-index: 2;
      position: relative;
      // color: black;
      color: white;

      .button-text {
        font-size: var(--font-size-extra-large);
        font-family: var(--special-font-stack);
        line-height: 1em;
        // background: rgba(0, 0, 0, 0.4);
        // padding-inline: 20px;
        // border-radius: 5px;
        // text-stroke: 2px black;
        // -webkit-text-stroke: 2px black;
        // -moz-text-stroke: 2px black;
        // -ms-text-stroke: 2px black;
        // -o-text-stroke: 2px black;

        // font-weight: 900;
        // mix-blend-mode: difference;
      }

      .button-cost {
        font-size: var(--font-size-normal);
      }
    }

    .canvas-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      border-radius: 40px;
      overflow: hidden;

      // opacity: 0.5;
    }

    &:hover {
      background: var(--color-alert-priority-light);
    }

    &:active {
      border-style: inset;
      background: var(--color-alert-priority-muted);
      transform: translateY(2px);
      position: relative;
      color: white;
    }

    &.disabled {
      pointer-events: none;
      opacity: 0.5;
      cursor: default;
    }
  }
</style>
