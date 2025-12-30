import type { PageLoad } from "./$types"
import { loadData } from "$lib/modules/content/sanity"
import { queries } from "$lib/modules/content/sanity/groq"
import { redirect } from "@sveltejs/kit"
import { errorHandler, CMSError } from "$lib/modules/error-handling"
import { getWorldAddress } from "@ratfun/common/mud"
import { environment as environmentStore } from "$lib/modules/network"
import { get } from "svelte/store"
import { createLogger } from "$lib/modules/logger"

const logger = createLogger("[TripPage]")

export const load: PageLoad = async ({ params }) => {
  try {
    const worldAddress = getWorldAddress(get(environmentStore))

    const tripContent = await loadData(queries.singleTrip, {
      id: params.tripId,
      worldAddress
    })

    return {
      tripId: params.tripId,
      tripContent: tripContent
    }
  } catch (err) {
    logger.error(err)
    errorHandler(new CMSError("Could not load data"))
    redirect(302, "/")
  }
}
