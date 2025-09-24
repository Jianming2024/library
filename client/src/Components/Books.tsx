import {ApiException, type BookDto, type CreateBookDto} from "../generated-ts-client.ts";
import {useAtom} from "jotai";
import {allAuthorsAtom, allBooksAtom} from "../atoms.ts";
import {libraryApi} from "../baseUrl.ts";
import {useState} from "react";

export interface BookProps {
    book: BookDto
}
/* ---------- Small reusable multiselect dropdown with checkboxes ---------- */
function MultiSelect({
                         label,
                         options,
                         selectedIds,
                         onToggle,
                         emptyText = "No options",
                     }: {
    label: string;
    options: { id: string; name: string }[];
    selectedIds: string[];
    onToggle: (id: string) => void;
    emptyText?: string;
}) {
    const selected = new Set(selectedIds);
    return (
        <details className="dropdown">
            <summary className="btn btn-ghost gap-2">
                <span className="badge">{selected.size}</span>
                {label}
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-10 w-64 p-2 shadow">
                {options.length === 0 && <li className="opacity-60 p-2">{emptyText}</li>}
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
        </details>
    );
}

/* ---------- Assign authors (left, by title) ---------- */
function AssignAuthorsDropdown({
                                   book,
                                   onChange,
                               }: {
    book: BookDto;
    onChange: (nextAuthorIds: string[]) => Promise<void>;
}) {
    const [authors] = useAtom(allAuthorsAtom);
    const selected = new Set(book.authorsIds ?? []);

    async function toggle(id: string) {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        await onChange([...next]);
    }

    return (
        <details className="dropdown">
            <summary className="btn btn-ghost btn-xs gap-1">
                {/* user-plus */}
                <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M15 19a6 6 0 0 0-12 0m12-11a4 4 0 1 1-8 0 4 4 0 0 1 8 0M19 8v6M22 11h-6"/>
                </svg>
                Assign
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-10 w-60 p-2 shadow">
                <li className="menu-title opacity-60">Assign author(s)</li>
                {authors.map((a) => (
                    <li key={a.id}>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-sm"
                                checked={selected.has(a.id!)}
                                onChange={() => toggle(a.id!)}
                            />
                            <span>{a.name}</span>
                        </label>
                    </li>
                ))}
                {authors.length === 0 && <li className="opacity-60 p-2">No authors available</li>}
            </ul>
        </details>
    );
}

/* ---------- Row with edit/delete on the right ---------- */
function BookRow({
                     book,
                     onEdit,
                     onDelete,
                     onAssignAuthors,
                 }: {
    book: BookDto;
    onEdit: (book: BookDto) => void;
    onDelete: (book: BookDto) => void;
    onAssignAuthors: (bookId: string, nextAuthorIds: string[]) => Promise<void>;
}) {
    const [authors] = useAtom(allAuthorsAtom);
    const nameById = new Map(authors.map((a) => [a.id, a.name]));
    const authorNames = (book.authorsIds ?? []).map((id) => nameById.get(id) ?? `#${id}`).join(", ");

    return (
        <li className="p-5 list-row w-full flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                    <div className="font-bold">{book.title}</div>
                    <AssignAuthorsDropdown
                        book={book}
                        onChange={(ids) => onAssignAuthors(book.id, ids)}
                    />
                </div>
                <div className="text-xs uppercase font-semibold opacity-60">Pages: {book.pages}</div>
                <div className="text-xs uppercase font-semibold opacity-60">By {authorNames || "—"}</div>
            </div>

            <div className="flex items-center gap-2">
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(book)} aria-label="Edit book">
                    {/* pencil */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M15.232 5.232a2.5 2.5 0 1 1 3.536 3.536L7.5 20.036 3 21l.964-4.5L15.232 5.232z"/>
                    </svg>
                </button>
                <button className="btn btn-ghost btn-sm text-error" onClick={() => onDelete(book)} aria-label="Delete book">
                    {/* trash */}
                    <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        </li>
    );
}

