import {useAtom} from "jotai";
import {allAuthorsAtom} from "../atoms.ts";
import {useState} from "react";
import {libraryApi} from "../baseUrl.ts";
import type { CreateAuthorDto, AuthorDto, ApiException } from "../generated-ts-client";

/* Icons */
function XIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );
}
function PencilIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15.232 5.232a2.5 2.5 0 1 1 3.536 3.536L7.5 20.036 3 21l.964-4.5L15.232 5.232z" />
        </svg>
    );
}
function TrashIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        </svg>
    );
}

/* Row */
export interface AuthorRowProps {
    author: AuthorDto;
    onEdit: (author: AuthorDto) => void;
    onDelete: (author: AuthorDto) => void;
}
function AuthorRow({ author, onEdit, onDelete }: AuthorRowProps) {
    return (
        <li className="p-5 list-row w-full flex items-center justify-between">
            <div className="font-medium">{author.name}</div>
            <div className="flex items-center gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(author)} aria-label="Edit author">
                    <PencilIcon />
                </button>
                <button className="btn btn-ghost btn-sm text-error" onClick={() => onDelete(author)} aria-label="Delete author">
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
}

/* Edit modal */
function EditAuthorModal({
                             initial,
                             onClose,
                             onSave,
                             saving,
                         }: {
    initial: AuthorDto;
    onClose: () => void;
    onSave: (newName: string) => Promise<void>;
    saving: boolean;
}) {
    const [name, setName] = useState(initial.name ?? "");
    return (
        <dialog open className="modal">
            <div className="modal-box">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">Edit author</h3>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}><XIcon /></button>
                </div>
                <div className="flex flex-col gap-3">
                    <input
                        className="input input-bordered"
                        placeholder="Author name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="modal-action">
                    <button className="btn" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" disabled={saving || !name.trim()} onClick={() => onSave(name.trim())}>
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}

/* Page */
export default function Authors() {
    const [authors, setAuthors] = useAtom(allAuthorsAtom);

    // create
    const [createAuthorForm, setCreateAuthorForm] = useState<CreateAuthorDto>({ name: "" });
    const [savingCreate, setSavingCreate] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // edit
    const [editing, setEditing] = useState<AuthorDto | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    async function onCreateAuthor() {
        const name = createAuthorForm.name?.trim();
        if (name.length === 0) return;
        try {
            setSavingCreate(true);
            setError(null);
            const created = await libraryApi.createAuthor({ name } as CreateAuthorDto);
            setAuthors((prev) => [...prev, created as AuthorDto]);
            setCreateAuthorForm({ name: "" });
        } catch (e) {
            const msg = (e as ApiException)?.message ?? "Create failed";
            setError(msg);
            console.error("createAuthor failed:", e);
        } finally {
            setSavingCreate(false);
        }
    }

    async function onSaveEditAuthor(newName: string) {
        if (!editing) return;
        try {
            setSavingEdit(true);
            const updated = await libraryApi.updateAuthor({
                authorIdForLookupReference: editing.id,
                newName,
            });
            setAuthors((prev) => prev.map((a) => (a.id === editing.id ? (updated as AuthorDto) : a)));
            setEditing(null);
        } catch (e) {
            console.error("updateAuthor failed:", e);
        } finally {
            setSavingEdit(false);
        }
    }

    async function onDeleteAuthor(author: AuthorDto) {
        try {
            await libraryApi.deleteAuthor(author.id);
            setAuthors((prev) => prev.filter((a) => a.id !== author.id));
        } catch (e) {
            console.error("deleteAuthor failed:", e);
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
                            value={createAuthorForm.name ?? ""}
                            onChange={(e) => setCreateAuthorForm({ ...createAuthorForm, name: e.target.value })}
                        />
                        <button className="btn btn-primary" disabled={savingCreate || !createAuthorForm.name?.trim()} onClick={onCreateAuthor}>
                            {savingCreate ? "Creating…" : "Create author"}
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-error mt-1">
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* List (now using AuthorRow to avoid unused warnings) */}
            <ul className="list bg-base-100 rounded-box shadow-md">
                {authors.map((a) => (
                    <AuthorRow key={a.id} author={a} onEdit={(x) => setEditing(x)} onDelete={onDeleteAuthor} />
                ))}
                {authors.length === 0 && (
                    <li className="p-6 text-center opacity-60">No authors yet — create one above.</li>
                )}
            </ul>

            {/* Edit modal */}
            {editing && (
                <EditAuthorModal
                    initial={editing}
                    onClose={() => setEditing(null)}
                    onSave={onSaveEditAuthor}
                    saving={savingEdit}
                />
            )}
        </div>
    );
}