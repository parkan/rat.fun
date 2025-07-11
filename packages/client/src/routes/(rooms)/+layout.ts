import type { LayoutLoad } from "./$types"

export const prerender = true
export const ssr = false

export const load: LayoutLoad = async ({ parent }) => {
  return await parent()
}
