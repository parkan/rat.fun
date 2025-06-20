<script lang="ts">
  import { fade } from "svelte/transition"
  import { page } from "$app/state"
  import {
    transitionFunctions,
    type TransitionConfig,
    type TransitionFunction
  } from "./transitions"
  import { beforeNavigate, afterNavigate } from "$app/navigation"
  // Page transitions are complex, and they can need multiple tricks to work.
  // This component tries to simplify that

  let {
    children,
    config,
    defaultTransition = "fade"
  }: {
    children: import("svelte").Snippet,
    config: TransitionConfig[],
    defaultTransition: TransitionFunction
  } = $props()

  let navigating = false

  let transitionFunctionIn = $state(transitionFunctions[defaultTransition])
  let transitionFunctionOut = $state(transitionFunctions[defaultTransition])

  let inConfig = $state({ duration: 2000, delay: 1000 })
  let outConfig = $state({ duration: 1000 })

  beforeNavigate((e) => {
    // Determine if and which one we want to use
    const wanted = config.find(entry => (entry.from === "*" || entry.from === e.from?.route.id) && entry.to === "*" || entry.to === e.to?.route.id)
    if (wanted) {
      // transitionFunctionIn = transitionFunctions?.[wanted.transition]
      transitionFunctionOut = transitionFunctions?.[wanted.transition]
    }
  })

  afterNavigate((e) => {
    console.log("AFTER")
    console.log(e)
  })
 </script>

{#key page.route.id}
  <div
    in:transitionFunctionIn={inConfig}
    out:transitionFunctionOut={outConfig}
    onintrostart={() => navigating = true}
    onintroend={() => navigating = false}
    onoutrostart={() => navigating = true}
    onoutroend={() => navigating = false}
    >
    
    {@render children?.()}
  </div>
{/key}