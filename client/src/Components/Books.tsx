import {ApiException, type BookDto, type CreateBookDto} from "../generated-ts-client.ts";
import {useAtom} from "jotai";
import {allAuthorsAtom, allBooksAtom} from "../atoms.ts";
import {libraryApi} from "../baseUrl.ts";
import {useState} from "react";

export interface BookProps {
    book: BookDto
}

export  function Book(props: BookProps){

    const [authors] = useAtom(allAuthorsAtom);

    function getAuthorNamesFromIds(ids: string[]): string[] {
        const filtered =  authors.filter(a => ids.includes(a.id!));
        const names = filtered.map(f => f.name!);
        return names;
    }

    /*function updateBook(author: AuthorDto, book: BookDto) {
        libraryApi.updateBook({
            authorsIds: [author.id!],
            bookIdForLookupReference: book.id!,
            genreId: book.genre?.id!,
            newTitle: book.title!,
            newPageCout: book.pages!
        }).then(r => {

        }).catch(e => {

        })
    }*/

    return <li className="p-5 list-row w-full flex justify-between">


        <div>
            <div>{props.book.title}</div>
            <div className="text-xs uppercase font-semibold opacity-60">Pages: {props.book.pages}</div>
            <div className="text-xs uppercase font-semibold opacity-60">By {getAuthorNamesFromIds(props.book.authorsIds!)}</div>

        </div>
        <details className="dropdown dropdown-left">
            <summary className="btn m-1">⚙️</summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                <li>Assign author to book</li>
                {
                    //todo next up
                }
            </ul>
        </details>
    </li>;

}

export default function Books() {

    const [books, setAllBooks] = useAtom(allBooksAtom);
    const [authors] = useAtom(allAuthorsAtom);
    const [createBookForm, setCreateBookForm] = useState<CreateBookDto>({
        pages: 1,
        title: "my amazing new book"
    });


    return <>
        <ul className="list bg-base-100 rounded-box shadow-md">

            <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Most played songs this week</li>
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
    </>
}