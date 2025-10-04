import {ApiException, type BookDto, type CreateBookDto} from "../generated-ts-client.ts";
import {useAtom} from "jotai";
import {allAuthorsAtom, allBooksAtom, allGenresAtom} from "../atoms.ts";
import {libraryApi} from "../baseUrl.ts";
import {useRef, useState} from "react";

/*Icons*/
function XIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
    );
}
function UsersIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-5.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M15 19a6 6 0 0 0-12 0m12-11a4 4 0 1 1-8 0 4 4 0 0 1 8 0M19 8v6M22 11h-6"/>
        </svg>
    );
}
function GenresIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" className="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeWidth="1.5" d="M7 7h6l7 7-6 6-7-7V7zM7 7l-4 4 7 7"/>
            <circle cx="10" cy="10" r="1.5"/>
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

/*Chips (selected items) which used in top create bar and edit model*/
function Chips({
                   items,
                   onRemove,
                   emptyText,
               }: {
    items: { id: string; name: string }[];
    onRemove: (id: string) => void;
    emptyText: string;
}) {
    if (items.length === 0) {
        return <div className="text-sm opacity-60">{emptyText}</div>;
    }
    return (
        <div className="flex flex-wrap gap-2">
            {items.map((it) => (
                <span key={it.id} className="badge gap-1">
          {it.name}
                    <button className="btn btn-ghost btn-xs" onClick={() => onRemove(it.id)} aria-label={`remove ${it.name}`}>
            <XIcon />
          </button>
        </span>
            ))}
        </div>
    );
}

/*Icon MultiSelect-dropdown with close*/
function IconMultiSelect({
                             icon,
                             label,
                             options,
                             selectedIds,
                             onToggle,
                         }: {
    icon: React.ReactNode;
    label: string;
    options: { id: string; name: string }[];
    selectedIds: string[];
    onToggle: (id: string) => void;
}) {
    const selected = new Set(selectedIds);
    const detailsRef = useRef<HTMLDetailsElement>(null);

    function close() {
        if (detailsRef.current) detailsRef.current.open = false;
    }

    return (
        <details className="dropdown" ref={detailsRef}>
            <summary className="btn btn-ghost gap-2">
                {icon}
                <span className="badge">{selected.size}</span>
                <span className="hidden sm:inline">{label}</span>
            </summary>

            <div className="dropdown-content bg-base-100 rounded-box z-10 w-72 shadow">
                <div className="p-2 border-b flex items-center justify-between">
                    <span className="font-semibold text-sm">{label}</span>
                    <button className="btn btn-ghost btn-xs" onClick={close} aria-label="Close">
                        <XIcon />
                    </button>
                </div>
                <ul className="menu p-2 max-h-64 overflow-auto">
                    {options.length === 0 && <li className="opacity-60 p-2">No options</li>}
                    {options.map((o) => (
                        <li key={o.id}>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm"
                                    checked={selected.has(o.id)}
                                    onChange={() => onToggle(o.id)}
                                />
                                <span className="truncate">{o.name}</span>
                            </label>
                        </li>
                    ))}
                </ul>
            </div>
        </details>
    );
}

export interface BookRowProps {
    book: BookDto;
    onEdit: (book: BookDto) => void;
    onDelete: (book: BookDto) => void;
    authorNameById: (id: string) => string | undefined;
}

/*Book row (with edit/delete functions)*/
function BookRow({ book, onEdit, onDelete, authorNameById }: BookRowProps) {
    const authorNames = (book.authorsIds ?? []).map((id) => authorNameById(id) ?? `#${id}`).join(", ");

    return (
        <li className="p-5 list-row w-full flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
                <div className="font-bold">{book.title}</div>
                <div className="text-xs uppercase font-semibold opacity-60">Pages: {book.pages}</div>
                <div className="text-xs uppercase font-semibold opacity-60">By {authorNames || "—"}</div>
                {book.genre && <div className="text-xs uppercase font-semibold opacity-60">Genre: {book.genre.name}</div>}
            </div>

            <div className="flex items-center gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(book)} aria-label="Edit book">
                    <PencilIcon />
                </button>
                <button className="btn btn-ghost btn-sm text-error" onClick={() => onDelete(book)} aria-label="Delete book">
                    <TrashIcon />
                </button>
            </div>
        </li>
    );
}

