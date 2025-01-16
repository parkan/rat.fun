// ICONS
import { MdList, MdGavel } from "react-icons/md"

export default (S: any) =>
    S.list()
        .title("Rat Room")
        .items([
            S.listItem()
                .title("Event prompts")
                .icon(MdList)
                .child(
                    S.editor()
                        .id('event-prompts')
                        .schemaType("eventPrompts")
                        .documentId("event-prompts")
            ),
            S.listItem()
                .title("Outcome prompts")
                .icon(MdGavel)
                .child(
                    S.editor()
                        .id('outcome-prompts')
                        .schemaType("outcomePrompts")
                        .documentId("outcome-prompts")
            )
        ]);