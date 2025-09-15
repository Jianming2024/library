drop schema if exists Library cascade;
create schema if not exists Library;

create table Library.author
(
    id        text primary key not null,
    name      text             not null,
    createdAt timestamp with time zone
);

create table Library.genre
(
    id        text primary key not null,
    name      text             not null,
    createdAt timestamp with time zone
);

create table Library.book
(
    id        text primary key not null,
    title     text             not null,
    pages     int              not null,
    createdAt timestamp with time zone,
    genreId   text             references library.genre (id) on delete set null
);

create table Library.authorbookjunction
(
    authorId text references library.author (id) on delete cascade,
    bookId   text references library.book (id) on delete cascade,
    primary key (authorId, bookId)
);