<script lang="ts">
  // ...
</script>

<div class="level">
  <!-- INDEX -->
  <div class="level-item">
    <div class="label">Index</div>
  </div>
  <!-- Level up cost -->
  <div class="level-item">
    <div class="label">Level up</div>
  </div>
  <!-- Room creation cost -->
  <div class="level-item">
    <div class="label">Room create</div>
  </div>
  <!-- Update action -->
  <div class="level-item">
    <div class="label">Update</div>
  </div>
</div>

<style lang="scss">
  .level {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-bottom: 1px solid #ccc;
    font-size: 14px;
  }

  .level-item {
    display: flex;
  }

  .label {
    font-weight: bold;
  }
</style>
