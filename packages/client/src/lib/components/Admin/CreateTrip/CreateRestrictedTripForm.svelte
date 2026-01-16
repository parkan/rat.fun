<script lang="ts">
  import { gameConfig } from "$lib/modules/state/stores"
  import { playerERC20Balance } from "$lib/modules/erc20Listener/stores"
  import { CharacterCounter, BigButton } from "$lib/components/Shared"
  import { busy } from "$lib/modules/action-manager/index.svelte"
  import { typeHit } from "$lib/modules/sound"
  import { CURRENCY_SYMBOL } from "$lib/modules/ui/constants"
  import { isPhone } from "$lib/modules/ui/state.svelte"
  import { UI_STRINGS } from "$lib/modules/ui/ui-strings/index.svelte"

  // Challenge trip fixed parameters
  const CHALLENGE_MIN_CREATION_COST = 5000
  const CHALLENGE_FIXED_MIN_VALUE_TO_ENTER = 100
  const CHALLENGE_MAX_WIN_PERCENTAGE = 100

  let {
    tripDescription = $bindable(""),
    tripCreationCost = $bindable(CHALLENGE_MIN_CREATION_COST),
    textareaElement = $bindable<HTMLTextAreaElement | null>(null),
    onSubmit,
    placeholder
  }: {
    tripDescription: string
    tripCreationCost: number
    textareaElement: HTMLTextAreaElement | null
    onSubmit: () => void
    placeholder: string
  } = $props()

  // Floor values to ensure they're integers
  let flooredTripCreationCost = $derived(Math.floor(tripCreationCost))

  // Calculate max win amount based on fixed percentage and creation cost
  let maxWinAmount = $derived(
    Math.floor((flooredTripCreationCost * CHALLENGE_MAX_WIN_PERCENTAGE) / 100)
  )

  // Prompt has to be between 1 and MAX_TRIP_PROMPT_LENGTH characters
  let invalidTripDescriptionLength = $derived(
    tripDescription.length < 1 || tripDescription.length > $gameConfig.maxTripPromptLength
  )

  // Disabled if:
  // - Trip description is invalid
  // - Trip creation is busy
  // - Trip creation cost is less than minimum
  // - Player has insufficient balance
  const disabled = $derived(
    invalidTripDescriptionLength ||
      busy.CreateTrip.current !== 0 ||
      flooredTripCreationCost < CHALLENGE_MIN_CREATION_COST ||
      $playerERC20Balance < flooredTripCreationCost
  )
</script>

<div class="controls">
  <!-- TRIP DESCRIPTION -->
  <div class="form-group">
    <label for="trip-description">
      <span class="highlight">{UI_STRINGS.tripDescription}</span>
      <CharacterCounter
        currentLength={tripDescription.length}
        maxLength={$gameConfig.maxTripPromptLength}
      />
    </label>
    <textarea
      disabled={busy.CreateTrip.current !== 0}
      id="trip-description"
      rows={$isPhone ? 3 : 4}
      {placeholder}
      oninput={typeHit}
      bind:value={tripDescription}
      bind:this={textareaElement}
    ></textarea>
  </div>

  <!-- CHALLENGE TRIP PARAMETERS -->
  <div class="challenge-params">
    <div class="challenge-header">
      <span class="highlight">Challenge Trip Settings</span>
    </div>

    <div class="param-grid">
      <!-- TRIP CREATION COST (editable) -->
      <div class="param-group">
        <span class="param-label">Pool Size (min {CHALLENGE_MIN_CREATION_COST})</span>
        <!-- <label for="creation-cost">
        </label> -->
        <div class="param-input-wrapper">
          <input
            id="creation-cost"
            type="number"
            class="param-input"
            min={CHALLENGE_MIN_CREATION_COST}
            max={$playerERC20Balance}
            oninput={typeHit}
            onblur={e => {
              const value = Number((e.target as HTMLInputElement).value)
              if (value < CHALLENGE_MIN_CREATION_COST) {
                tripCreationCost = CHALLENGE_MIN_CREATION_COST
              } else if (value > $playerERC20Balance) {
                tripCreationCost = $playerERC20Balance
              }
            }}
            bind:value={tripCreationCost}
          />
          <span class="param-unit">{CURRENCY_SYMBOL}</span>
        </div>
      </div>

      <!-- MIN RAT VALUE TO ENTER (fixed) -->
      <div class="param-group">
        <span class="param-label">Min Rat Value</span>
        <div class="param-fixed-value">
          <span class="fixed-value">{CHALLENGE_FIXED_MIN_VALUE_TO_ENTER}</span>
          <span class="param-unit">{CURRENCY_SYMBOL}</span>
        </div>
      </div>

      <!-- MAX WIN PERCENTAGE (fixed) -->
      <div class="param-group">
        <span class="param-label">Max Win</span>
        <div class="param-fixed-value">
          <span class="fixed-value">{CHALLENGE_MAX_WIN_PERCENTAGE}</span>
          <span class="param-unit">%</span>
        </div>
      </div>
    </div>

    <!-- INFO: Active period -->
    <div class="challenge-info">
      Challenge trips are active for 24 hours. After this period, no new entries are allowed and the
      pool can be liquidated.
    </div>
  </div>

  <!-- CALCULATED/DISPLAY VALUES -->
  <div class="calculated-values">
    <div class="value-box">
      <div class="value-label">MIN RISK</div>
      <div class="value-amount">
        <span>{CHALLENGE_FIXED_MIN_VALUE_TO_ENTER} {CURRENCY_SYMBOL}</span>
      </div>
    </div>
    <div class="value-box">
      <div class="value-label">MAX WIN</div>
      <div class="value-amount">
        <span>{maxWinAmount} {CURRENCY_SYMBOL}</span>
      </div>
    </div>
  </div>
