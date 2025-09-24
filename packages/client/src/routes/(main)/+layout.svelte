<script lang="ts">
  import "../../app.css"
  import "tippy.js/dist/tippy.css"
  import type { LayoutProps } from "./$types"
  import MainLayout from "$lib/components/MainLayout/MainLayout.svelte"

  let { children, data }: LayoutProps = $props()

  const { environment } = data

  console.log("### routes/(main)/+layout.svelte ###")
</script>

<MainLayout {environment}>
  {@render children?.()}
</MainLayout>
