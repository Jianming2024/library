import type {AuthorDto, BookDto, GenreDto} from "./generated-ts-client.ts";
import {atom} from "jotai";

export const allBooksAtom = atom<BookDto[]>([]);
export const allAuthorsAtom = atom<AuthorDto[]>([]);
export const allGenresAtom = atom<GenreDto[]>([]); // no GenreDto generated yet