// ICONS
import { MdList, MdGavel, MdChecklist } from "react-icons/md"

export default (S: any) =>
    S.list()
        .title("Rat Room")
        .items([
            S.listItem()
            .title("Active prompts")
            .icon(MdChecklist)
            .child(
                S.editor()
                    .id('active-prompts')
                    .schemaType("activePrompts")
                    .documentId("active-prompts")
            ),
            S.listItem()
            .title("Prompts")
            .icon(MdList)
            .child(
                S.documentList()
                    .title('Prompts')
                    .filter('_type == "prompt"')
                    .schemaType("prompt")
            ),
            S.divider(),
            S.listItem()
            .title("Combined prompts")
            .icon(MdList)
            .child(
                S.editor()
                    .id('combined-prompts')
                    .schemaType("combinedPrompts")
                    .documentId("combined-prompts")
            ),
            S.listItem()
            .title("Correction prompts")
            .icon(MdGavel)
            .child( 
                S.editor()
                    .id('correction-prompts')
                    .schemaType("correctionPrompts")
                    .documentId("correction-prompts")
            )

        ]);