<script lang="ts">
  import { player } from "@modules/state/base/stores"
  import { walletNetwork } from "@modules/network"
  import { MESSAGE } from "./constants"
  import { ENVIRONMENT } from "@mud/enums"

  import RoomComponent from "./Room.svelte"

  export let room: Room
  export let roomId: string
  export let environment: ENVIRONMENT

  let busy = false
  let outcome: any
  let inRoom = false

  const submit = async () => {
    inRoom = true
    busy = true
    outcome = {}
    let url = "http://localhost:3131/api/generate"

    if ([ENVIRONMENT.GARNET].includes(environment)) {
      url = "https://reality-model-1.mc-infra.com/api/generate"
    }

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

      outcome = await response.json()
      console.log(outcome)

      busy = false
    } catch (err) {
      console.log(err)
      window.alert("An error occurred. Please try again.")
      busy = false
      inRoom = false
    }
  }

  const close = () => {
    inRoom = false
    busy = false
  }
</script>

<div class="room-item">
  <button on:click={submit} disabled={busy}>ROOM {room.roomIndex}</button>
  <div class="room-info">
    {room.roomPrompt}
  </div>
</div>

{#if inRoom}
  <RoomComponent {outcome} {room} on:close={close} />
{/if}

<style lang="scss">
  .room-item {
    display: flex;
    width: 100%;

    button {
      width: 200px;
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
