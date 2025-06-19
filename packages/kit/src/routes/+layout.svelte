<script lang="ts">
  import "../app.css"
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props()

  $inspect(data.environment)
</script>

{@render children?.()}
