import { loadData } from "./sanity";
import { queries } from "./groq";
import type { WorldPrompts } from "../../../cms/sanity.types";

export const getWorldPrompts = async () => {
    return await loadData(queries.worldPrompts, {}) as WorldPrompts;
}