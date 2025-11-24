<script lang="ts">
  import { playerAddress, player } from "$lib/modules/state/stores"
  import { playerERC20Balance } from "$lib/modules/erc20Listener/stores"
  import { CURRENCY_SYMBOL } from "$lib/modules/ui/constants"
  import { shortenAddress } from "$lib/modules/utils"
  import { disconnectWallet } from "$lib/modules/drawbridge/connector"
  import { UIState } from "$lib/modules/ui/state.svelte"
  import { UI } from "$lib/modules/ui/enums"
  import { UI_STRINGS } from "$lib/modules/ui/ui-strings"
  import { walletType } from "$lib/modules/network"
  import { WALLET_TYPE } from "$lib/mud/enums"
  import { SmallButton } from "$lib/components/Shared"
  import { musicEnabled, backgroundMusic } from "$lib/modules/sound/stores"

  const toggleMusic = () => {
    musicEnabled.current = !musicEnabled.current
    // Stop any currently playing music when disabled, resume when enabled
    if (!musicEnabled.current) {
      backgroundMusic.stop()
    } else {
      backgroundMusic.resume()
    }
  }
</script>

<div class="main-dropdown-content">
  <!-- Name -->
  <div class="tab">
    <p class="key">{UI_STRINGS.name}:</p>
    <p class="value">
      {$player?.name ?? ""}
    </p>
  </div>
  <!-- Wallet -->
  <div class="tab">
    <p class="key">{UI_STRINGS.connectedWallet}:</p>
    <p class="value">
      {shortenAddress($playerAddress)}
    </p>
  </div>
  <!-- Balance -->
  <div class="tab">
    <p class="key">{UI_STRINGS.balance}:</p>
    <p class="value">
      {$playerERC20Balance}
      {CURRENCY_SYMBOL}
    </p>
  </div>

  <!-- Rats killed -->
  {#if ($player?.pastRats ?? []).length > 0}
    <div class="tab">
      <p class="key">{UI_STRINGS.ratAmountKilled}:</p>
      <p class="value">
        {$player?.pastRats.length}
      </p>
    </div>
  {/if}
  {#if $walletType !== WALLET_TYPE.BURNER}
    <div class="tab">
      <SmallButton
        tippyText={UI_STRINGS.disconnectWallet}
        onclick={async () => {
          await disconnectWallet()
          UIState.set(UI.SPAWNING)
        }}
        text={UI_STRINGS.disconnectWallet}
      ></SmallButton>
    </div>
  {/if}
  <!-- Music toggle -->
  <div class="tab">
    <SmallButton
      tippyText={musicEnabled.current ? UI_STRINGS.musicOn : UI_STRINGS.musicOff}
      onclick={toggleMusic}
      text={musicEnabled.current ? UI_STRINGS.musicOn : UI_STRINGS.musicOff}
    ></SmallButton>
  </div>
</div>

<style lang="scss">
  .main-dropdown-content {
    p {
      margin: 0;
    }

    .tab {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-bottom: 8px;

      .key {
        width: 240px;
      }
    }
  }
</style>
