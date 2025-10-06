import type { TerminalOutputUnit } from "$lib/modules/terminal-typer/types"

export function generateTripSetupOutput() {
  const tripSetupOutput: TerminalOutputUnit[] = [
    {
      type: "text",
      content: "RAT.FUN SCIENTIFIC INSTRUMENTS LLC",
      color: "white",
      backgroundColor: "black",
      duration: 0,
      delayAfter: 50
    },
    {
      type: "text",
      content: "(c) 2034 Sexc-hell island, Kowloon, Hong Kong",
      color: "white",
      backgroundColor: "black",
      duration: 0,
      delayAfter: 50
    },
    {
      type: "text",
      content: "All Rights Reserved in accordance with Maritime Law",
      color: "white",
      backgroundColor: "black",
      duration: 0,
      delayAfter: 50
    },
    {
      type: "text",
      content: "Patent pending in all non-aligned territories",
      color: "white",
      backgroundColor: "black",
      duration: 0,
      delayAfter: 50
    },
    {
      type: "text",
      content: "FUN and RAT are registered trademarks of RAT.FUN SCIENTIFIC INSTRUMENTS LLC",
      color: "white",
      backgroundColor: "black",
      duration: 0,
      delayAfter: 50
    },
    {
      type: "text",
      content:
        "FUN HEREBY SHOULD BE INFERNALLY INTERPRETED AS THE SKILL FULL APPLICATION OF KNOWLEDGE AND NON-STOCHASTIC",
      color: "white",
      backgroundColor: "black",
      duration: 0,
      delayAfter: 50
    },
    {
      type: "text",
      content: 'PROCESSES (ie. "GOD MODE incarnate")',
      color: "white",
      backgroundColor: "black",
      duration: 0,
      delayAfter: 50
    },
    {
      type: "text",
      content: "Setting up trip...",
      color: "white",
      backgroundColor: "red",
      delayAfter: 100
    },
    {
      type: "loader",
      content: "Loading...",
      color: "white",
      duration: 500,
      backgroundColor: "red",
      loaderCharacters: "#",
      delayAfter: 100
    },
    {
      type: "text",
      content: "= Pneumatic system engaged",
      color: "white",
      backgroundColor: "black",
      delayAfter: 100
    },
    {
      type: "text",
      content: "= Rat conveyed to trip chamber",
      color: "white",
      backgroundColor: "black",
      delayAfter: 100
    },
    {
      type: "text",
      content: "= PETA approved Diaper attached",
      color: "white",
      backgroundColor: "black",
      delayAfter: 100
    },
    {
      type: "text",
      content: "= Intercranial probes attached",
      color: "white",
      backgroundColor: "black",
      delayAfter: 100
    },
    {
      type: "text",
      content: "= Rat dosed with 44mg of Slopamine",
      color: "white",
      backgroundColor: "black",
      delayAfter: 100
    },
    {
      type: "text",
      content: "= Trip initiated.....",
      color: "white",
      backgroundColor: "black",
      delayAfter: 100
    },
    {
      type: "loader",
      content: "",
      color: "orange",
      duration: 1000,
      backgroundColor: "green",
      loaderCharacters: "*"
    }
  ]
  return tripSetupOutput
}