/*Edit functions*/
function EditBookModal({
                           initial,
                           onClose,
                           onSave,
                           saving,
                           allAuthors,
                           allGenres,
                       }: {
    initial: BookDto;
    onClose: () => void;
    onSave: (title: string, pages: number, authorsIds: string[], genreId?: string) => Promise<void>;
    saving: boolean;
    allAuthors: { id: string; name: string }[];
    allGenres: { id: string; name: string }[];
}) {
    const [title, setTitle] = useState(initial.title);
    const [pages, setPages] = useState<number>(initial.pages);
    const [authorsIds, setAuthorsIds] = useState<string[]>(initial.authorsIds ?? []);
    const [genreIds, setGenreIds] = useState<string[]>(initial.genre?.id ? [initial.genre.id] : []);

    function toggle(setter: (v: string[]) => void, ids: string[], id: string) {
        setter(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]);
    }

    return (
        <dialog open className="modal">
            <div className="modal-box">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg">Edit book</h3>
                    <button className="btn btn-ghost btn-sm" onClick={onClose}><XIcon/></button>
                </div>

                <div className="flex flex-col gap-3">
                    <input
                        className="input input-bordered"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Book Title"
                    />
                    <input
                        className="input input-bordered"
                        type="number"
                        value={pages}
                        onChange={(e) => setPages(parseInt(e.target.value || "0", 10))}
                        placeholder="Pages"
                    />

                    {/* icon multi-selects */}
                    <div className="flex items-center gap-2">
                        <IconMultiSelect
                            icon={<UsersIcon />}
                            label="Authors"
                            options={allAuthors}
                            selectedIds={authorsIds}
                            onToggle={(id) => toggle(setAuthorsIds, authorsIds, id)}
                        />
                        <IconMultiSelect
                            icon={<GenresIcon />}
                            label="Genres"
                            options={allGenres}
                            selectedIds={genreIds}
                            onToggle={(id) => toggle(setGenreIds, genreIds, id)}
                        />
                    </div>

                    {/* chips */}
                    <Chips
                        items={allAuthors.filter((a) => authorsIds.includes(a.id))}
                        onRemove={(id) => setAuthorsIds(authorsIds.filter((x) => x !== id))}
                        emptyText="No authors selected"
                    />
                    <Chips
                        items={allGenres.filter((g) => genreIds.includes(g.id))}
                        onRemove={(id) => setGenreIds(genreIds.filter((x) => x !== id))}
                        emptyText="No genre selected"
                    />
                    {genreIds.length > 1 && (
                        <div className="text-xs opacity-70">
                            Note: API accepts a single <code>genreId</code>. The first selected will be saved.
                        </div>
                    )}
                </div>

                <div className="modal-action">
                    <button className="btn" onClick={onClose}>Cancel</button>
                    <button
                        className="btn btn-primary"
                        disabled={saving}
                        onClick={() => onSave(title, pages, authorsIds, genreIds[0])}
                    >
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

/* =========================
   Page
   ========================= */
export default function Books() {
    const [books, setBooks] = useAtom(allBooksAtom);
    const [authors] = useAtom(allAuthorsAtom);
    const [genres] = useAtom(allGenresAtom);

    const [createBookForm, setCreateBookForm] = useState<CreateBookDto>({ title: "Book Title", pages: 1 });
    const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);

    const [savingCreate, setSavingCreate] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState<BookDto | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    const authorOptions = authors.map((a) => ({ id: a.id!, name: a.name! }));
    const genreOptions = genres.map((g) => ({ id: g.id!, name: g.name! }));

    function toggleSelected(setter: (v: string[]) => void, arr: string[], id: string) {
        setter(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
    }

    async function onCreateBook() {
        if (!createBookForm.title?.trim()) return;
        try {
            setSavingCreate(true);
            setError(null);

            // 1) create (title/pages)
            const created = await libraryApi.createBook(createBookForm);

            // 2) attach authors + first genre
            const updated = await libraryApi.updateBook({
                bookIdForLookupReference: created.id,
                newPageCout: created.pages,
                newTitle: created.title,
                authorsIds: selectedAuthorIds,
                genreId: selectedGenreIds[0],
            });

            setBooks([...books, updated]);
            setCreateBookForm((f) => ({ ...f, title: "" }));
            setSelectedAuthorIds([]);
            setSelectedGenreIds([]);
        } catch (e) {
            const msg = (e as ApiException)?.message ?? "Create failed";
            setError(msg);
            console.error(e);
        } finally {
            setSavingCreate(false);
        }
    }

    async function onSaveEdit(title: string, pages: number, authorsIds: string[], genreId?: string) {
        if (!editing) return;
        try {
            setSavingEdit(true);
            const updated = await libraryApi.updateBook({
                bookIdForLookupReference: editing.id,
                newPageCout: pages,
                newTitle: title,
                authorsIds,
                genreId,
            });
            setBooks((prev) => prev.map((b) => (b.id === editing.id ? updated : b)));
            setEditing(null);
        } catch (e) {
            console.error("Update book failed", e);
        } finally {
            setSavingEdit(false);
        }
    }

    async function onDelete(book: BookDto) {
        try {
            await libraryApi.deleteBook(book.id);
            setBooks((prev) => prev.filter((b) => b.id !== book.id));
        } catch (e) {
            console.error("Delete failed", e);
        }
    }

    const authorNameById = (id: string) => authors.find((a) => a.id === id)?.name;

    return (
        <div className="space-y-4">
            {/* Top create bar with ICON multi-selects + chips */}
            <div className="card bg-base-100 shadow-xl sticky top-20 z-10">
                <div className="card-body gap-3">
                    <h1 className="text-2xl font-semibold">Books</h1>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            value={createBookForm.title}
                            placeholder="Book Title"
                            className="input input-bordered flex-1 min-w-0"
                            onChange={(e) => setCreateBookForm({ ...createBookForm, title: e.target.value })}
                        />
                        <input
                            value={createBookForm.pages}
                            type="number"
                            placeholder="Pages"
                            className="input input-bordered w-28"
                            onChange={(e) => setCreateBookForm({ ...createBookForm, pages: Number.parseInt(e.target.value || "0", 10) })}
                        />

                        <IconMultiSelect
                            icon={<UsersIcon />}
                            label="Authors"
                            options={authorOptions}
                            selectedIds={selectedAuthorIds}
                            onToggle={(id) => toggleSelected(setSelectedAuthorIds, selectedAuthorIds, id)}
                        />
                        <IconMultiSelect
                            icon={<GenresIcon />}
                            label="Genres"
                            options={genreOptions}
                            selectedIds={selectedGenreIds}
                            onToggle={(id) => toggleSelected(setSelectedGenreIds, selectedGenreIds, id)}
                        />

                        <button className="btn btn-primary" disabled={savingCreate} onClick={onCreateBook}>
                            {savingCreate ? "Creating…" : "Create book"}
                        </button>
                    </div>

                    {/* Selected chips */}
                    <Chips
                        items={authorOptions.filter((a) => selectedAuthorIds.includes(a.id))}
                        onRemove={(id) => setSelectedAuthorIds((prev) => prev.filter((x) => x !== id))}
                        emptyText="No authors selected"
                    />
                    <Chips
                        items={genreOptions.filter((g) => selectedGenreIds.includes(g.id))}
                        onRemove={(id) => setSelectedGenreIds((prev) => prev.filter((x) => x !== id))}
                        emptyText="No genre selected"
                    />

                    {selectedGenreIds.length > 1 && (
                        <div className="text-xs opacity-70">
                            Note: your API accepts a single <code>genreId</code>. I’ll attach the <b>first</b> selected genre.
                        </div>
                    )}

                    {error && <div className="alert alert-error mt-1"><span>{error}</span></div>}
                </div>
            </div>

            {/* List (no per-row assign UI anymore) */}
            <ul className="list bg-base-100 rounded-box shadow-md">
                {books.map((b) => (
                    <BookRow
                        key={b.id}
                        book={b}
                        onEdit={(bk) => setEditing(bk)}
                        onDelete={onDelete}
                        authorNameById={authorNameById}
                    />
                ))}
                {books.length === 0 && <li className="p-6 text-center opacity-60">No books yet — create one above.</li>}
            </ul>

            {/* Edit modal (with authors/genres + chips) */}
            {editing && (
                <EditBookModal
                    initial={editing}
                    onClose={() => setEditing(null)}
                    onSave={onSaveEdit}
                    saving={savingEdit}
                    allAuthors={authorOptions}
                    allGenres={genreOptions}
                />
            )}
        </div>
    );
}