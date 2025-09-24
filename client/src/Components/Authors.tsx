import {useAtom} from "jotai";
import {allAuthorsAtom} from "../atoms.ts";
import {useState} from "react";
import {libraryApi} from "../baseUrl.ts";
import type { CreateAuthorDto, AuthorDto, ApiException } from "../generated-ts-client";

/*
export default function Authors() {
    const [authors] = useAtom(allAuthorsAtom)
    return <>{
        authors.map(a => {
            return <div key={a.id}>{JSON.stringify(a)}</div>
        })
    }</>
}*/

export default function Authors() {
    const [authors, setAuthors] = useAtom(allAuthorsAtom);
    const [form, setForm] = useState<CreateAuthorDto>({ name: "" });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onCreateAuthor() {
        const name = form.name?.trim();
        if (!name) return;

        try {
            setSaving(true);
            setError(null);

            // Adjust payload if your DTO has different field names (e.g., { newName: name })
            const created = await libraryApi.createAuthor({ name } as CreateAuthorDto);

            // optimistic add to atom
            setAuthors([...authors, created as AuthorDto]);

            // reset
            setForm({ name: "" });
        } catch (e: any) {
            const msg =
                (e as ApiException)?.message ??
                e?.response?.data ??
                e?.toString?.() ??
                "Create failed";
            setError(msg);
            console.error("createAuthor failed:", e);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4">
            {/* Top toolbar (sticky) */}
            <div className="card bg-base-100 shadow-xl sticky top-20 z-10">
                <div className="card-body gap-3">
                    <h1 className="text-2xl font-semibold">Authors</h1>

                    <div className="flex items-center gap-2">
                        <input
                            className="input input-bordered flex-1 min-w-0"
                            placeholder="Author name"
                            value={form.name ?? ""}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                        <button className="btn btn-primary" disabled={saving} onClick={onCreateAuthor}>
                            {saving ? "Creating…" : "Create author"}
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-error mt-1">
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Simple list */}
            <div className="card bg-base-100 shadow">
                <div className="card-body p-0">
                    <ul className="menu p-2">
                        {authors.map((a) => (
                            <li key={a.id}>
                                <div className="flex items-center gap-3 p-3">
                                    <div className="avatar">
                                        <div className="mask mask-squircle w-8 h-8">
                                            <img
                                                src={`https://picsum.photos/seed/${encodeURIComponent(a.id ?? a.name ?? "author")}/100`}
                                                alt={a.name ?? "author"}
                                            />
                                        </div>
                                    </div>
                                    <span className="font-medium">{a.name}</span>
                                </div>
                            </li>
                        ))}
                        {authors.length === 0 && (
                            <li className="p-6 text-center opacity-60">No authors yet — create one above.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}