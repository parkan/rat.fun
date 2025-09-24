import type { LayoutLoad } from "./$types"

export const prerender = false

export const load: LayoutLoad = async ({ parent }) => {
  console.log("### routes/(main)/+layout.ts ###")
  return await parent()
}
