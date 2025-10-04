import {useAtom} from "jotai";
import {allGenresAtom} from "../atoms.ts";
import type {GenreDto} from "../generated-ts-client.ts";

export interface GenreRowProps {
    genre: GenreDto;
}

// --- Small chip for a single genre ---
function GenreRow({ genre }: GenreRowProps) {
    const booksCount = Array.isArray(genre.books) ? genre.books.length : 0;

    return (
        <span className="badge gap-2 text-sm">
      {genre.name}
            {/* Show count only if > 0 */}
            {booksCount > 0 && <span className="badge badge-neutral">{booksCount}</span>}
    </span>
    );
}

// --- Page: one big card with all genres ---
export default function Genres() {
    const [genres] = useAtom(allGenresAtom);
    const sorted = [...genres].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

    return (
        <div className="space-y-4">
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h1 className="card-title text-2xl">Genres</h1>

                    {/* All genres inside one big card */}
                    <div className="flex flex-wrap gap-2 pt-2">
                        {sorted.map((g) => (
                            <GenreRow key={g.id} genre={g} />
                        ))}

                        {sorted.length === 0 && (
                            <div className="opacity-60">No genres available.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}