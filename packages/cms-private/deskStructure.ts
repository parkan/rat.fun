// ICONS
import { MdList, MdChecklist, MdScience, MdStar } from "react-icons/md"

export default (S: any, context: any) =>
  S.list()
    .title("rat.fun Private")
    .items([
      S.listItem()
        .title("Active prompts")
        .icon(MdChecklist)
        .child(
          S.editor().id("active-prompts").schemaType("activePrompts").documentId("active-prompts")
        ),
      S.listItem()
        .title("Test prompts")
        .icon(MdScience)
        .child(S.editor().id("test-prompts").schemaType("testPrompts").documentId("test-prompts")),
      S.listItem()
        .title("Prompts")
        .icon(MdList)
        .child(S.documentList().title("Prompts").filter('_type == "prompt"').schemaType("prompt")),
      S.divider(),
      S.listItem()
        .title("Outcomes")
        .icon(MdStar)
        .child(async () => {
          const client = context.getClient({ apiVersion: "2023-01-01" })
          const results = await client.fetch(
            '*[_type == "outcome"] { "address": worldAddress } | order(address asc)'
          )
          const uniqueAddresses = [
            ...new Set(results.map((r: any) => r.address).filter(Boolean))
          ] as string[]

          return S.list()
            .title("Outcomes by World")
            .items([
              S.listItem()
                .title("All Outcomes")
                .child(
                  S.documentList()
                    .title("All Outcomes")
                    .filter('_type == "outcome"')
                    .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
                ),
              S.divider(),
              ...uniqueAddresses.map((address: string) =>
                S.listItem()
                  .title(address)
                  .id(`outcome-world-${address}`)
                  .child(
                    S.documentList()
                      .title(`${address} - Outcomes`)
                      .filter('_type == "outcome" && worldAddress == $worldAddress')
                      .params({ worldAddress: address })
                      .defaultOrdering([{ field: "_createdAt", direction: "desc" }])
                  )
              )
            ])
        })
    ])
