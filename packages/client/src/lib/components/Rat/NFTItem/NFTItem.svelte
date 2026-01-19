<script lang="ts">
  import { playSound } from "$lib/modules/sound"
  import { CURRENCY_SYMBOL } from "$lib/modules/ui/constants"

  let {
    name,
    value,
    actionText,
    actionDisabled = false,
    onAction
  }: {
    name: string
    value: number
    actionText?: string
    actionDisabled?: boolean
    onAction?: () => void
  } = $props()

  const handleAction = (e: MouseEvent) => {
    e.stopPropagation()
    if (onAction && !actionDisabled) {
      playSound({ category: "ratfunUI", id: "click" })
      onAction()
    }
  }

  const onMouseEnter = () => {
    playSound({ category: "ratfunUI", id: "hover3" })
  }
</script>

<div class="nft-item" role="button" tabindex="0" onmouseenter={onMouseEnter}>
  <div class="content">
    <div class="name">{name}</div>
    <div class="value">{value} {CURRENCY_SYMBOL}</div>
  </div>
  {#if actionText && onAction}
    <button class="action-button" onclick={handleAction} disabled={actionDisabled}>
      {actionText}
    </button>
  {/if}
</div>

<style lang="scss">
  .nft-item {
    aspect-ratio: 1 / 1;
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--color-inventory-item-background);
    color: var(--background);
    padding: 5px;
    border: 8px ridge var(--background-semi-transparent);
    outline: none;
    box-shadow: 0 4px 8px var(--background-light-transparent);
    user-select: none;
  }

  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 8px;
  }

  .name {
    font-family: var(--special-font-stack);
    font-size: var(--font-size-large);
    color: var(--background);
  }

  .value {
    font-family: var(--special-font-stack);
    font-size: var(--font-size-medium);
    color: var(--background);
    opacity: 0.8;
  }

  .action-button {
    position: absolute;
    bottom: 5px;
    left: 10%;
    width: 80%;
    height: 40px;
    padding: 4px 8px;
    font-size: var(--font-size-small);
    font-family: var(--typewriter-font-stack);
    background: var(--color-grey-light);
    color: var(--background);
    border: none;
    border-style: outset;
    border-width: 4px;
    border-color: var(--background-light-transparent);
    cursor: pointer;
    transition: all 0.15s ease;

    &:hover:not(:disabled) {
      background: var(--color-grey-lighter);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
</style>
