import type { PageLoad } from "./$types"
import { loadData } from "$lib/modules/content/sanity"
import { queries } from "$lib/modules/content/sanity/groq"
import { redirect } from "@sveltejs/kit"
import { errorHandler, CMSError } from "$lib/modules/error-handling"
import { getWorldAddress } from "$lib/mud/getWorldAddress"
import { environment as environmentStore } from "$lib/modules/network"
import { get } from "svelte/store"

export const load: PageLoad = async ({ params }) => {
  try {
    const worldAddress = getWorldAddress(get(environmentStore))

    const tripContent = await loadData(queries.singleTrip, {
      id: params.tripId,
      worldAddress
    })

    return {
      tripId: params.tripId,
      tripContent
    }
  } catch (err) {
    console.error(err)
    errorHandler(new CMSError("Could not load data"))
    redirect(302, "/")
  }
}
