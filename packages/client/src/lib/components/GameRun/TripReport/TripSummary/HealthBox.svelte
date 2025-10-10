<script lang="ts">
  import type { EnterTripReturnValue } from "@server/modules/types"
  import { gsap } from "gsap"

  let {
    result,
    initialBalance,
    onTimeline
  }: {
    result: EnterTripReturnValue
    initialBalance: number
    onTimeline?: (timeline: ReturnType<typeof gsap.timeline>, offset: number | string) => void
  } = $props()

  // Elements
  let healthElement = $state<HTMLDivElement | null>(null)
  let valueElement = $state<HTMLSpanElement | null>(null)
  let changeElement = $state<HTMLDivElement | null>(null)

  const calculateNewBalance = (initialBalance: number, result: EnterTripReturnValue) => {
    return (
      initialBalance +
      (result.balanceTransfers?.reduce((acc, balanceTransfer) => {
        return acc + balanceTransfer.amount
      }, 0) ?? 0)
    )
  }

  const getDisplayHealthChange = (initialBalance: number, newBalance: number) => {
    const healthChange = newBalance - initialBalance
    if (healthChange === 0) {
      return "0"
    } else if (healthChange > 0) {
      return "+" + healthChange
    } else {
      return healthChange.toString()
    }
  }

  const newBalance = calculateNewBalance(initialBalance, result)
  const displayHealthChange = getDisplayHealthChange(initialBalance, newBalance)

  // Create timeline
  const timeline = gsap.timeline()

  const prepare = () => {
    gsap.set(changeElement, { opacity: 0 })
  }

  const main = () => {
    // Animate the count up/down using GSAP's textContent
    timeline.to(valueElement, {
      textContent: newBalance,
      duration: 2,
      snap: { textContent: 1 }
    })

    // After count animation, quickly fade in the health change
    timeline.to(changeElement, {
      opacity: 1,
      duration: 0.2,
      ease: "power2.out"
    })
  }

  const done = () => {
    if (timeline && onTimeline) {
      onTimeline(timeline, 0.6)
    }
  }

  const run = () => {
    prepare()
    main()
    done()
  }

  $effect(() => {
    if (healthElement && valueElement && changeElement) {
      run()
    }
  })
</script>

<!-- HEALTH -->
<div class="health" bind:this={healthElement}>
  <div class="label">
    <span>HEALTH</span>
  </div>
  <div class="value">
    <span bind:this={valueElement}>{initialBalance}</span>
  </div>
  <div class="change" bind:this={changeElement}>
    <span>{displayHealthChange}</span>
  </div>
</div>

<style lang="scss">
  .health {
    border: 1px solid white;
    border-bottom: none;
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
