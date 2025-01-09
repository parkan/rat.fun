<script lang="ts">
  import { player, playerId, rats } from "@svelte/modules/state/base/stores"
  import {
    BASE_REALITY_PROMPT,
    BASE_STYLE_GUIDELINES,
    BASE_ROOM_PROMPT,
  } from "./constants"
  import { parseJSONFromContent } from "@modules/utils"

  let busy = false
  let outcome: any
  let narrative = ""
  let inRoom = false

  let realityPrompt = BASE_REALITY_PROMPT
  let styleGuidelines = BASE_STYLE_GUIDELINES
  let roomPrompt = BASE_ROOM_PROMPT

  const generateRatPrompt = () => {
    return JSON.stringify({
      medulla: $player.brain.traitA,
      cereberus: $player.brain.traitB,
      deathDrive: $player.brain.traitC,
      pinealGland: $player.brain.traitD,
    })
  }

  const submit = async () => {
    inRoom = true
    busy = true
    narrative = ""
    outcome = {}
    // const url = "http://localhost:3030/api/generate"
    const url = "https://reality-model-1.mc-infra.com/api/generate"

    const formData = new URLSearchParams()
    formData.append("realityPrompt", realityPrompt)
    formData.append("styleGuidelines", styleGuidelines)
    formData.append("roomPrompt", roomPrompt)
    formData.append("ratPrompt", generateRatPrompt())

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const res = await response.json()
      console.log("res", res)
      // const data = JSON.parse(res.data)
      // console.log(data[0])
      outcome = parseJSONFromContent(res.message.text)
      console.log(outcome)
      narrative = outcome.narrative

      busy = false
    } catch (err) {
      // console.error(err)
      outcome = "An error occurred. Please try again."
      busy = false
    }
  }
</script>

<div class="nest">
  <div>
    <strong>PLAYER</strong>
    <br />id: {$playerId}
    <br />Currency:{$player.currency}
  </div>
  <img src="/images/rat.jpg" alt="nest" />
  <div>
    <strong>RAT</strong>
    <br />id: {$player.ownedRat}
    <br />Trait: {$rats[$player.ownedRat].trait}
    <br />Health: {$rats[$player.ownedRat].health}
    <br />Energy: {$rats[$player.ownedRat].energy}
  </div>
</div>

<style lang="scss">
  .nest {
    text-align: center;
    padding: 10px;
    background: rgb(88, 88, 88);
    color: white;
    width: 100%;
    font-family: "courier new", monospace;

    img {
      margin-top: 1em;
      margin-bottom: 1em;
    }
  }

  .room {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgb(60, 60, 60);
    padding: 20px;
  }

  .header {
    font-weight: bold;
    margin-bottom: 1em;
  }

  .trait {
    margin-bottom: 1em;
  }

  button {
    padding: 40px;
    font-size: 32px;
    margin-top: 20px;
    cursor: pointer;
  }

  .room-item {
    display: flex;
    width: 100%;

    button {
      width: 50%;
      padding: 40px;
      font-size: 32px;
      margin-top: 20px;
    }
  }

  .room-info {
    padding: 20px;
    background: rgb(211, 255, 79);
    color: black;
    margin-top: 20px;
    font-size: 12px;
  }

  .narrative {
    padding: 20px;
    background: yellow;
    color: black;
    margin-top: 20px;
  }

  .outcome {
    font-weight: bold;
    background: black;
    color: white;
    margin-top: 20px;
  }

  textarea {
    width: 500px;
    height: 100%;
    padding: 4px;
  }

  .loader {
    margin-top: 20px;
    margin-bottom: 20px;
  }
</style>
