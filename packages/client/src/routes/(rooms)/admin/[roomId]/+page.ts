import type { PageLoad } from "./$types"
import { loadData } from "$lib/modules/content/sanity"
import { queries } from "$lib/modules/content/sanity/groq"
import { errorHandler, CMSError } from "$lib/modules/error-handling"

export const load: PageLoad = async ({ params }) => {
  try {
    console.log("hi from load function for admin room")
    const roomContent = await loadData(queries.singleRoom, { id: params.roomId })
    console.log("got content from admin room function", roomContent)

    return {
      roomContent
    }
  } catch (error) {
    console.log(error.message)
    errorHandler(new CMSError("Could not load data"))
  }
}
