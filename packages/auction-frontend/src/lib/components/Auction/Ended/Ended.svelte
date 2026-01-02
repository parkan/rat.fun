<script lang="ts">
  import { BigButton } from "$lib/components/Shared"

  function goToRatFun() {
    window.location.href = "https://rat.fun"
  }
</script>

<div class="ended">
  <div class="content">
    <div class="title">SALE ENDED</div>
    <div class="button-container">
      <BigButton text="GO TO RAT.FUN" onclick={goToRatFun} />
    </div>
  </div>
</div>

<style lang="scss">
  .ended {
    text-align: center;

    .title {
      font-size: var(--font-size-super-large);
      font-family: var(--special-font-stack);
      letter-spacing: 2px;
      margin-bottom: 2rem;
    }

    .button-container {
      width: 100%;
      height: 160px;
    }
  }
</style>
