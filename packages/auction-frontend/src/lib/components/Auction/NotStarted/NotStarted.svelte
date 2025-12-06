<script lang="ts">
  import { BigButton } from "$lib/components/Shared"

  function goToTelegram() {
    window.location.href = "https://t.me/ratfun"
  }
</script>

<div class="not-started">
  <div class="content">
    <h2>AUCTION NOT STARTED</h2>
    <p>Starts 9th of December at 16:00 CET</p>
    <div class="button-container">
      <BigButton text="Go to telegram" onclick={goToTelegram} />
    </div>
  </div>
</div>

<style lang="scss">
  .not-started {
    text-align: center;

    .button-container {
      width: 100%;
      height: 160px;
    }
  }
</style>
