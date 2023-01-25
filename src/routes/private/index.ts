import * as NoteRoutes from "./note";
import * as TagsRoutes from "./tag";

export const all = [
    ...Object.values(NoteRoutes),
    ...Object.values(TagsRoutes),
]