</div>

<!-- ACTIONS -->
<div class="actions">
  <BigButton
    text="Create Challenge Trip"
    type="create_trip"
    cost={flooredTripCreationCost}
    {disabled}
    onclick={onSubmit}
  />
</div>

<style lang="scss">
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  input[type="number"] {
    appearance: textfield;
    -moz-appearance: textfield;
  }

  .controls {
    display: flex;
    justify-self: start;
    gap: 12px;
    flex-flow: column nowrap;
    flex: 1;
  }

  .highlight {
    background: var(--color-grey-mid);
    padding: 5px;
    color: var(--background);
  }

  .form-group {
    display: flex;
    flex-flow: column nowrap;
    gap: 8px;

    label {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    textarea {
      width: 100%;
      padding: 5px;
      border: none;
      background: var(--foreground);
      font-family: var(--special-font-stack);
      font-size: var(--font-size-medium);
      border-radius: 0;
      resize: none;
      outline-color: var(--color-grey-light);
      outline-width: 1px;
    }
  }

  .challenge-params {
    display: flex;
    flex-flow: column nowrap;
    gap: 12px;

    .challenge-header {
      display: flex;
      align-items: center;
    }

    .param-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;

      @media (max-width: 800px) {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }

    .param-group {
      display: flex;
      flex-flow: column nowrap;
      gap: 4px;

      .param-label {
        font-family: var(--typewriter-font-stack);
        font-size: var(--font-size-small);
        color: var(--color-grey-light);
        margin-bottom: 4px;
      }

      .param-input-wrapper {
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--foreground);
        padding: 8px 12px;
        height: 48px;

        .param-input {
          flex: 1;
          background: transparent;
          color: var(--background);
          font-family: var(--special-font-stack);
          font-size: var(--font-size-large);
          border: none;
          width: 100%;
          text-align: left;
          outline: none;

          &:focus {
            border: none;
            outline: none;
          }
        }

        .param-unit {
          font-family: var(--special-font-stack);
          font-size: var(--font-size-normal);
          color: var(--background);
          opacity: 0.7;
        }
      }

      .param-fixed-value {
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--color-grey-mid);
        padding: 8px 12px;
        height: 48px;

        .fixed-value {
          font-family: var(--special-font-stack);
          font-size: var(--font-size-large);
          color: var(--background);
        }

        .param-unit {
          font-family: var(--special-font-stack);
          font-size: var(--font-size-normal);
          color: var(--background);
          opacity: 0.7;
        }
      }
    }

    .challenge-info {
      font-family: var(--typewriter-font-stack);
      font-size: var(--font-size-small);
      color: var(--color-grey-light);
      padding: 8px;
      background: var(--background);
      border: 1px solid var(--color-border);
      line-height: 1.4;
    }
  }

  .calculated-values {
    display: flex;
    gap: 0;
    flex: 1;

    .value-box {
      flex: 1;
      padding: 10px;
      border: 1px solid var(--color-border);
      background: var(--background);
      display: flex;
      flex-flow: column nowrap;
      justify-content: stretch;
      position: relative;

      .value-label {
        font-family: var(--typewriter-font-stack);
        font-size: var(--font-size-small);
        color: var(--color-grey-light);
        position: absolute;
        top: 8px;
        left: 8px;
      }

      .value-amount {
        font-family: var(--special-font-stack);
        font-size: var(--font-size-large);
        color: var(--foreground);
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        @media screen and (min-width: 800px) {
          font-size: 42px;
        }
      }
    }
  }

  .actions {
    display: flex;
    flex-flow: column nowrap;
    gap: 12px;
    overflow: hidden;
    height: 160px;
  }
</style>
