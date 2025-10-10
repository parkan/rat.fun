<script lang="ts">
  import type { EnterTripReturnValue } from "@server/modules/types"
  import { gsap } from "gsap"
  import { CURRENCY_SYMBOL } from "$lib/modules/ui/constants"

  let {
    result,
    initialTotalValue,
    onTimeline
  }: {
    result: EnterTripReturnValue
    initialTotalValue: number
    onTimeline?: (timeline: ReturnType<typeof gsap.timeline>, offset: number | string) => void
  } = $props()

  // Elements
  let totalValueElement = $state<HTMLDivElement | null>(null)
  let valueElement = $state<HTMLSpanElement | null>(null)
  let changeElement = $state<HTMLDivElement | null>(null)

  const calculateTotalRatValue = (
    initialTotalValue: number | undefined,
    result: EnterTripReturnValue
  ) => {
    if (!initialTotalValue || !result) {
      return 0
    }

    const itemChangesValue =
      result.itemChanges?.reduce((acc, item) => {
        if (item.type === "add") {
          return acc + item.value
        }
        return acc - item.value
      }, 0) ?? 0

    const balanceTransfersValue =
      result.balanceTransfers?.reduce((acc, balanceTransfer) => {
        return acc + balanceTransfer.amount
      }, 0) ?? 0

    return initialTotalValue + itemChangesValue + balanceTransfersValue
  }

  const getDisplayValueChange = (initialTotalValue: number, newTotalValue: number) => {
    const valueChange = newTotalValue - initialTotalValue
    if (valueChange === 0) {
      return CURRENCY_SYMBOL + "0"
    } else if (valueChange > 0) {
      return "+" + CURRENCY_SYMBOL + valueChange
    } else {
      return "-" + CURRENCY_SYMBOL + valueChange
    }
  }

  const newTotalValue = calculateTotalRatValue(initialTotalValue, result)

  const displayValueChange = getDisplayValueChange(initialTotalValue, newTotalValue)

  // Create timeline
  const timeline = gsap.timeline()

  const prepare = () => {
    gsap.set(changeElement, { opacity: 0 })
  }

  // No animation if the total value is the same
  const duration = newTotalValue === initialTotalValue ? 0 : 2

  const main = () => {
    // Animate the count up/down using GSAP's textContent
    timeline.to(valueElement, {
      textContent: newTotalValue,
      duration,
      snap: { textContent: 1 }
    })

    // After count animation, quickly fade in the value change
    timeline.to(changeElement, {
      opacity: 1,
      duration: 0.2,
      ease: "power2.out"
    })
  }

  const done = () => {
    if (timeline && onTimeline) {
      onTimeline(timeline, 0.8)
    }
  }

  const run = () => {
    prepare()
    main()
    done()
  }

  $effect(() => {
    if (totalValueElement && valueElement && changeElement) {
      run()
    }
  })
</script>

<!-- TOTAL VALUE -->
<div class="total-value" bind:this={totalValueElement}>
  <div class="label">
    <span>VALUE</span>
  </div>
  <div class="value">
    <span>{CURRENCY_SYMBOL}<span bind:this={valueElement}>{initialTotalValue}</span></span>
  </div>
  <div class="change" bind:this={changeElement}>
    <span>{displayValueChange}</span>
  </div>
</div>

<style lang="scss">
  .total-value {
    border: 1px solid white;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 80px;
    .label {
      border-right: 1px solid white;
      width: 30%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .value {
      width: 50%;
      border-right: 1px solid white;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .change {
      width: 20%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
