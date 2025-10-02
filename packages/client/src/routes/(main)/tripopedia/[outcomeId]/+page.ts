import { redirect } from "@sveltejs/kit"
import { loadData } from "$lib/modules/content/sanity"
import { queries } from "$lib/modules/content/sanity/groq"
export const prerender = false

export const load = async ({ params }) => {
  const result = await loadData(queries.singleOutcome, { id: params.outcomeId })
  const room = await loadData(queries.singleRoom, { id: result.roomId })

  try {
    return { room, result }
  } catch {
    return redirect(302, `/${params.roomId}`)
  }
}
