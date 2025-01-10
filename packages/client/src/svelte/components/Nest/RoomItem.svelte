<script lang="ts">
  import { parseJSONFromContent } from "@modules/utils"
  import { player } from "@modules/state/base/stores"
  import { walletNetwork } from "@modules/network"
  import { MESSAGE } from "./constants"

  export let room: Room
  export let roomId: string

  let busy = false
  let outcome: any
  let narrative = ""
  let inRoom = false

  const submit = async () => {
    inRoom = true
    busy = true
    narrative = ""
    outcome = {}
    const url = "http://localhost:3131/api/generate"
    // const url = "https://reality-model-1.mc-infra.com/api/generate"

    const signature = await $walletNetwork.walletClient.signMessage({
      message: MESSAGE,
    })

    const formData = new URLSearchParams()
    formData.append("signature", signature)
    formData.append("roomId", roomId)
    formData.append("ratId", $player.ownedRat)

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

<div class="room-item">
  <button on:click={submit} disabled={busy}>ROOM {room.roomIndex}</button>
  <div class="room-info">
    {room.roomPrompt}
  </div>
</div>

<style lang="scss">
  .room-item {
    display: flex;
    width: 100%;

    button {
      width: 50%;
      padding: 40px;
      font-size: 32px;
      margin-top: 20px;
      cursor: pointer;
    }
  }

  .room-info {
    padding: 20px;
    background: rgb(211, 255, 79);
    color: black;
    margin-top: 20px;
    font-size: 16px;
  }
</style>
