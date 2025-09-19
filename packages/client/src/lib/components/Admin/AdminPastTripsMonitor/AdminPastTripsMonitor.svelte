<div class="admin-trip-monitor">Past trips</div>

<style lang="scss">
  .admin-trip-monitor {
    width: 100%;
    background: blue;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 2rem;

    .p-l-overview {
      // background: #000;
      width: 500px;
      padding-right: 1rem;
      display: grid;
      grid-template-columns: repeat(1fr, 2);
      grid-template-rows: repeat(1fr, 2);
      gap: 1rem;

      .top {
        grid-column: 1/3;
        background: red;
        padding: 0.2rem;
      }
      .bottom-left,
      .bottom-right {
        padding: 0.2rem;
        margin: 0;
        background: blue;
      }
      p {
        margin: 0;
      }
    }

    .p-l-graph {
      height: 400px;
      width: 100%;
      background: #222;
    }
  }
</style>
