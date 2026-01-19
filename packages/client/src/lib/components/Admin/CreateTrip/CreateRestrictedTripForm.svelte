<script lang="ts">
  import { gameConfig } from "$lib/modules/state/stores"
  import { playerERC20Balance } from "$lib/modules/erc20Listener/stores"
  import { CharacterCounter, BigButton, BackButton } from "$lib/components/Shared"
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
    onBack,
    onClose,
    placeholder
  }: {
    tripDescription: string
    tripCreationCost: number
    textareaElement: HTMLTextAreaElement | null
    onSubmit: () => void
    onBack: () => void
    onClose: () => void
    placeholder: string
  } = $props()

  let sliderStep = $derived(Number($playerERC20Balance) > 10000 ? 500 : 100)
  let sliderMax = $derived(Math.floor($playerERC20Balance / sliderStep) * sliderStep)

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
  <!-- CLOSE BUTTON (phone only) -->
  <div class="close-button">
    <BackButton onclick={onClose} />
  </div>

  <!-- HEADER -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="form-header challenge" onclick={onBack}>
    <span class="header-title">TRAP?</span>
  </div>

  <!-- INFO: Active period -->
  <div class="challenge-info">
    A TRAP is active for 24 hours. After this period it is closed and can be cashed out. TRAPs are
    winner-take-all.
  </div>

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

  <!-- TRIP CREATION COST SLIDER -->
  <div class="slider-group">
    <div class="slider-header">
      <label for="trip-creation-cost-slider">
        <span class="highlight">Trip cost</span>
      </label>
      <input
        class="cost-display"
        onblur={e => {
          const value = Number((e.target as HTMLInputElement).value)
          if (value < CHALLENGE_MIN_CREATION_COST || value > $playerERC20Balance) {
            tripCreationCost = Math.min(
              $playerERC20Balance,
              Math.max(CHALLENGE_MIN_CREATION_COST, value)
            )
          }
        }}
        bind:value={tripCreationCost}
        type="number"
      />
    </div>
    <div class="slider-container">
      <div class="slider-label">
        <span class="slider-min">
          {Math.min($playerERC20Balance, CHALLENGE_MIN_CREATION_COST)}
          {CURRENCY_SYMBOL}
        </span>
      </div>
      <input
        type="range"
        id="trip-creation-cost-slider"
        class="cost-slider"
        step={sliderStep}
        min={Math.min($playerERC20Balance, CHALLENGE_MIN_CREATION_COST)}
        max={sliderMax}
        oninput={typeHit}
        bind:value={tripCreationCost}
      />
      <div class="slider-label">
        <span class="slider-max">{sliderMax} {CURRENCY_SYMBOL}</span>
      </div>
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

  .close-button {
    display: none;
    height: 50px;
    flex-shrink: 0;

    @media (max-width: 800px) {
      display: block;
    }
  }

  .form-header {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 12px;
    cursor: pointer;
    border-width: 4px;
    border-color: var(--background-light-transparent);
    border-style: outset;
    user-select: none;

    &:hover {
      opacity: 0.8;
    }

    &:active {
      transform: scale(0.98);
    }

    .header-title {
      position: relative;
      z-index: 1;
      font-family: var(--special-font-stack);
      font-size: var(--font-size-large);
    }

    &.challenge {
      background-color: var(--color-restricted-trip-folder);
      color: var(--background);

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image: url("/images/tot2.png");
        background-repeat: no-repeat;
        background-size: 100% 100%;
        opacity: 0.5;
        z-index: 0;
      }
    }
  }

  .challenge-info {
    font-family: var(--typewriter-font-stack);
    font-size: var(--font-size-normal);
    color: var(--color-grey-light);
    padding: 8px;
    background: var(--background);
    border: 1px solid var(--color-border);
    line-height: 1.4;
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
    flex: 1;
    min-height: 0;

    label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    textarea {
      width: 100%;
      height: 100%;
      flex: 1;
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

  .slider-group {
    display: flex;
    flex-flow: column nowrap;
    gap: 8px;
    width: 100%;

    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cost-display {
      background: var(--foreground);
      color: var(--background);
      font-family: var(--special-font-stack);
      font-size: var(--font-size-large);
      border: none;
      width: 100px;
      text-align: center;
      outline: none;
      &:focus {
        border: none;
        outline: none;
      }
    }
  }

  .slider-container {
    display: flex;
    gap: 8px;
    justify-content: space-between;
    align-items: center;
    padding: 20px 0;

    .cost-slider {
      width: 400px;
      height: 8px;
      background: var(--background);
      border: 1px solid var(--foreground);
      outline: none;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 50px;
        background: var(--color-grey-mid);
        border: 2px solid var(--background);
        cursor: pointer;
      }

      &::-moz-range-thumb {
        width: 20px;
        height: 50px;
        background: var(--foreground);
        border: 2px solid var(--background);
        cursor: pointer;
        border-radius: 0;
      }

      &::-webkit-slider-track {
        background: var(--background);
        height: 8px;
      }

      &::-moz-range-track {
        background: var(--background);
        height: 8px;
        border: none;
      }
    }

    .slider-label {
      display: flex;
      justify-content: space-between;
      font-family: var(--special-font-stack);
      font-size: var(--font-size-large);
      color: var(--foreground);
    }
  }

  .calculated-values {
    display: flex;
    gap: 0;
    border: 1px solid var(--color-border);

    .value-box {
      flex: 1;
      padding: 10px;
      background: var(--background);
      display: flex;
      flex-flow: column nowrap;
      justify-content: center;
      position: relative;

      &:first-child {
        border-right: 1px solid var(--color-border);
      }

      .value-label {
        font-family: var(--typewriter-font-stack);
        font-size: var(--font-size-small);
        color: var(--color-grey-light);
      }

      .value-amount {
        font-family: var(--special-font-stack);
        font-size: var(--font-size-large);
        color: var(--foreground);
        display: flex;
        align-items: center;
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
