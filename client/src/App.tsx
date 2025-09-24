import {useEffect} from 'react'
import {libraryApi} from "./baseUrl"
import {useAtom} from "jotai";
import {allAuthorsAtom, allBooksAtom, allGenresAtom} from "./atoms.ts";
import {createBrowserRouter, Navigate, RouterProvider} from "react-router";
import Genres from "./Components/Genres.tsx";
import Authors from "./Components/Authors.tsx";
import Home from "./Components/Home.tsx";
import Books from "./Components/Books.tsx";

function App() {
    const [, setAuthors] = useAtom(allAuthorsAtom);
    const [, setBooks] = useAtom(allBooksAtom);
    const [, setGenres] = useAtom(allGenresAtom);

    useEffect(() => {
        initializeData();
    },[])

    async function initializeData() {
        setAuthors(await libraryApi.getAuthors());
        setBooks(await libraryApi.getBooks());
        setGenres(await libraryApi.getGenres());
    }
  return (
    <>
        <RouterProvider router={createBrowserRouter([
            {
                path: '',
                element: <Home/>,
                children: [
                    { index: true, element: <Navigate to="books" replace /> },
                    {
                        path: 'books',
                        element: <Books/>
                    },
                    {
                        path: 'authors',
                        element: <Authors/>
                    },
                    {
                        path: 'genres',
                        element: <Genres/>
                    }
                ]
            }
        ])}/>
    </>
  )
}

export default App