/* ---------- Edit modal ---------- */
function EditBookModal({
                           initial,
                           onClose,
                           onSave,
                           saving,
                       }: {
    initial: BookDto;
    onClose: () => void;
    onSave: (title: string, pages: number) => Promise<void>;
    saving: boolean;
}) {
    const [title, setTitle] = useState(initial.title);
    const [pages, setPages] = useState<number>(initial.pages);

    return (
        <dialog open className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-3">Edit book</h3>
                <div className="flex flex-col gap-3">
                    <input className="input input-bordered" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <input className="input input-bordered" type="number" value={pages}
                           onChange={(e) => setPages(parseInt(e.target.value || "0", 10))}/>
                </div>
                <div className="modal-action">
                    <button className="btn" onClick={onClose}>Cancel</button>
                    <button className="btn btn-primary" disabled={saving} onClick={() => onSave(title, pages)}>
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

/* ---------- Page ---------- */
export default function Books() {
    const [books, setBooks] = useAtom(allBooksAtom);
    const [authors] = useAtom(allAuthorsAtom);
    const [genres] = useAtom(allGenresAtom);

    const [createBookForm, setCreateBookForm] = useState<CreateBookDto>({ title: "My amazing new book", pages: 1 });
    const [selectedAuthorIds, setSelectedAuthorIds] = useState<string[]>([]);
    const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]); // multiple as requested

    const [savingCreate, setSavingCreate] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editing, setEditing] = useState<BookDto | null>(null);
    const [savingEdit, setSavingEdit] = useState(false);

    function toggleAuthor(id: string) {
        setSelectedAuthorIds((prev) => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    }
    function toggleGenre(id: string) {
        setSelectedGenreIds((prev) => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
    }

    async function onCreateBook() {
        if (!createBookForm.title?.trim()) return;
        try {
            setSavingCreate(true);
            setError(null);

            // 1) create
            const created = await libraryApi.createBook(createBookForm);

            // 2) immediately attach authors + first genre (your UpdateBookDto supports single genreId)
            const genreId = selectedGenreIds[0]; // pick first if multiple selected
            const updated = await libraryApi.updateBook({
                bookIdForLookupReference: created.id,
                newPageCout: created.pages,
                newTitle: created.title,
                authorsIds: selectedAuthorIds,
                genreId: genreId,
            });

            // 3) update local state and reset form
            setBooks([...books, updated]);
            setCreateBookForm((f) => ({ ...f, title: "" }));
            setSelectedAuthorIds([]);
            setSelectedGenreIds([]);
        } catch (e: unknown) {
            const msg = (e as ApiException)?.message ?? "Create failed";
            setError(msg);
            console.error(e);
        } finally {
            setSavingCreate(false);
        }
    }

    async function onAssignAuthors(bookId: string, nextAuthorIds: string[]) {
        const current = books.find((b) => b.id === bookId);
        if (!current) return;
        try {
            const updated = await libraryApi.updateBook({
                bookIdForLookupReference: bookId,
                newPageCout: current.pages,
                newTitle: current.title,
                authorsIds: nextAuthorIds,
                genreId: current.genre?.id,
            });
            setBooks((prev) => prev.map((b) => (b.id === bookId ? updated : b)));
        } catch (e) {
            console.error("Assign authors failed", e);
        }
    }

    async function onSaveEdit(title: string, pages: number) {
        if (!editing) return;
        try {
            setSavingEdit(true);
            const updated = await libraryApi.updateBook({
                bookIdForLookupReference: editing.id,
                newPageCout: pages,
                newTitle: title,
                authorsIds: editing.authorsIds ?? [],
                genreId: editing.genre?.id,
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

    return (
        <div className="space-y-4">
            {/* Top create bar with multi-selects */}
            <div className="card bg-base-100 shadow-xl sticky top-20 z-10">
                <div className="card-body gap-3">
                    <h1 className="text-2xl font-semibold">Books</h1>

                    <div className="flex flex-wrap items-center gap-2">
                        <input
                            value={createBookForm.title}
                            placeholder="Title"
                            className="input input-bordered flex-1 min-w-0"
                            onChange={(e) => setCreateBookForm({ ...createBookForm, title: e.target.value })}
                        />
                        <input
                            value={createBookForm.pages}
                            type="number"
                            placeholder="Pages"
                            className="input input-bordered w-28"
                            onChange={(e) =>
                                setCreateBookForm({
                                    ...createBookForm,
                                    pages: Number.parseInt(e.target.value || "0", 10),
                                })
                            }
                        />

                        {/* Multi-select Authors */}
                        <MultiSelect
                            label="Authors"
                            options={authors.map(a => ({ id: a.id!, name: a.name! }))}
                            selectedIds={selectedAuthorIds}
                            onToggle={toggleAuthor}
                            emptyText="No authors available"
                        />

                        {/* Multi-select Genres (choose many, we attach the first due to API shape) */}
                        <MultiSelect
                            label="Genres"
                            options={genres.map(g => ({ id: g.id!, name: g.name! }))}
                            selectedIds={selectedGenreIds}
                            onToggle={toggleGenre}
                            emptyText="No genres available"
                        />

                        <button className="btn btn-primary" disabled={savingCreate} onClick={onCreateBook}>
                            {savingCreate ? "Creating…" : "Create book"}
                        </button>
                    </div>

                    {selectedGenreIds.length > 1 && (
                        <div className="text-xs opacity-70">
                            Note: your API accepts a single <code>genreId</code>. I’ll attach the <b>first</b> selected genre.
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-error mt-1">
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* List with edit/delete */}
            <ul className="list bg-base-100 rounded-box shadow-md">
                {books.map((b) => (
                    <BookRow
                        key={b.id}
                        book={b}
                        onEdit={(bk) => setEditing(bk)}
                        onDelete={onDelete}
                        onAssignAuthors={onAssignAuthors}
                    />
                ))}
                {books.length === 0 && (
                    <li className="p-6 text-center opacity-60">No books yet — create one above.</li>
                )}
            </ul>

            {editing && (
                <EditBookModal
                    initial={editing}
                    onClose={() => setEditing(null)}
                    onSave={onSaveEdit}
                    saving={savingEdit}
                />
            )}
        </div>
    );

/*export function Book(props: BookProps){
    const [authors] = useAtom(allAuthorsAtom);
    function getAuthorNamesFromIds(ids: string[]): string[] {
        const filtered =  authors.filter(a => ids.includes(a.id!));
        const names = filtered.map(f => f.name!);
        return names;
    }



    /!*function updateBook(author: AuthorDto, book: BookDto) {
        libraryApi.updateBook({
            authorsIds: [author.id!],
            bookIdForLookupReference: book.id!,
            genreId: book.genre?.id!,
            newTitle: book.title!,
            newPageCout: book.pages!
        }).then(r => {

        }).catch(e => {

        })
    }*!/

    return (
        <li className="p-5 list-row w-full flex justify-between">
            <div>
                <div className="font-bold">{props.book.title}</div>
                <div className="text-xs uppercase font-semibold opacity-60">Pages: {props.book.pages}</div>
                <div className="text-xs uppercase font-semibold opacity-60">By {getAuthorNamesFromIds(props.book.authorsIds!).join(",")}</div>
            </div>
            <details className="dropdown dropdown-left">
                <summary className="btn m-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
                         stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                              d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>
                    </svg>
                </summary>
                <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                    <li>Assign author to book</li>
                    {
                        //todo next up
                    }
                </ul>
            </details>
        </li>
    );
}

export default function Books() {
    const [books, setAllBooks] = useAtom(allBooksAtom);
    //const [authors] = useAtom(allAuthorsAtom);
    const [createBookForm, setCreateBookForm] = useState<CreateBookDto>({
        pages: 1,
        title: "My amazing new book"
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onCreateBook() {
        if (!createBookForm.title?.trim()) return;
        try {
            setSaving(true);
            setError(null);
            const created = await libraryApi.createBook(createBookForm);
            setAllBooks([...books, created]);
            // reset title; keep last pages value for convenience
            setCreateBookForm((f) => ({ ...f, title: "" }));
        } catch (e: unknown) {
            if (e instanceof ApiException) {
                setError(e.message ?? "Create failed");
                console.error(e);
            } else {
                setError("Create failed");
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4">
            {/!* Top toolbar (sticky) *!/}
            <div className="card bg-base-100 shadow-xl sticky top-20 z-10">
                <div className="card-body gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <h1 className="text-2xl font-semibold">Books</h1>
                    </div>

                    {/!* Create book line *!/}
                    <div className="flex items-center gap-2">
                        <input
                            value={createBookForm.title}
                            placeholder="Title"
                            className="input input-bordered flex-1 min-w-0"
                            onChange={(e) => setCreateBookForm({ ...createBookForm, title: e.target.value })}
                        />
                        <input
                            value={createBookForm.pages}
                            type="number"
                            placeholder="Pages"
                            className="input input-bordered w-28"
                            onChange={(e) =>
                                setCreateBookForm({
                                    ...createBookForm,
                                    pages: Number.parseInt(e.target.value || "0", 10),
                                })
                            }
                        />
                        <button className="btn btn-primary" disabled={saving} onClick={onCreateBook}>
                            {saving ? "Creating…" : "Create book"}
                        </button>
                    </div>

                    {error && (
                        <div className="alert alert-error mt-1">
                            <span>{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {/!* List of books *!/}
            <ul className="list bg-base-100 rounded-box shadow-md">
                {books.map((b) => (
                    <Book key={b.id} book={b} />
                ))}
                {books.length === 0 && (
                    <li className="p-6 text-center opacity-60">No books yet — create one above.</li>
                )}
            </ul>
        </div>
    );

    /!*return <>
        <ul className="list bg-base-100 rounded-box shadow-md">
            {
                books.map(b => <Book key={b.id} book={b} />)
            }
        </ul>
        {
            books.map(b => {
                return <div key={b.id}>
                    {b.title}
                    <details className="dropdown">
                        <summary className="btn m-1">⚙️</summary>
                        <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                            {
                                authors.map(a => {
                                    return <li value={a.id} key={a.id}><input className="checkbox"
                                                                              type="checkbox"/>{a.name}</li>
                                })
                            }
                        </ul>
                    </details>
                </div>
            })
        }
        <input value={createBookForm.title} placeholder="title" className="input"
               onChange={e => setCreateBookForm({...createBookForm, title: e.target.value})}/>
        <input value={createBookForm.pages} type="number" placeholder="page count" className="input"
               onChange={e => setCreateBookForm({...createBookForm, pages: Number.parseInt(e.target.value)})}/>
        <button className="btn btn-primary" onClick={() => {
            libraryApi.createBook(createBookForm).then(r => {
                setAllBooks([...books, r])
                //toast("Book created succesfully")
            }).catch(e => {
                if (e instanceof ApiException) {
                    console.log(JSON.stringify(e))
                    //const problemDetails = JSON.parse(e.response) as ProblemDetails;
                    //toast(problemDetails.title)
                }
            })
        }}>Create book
        </button>
    </>*!/*/
}