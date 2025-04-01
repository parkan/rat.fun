import { loadData } from "@modules/cms/sanity";
import { queries } from "@modules/cms/groq";
import type { ActivePrompts, Prompt } from "@sanity-types";

type ExpandedActivePrompts = ActivePrompts & {
    activeEventPrompt: Prompt;
    activeCorrectionPrompt: Prompt;
}

export const getSystemPrompts = async () => {
    const activePrompts = await loadData(queries.activePrompts, {}) as ExpandedActivePrompts;
    return {
        combinedSystemPrompt: combineSystemPrompts(activePrompts.activeEventPrompt),
        correctionSystemPrompt: combineSystemPrompts(activePrompts.activeCorrectionPrompt)
    };
}

function combineSystemPrompts(doc: Prompt) {
    return `Return format: ${doc.returnFormat?.code ?? ""} // ${doc.prompt ?? ""}`; 
}