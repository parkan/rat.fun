<script lang="ts">
  import { fade } from "svelte/transition"
  import { goto } from "$app/navigation"
  import type { TripFolder } from "@sanity-types"
  import { playSound } from "$lib/modules/sound"

  let {
    listingIndex,
    folder,
    challengeTripId,
    attemptCount,
    dailyChallengeTime,
    challengeTitle
  }: {
    listingIndex: number
    folder: TripFolder
    challengeTripId?: string
    attemptCount?: number
    dailyChallengeTime?: string | null
    challengeTitle?: string | null
  } = $props()

  // Show countdown when no active challenge trip but has dailyChallengeTime set
  let showCountdown = $derived(!challengeTripId && !!dailyChallengeTime)
  let hasActiveChallenge = $derived(!!challengeTripId)

  // Countdown state
  let countdownText = $state("")
  let countdownInterval: ReturnType<typeof setInterval> | null = null

  /**
   * Calculate the next occurrence of a CET time.
   * If that time has already passed today, returns tomorrow's occurrence.
   * @param timeStr - Time in "HH:MM" format (CET)
   * @returns Date object representing the next occurrence in user's local timezone
   */
  function getNextCETTime(timeStr: string): Date {
    // Create a date in CET timezone for today
    // CET is UTC+1, CEST (summer) is UTC+2
    const now = new Date()

    // Format current date as YYYY-MM-DD in CET
    const cetFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    })
    const cetDateStr = cetFormatter.format(now)

    // Create the target time in CET
    // We construct an ISO string and use the Europe/Berlin timezone offset
    const targetDateStr = `${cetDateStr}T${timeStr.padStart(5, "0")}:00`

    // Parse this as a CET time by creating a formatter that can tell us the offset
    const cetDate = new Date(targetDateStr)

    // Get the CET offset for the target date
    const cetOffset = getCETOffset(cetDate)

    // Create UTC time from CET time
    const utcMs = cetDate.getTime() - cetOffset * 60 * 1000

    // If this time has already passed, add 24 hours
    if (utcMs <= now.getTime()) {
      return new Date(utcMs + 24 * 60 * 60 * 1000)
    }

    return new Date(utcMs)
  }

  /**
   * Get the CET/CEST offset in minutes for a given date
   * CET = UTC+1 (60 minutes), CEST = UTC+2 (120 minutes)
   */
  function getCETOffset(date: Date): number {
    // Create a date string in CET and parse the offset
    const cetStr = date.toLocaleString("en-US", {
      timeZone: "Europe/Berlin",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    })
    const utcStr = date.toLocaleString("en-US", {
      timeZone: "UTC",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit"
    })

    const [cetHour, cetMin] = cetStr.split(":").map(Number)
    const [utcHour, utcMin] = utcStr.split(":").map(Number)

    let diffMinutes = (cetHour - utcHour) * 60 + (cetMin - utcMin)

    // Handle day boundary crossing
    if (diffMinutes < -12 * 60) diffMinutes += 24 * 60
    if (diffMinutes > 12 * 60) diffMinutes -= 24 * 60

    return diffMinutes
  }

  function updateCountdown() {
    if (!dailyChallengeTime) {
      countdownText = ""
      return
    }

    const now = new Date().getTime()
    const target = getNextCETTime(dailyChallengeTime).getTime()
    const diff = target - now

    if (diff <= 0) {
      countdownText = "Starting soon..."
      return
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) {
      countdownText = `${days}d ${hours}h ${minutes}m`
    } else if (hours > 0) {
      countdownText = `${hours}h ${minutes}m ${seconds}s`
    } else if (minutes > 0) {
      countdownText = `${minutes}m ${seconds}s`
    } else {
      countdownText = `${seconds}s`
    }
  }

  $effect(() => {
    if (showCountdown) {
      updateCountdown()
      countdownInterval = setInterval(updateCountdown, 1000)
    } else if (countdownInterval) {
      clearInterval(countdownInterval)
      countdownInterval = null
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  })

  // Disabled when showing countdown (no challenge to navigate to)
  let disabled = $derived(showCountdown)

  // Use challengeTitle if set, otherwise default
  let superTitle = "TRIP OR TRAP?"

  const handleClick = () => {
    if (challengeTripId) {
      goto(`/${challengeTripId}`)
    }
  }

  const onmousedown = () => {
    playSound({ category: "ratfunUI", id: "smallButtonDown" })
  }

  const onmouseup = () => {
    playSound({ category: "ratfunUI", id: "smallButtonUp" })
  }
</script>

<div class="tile wide" in:fade|global={{ duration: 100, delay: listingIndex * 30 }}>
  <button
    class:disabled
    class:countdown={showCountdown}
    onclick={handleClick}
    {onmouseup}
    {onmousedown}
  >
    <div class="title">
      <div class="super-title">{superTitle}</div>
      {#if challengeTitle}
        <div class="challenge-title">{challengeTitle}</div>
      {/if}
      <div class="count">
        {#if showCountdown}
          <span class="countdown-time">{countdownText}</span>
        {:else if hasActiveChallenge}
          {attemptCount ?? 0} attempt{attemptCount === 1 ? "" : "s"}
        {/if}
      </div>
    </div>
  </button>
</div>

<style lang="scss">
  .tile {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;

    &.wide {
      grid-column: span 2;
    }

    button {
      width: 100%;
      height: 100%;
      font-family: var(--special-font-stack);
      font-size: var(--font-size-large);

      border-style: outset;
      border-width: 10px;
      border-color: var(--background-light-transparent);
      color: var(--background);

      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      @media (max-width: 768px) {
        font-size: var(--font-size-normal);
      }

      .title {
        position: relative;

        .super-title {
          font-size: var(--font-size-normal);
        }

        .challenge-title {
          font-size: var(--font-size-large);
        }

        .count {
          font-size: var(--font-size-normal);

          .countdown-time {
            font-size: var(--font-size-extra-large);
          }
        }
      }
      transition: transform 0.1s ease-in-out;

      @media (min-width: 800px) {
        &:hover {
          border-color: var(--background-light-transparent);
          transform: scale(0.97);
        }
      }

      &:active {
        filter: invert(1);
        transform: scale(0.95);
      }

      background: var(--color-restricted-trip-folder);

      &.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
    }
  }
</style>
