using System.ComponentModel.DataAnnotations;
using api.DTOs.Requests;
using api.DTOs.Responses;
using dataAccess.Models;
using Microsoft.EntityFrameworkCore;

namespace api.Services;

public class LibraryService(MyDbContext dbctx) : ILibraryService
{
    public Task<List<AuthorDto>> GetAuthors()
    {
        return dbctx.Authors.Select(a => new AuthorDto(a)).ToListAsync();
    }
    public Task<List<BookDto>> GetBooks()
    {
        return dbctx.Books.Select(b => new BookDto(b)).ToListAsync();
    }
    public Task<List<GenreDto>> GetGenres()
    {
        return dbctx.Genres.Select(g => new GenreDto(g)).ToListAsync();
    }
    public async Task<BookDto> CreateBook(CreateBookDto dto)
    {
        Validator.ValidateObject(dto, new ValidationContext(dto), true);

        var book = new Book()
        {
            Pages = dto.Pages,
            Createdat = DateTime.UtcNow,
            Id = Guid.NewGuid().ToString(),
            Title = dto.Title
        };
        dbctx.Books.Add(book);
        await dbctx.SaveChangesAsync();
        return new BookDto(book);
    }
    public async Task<BookDto> UpdateBook(UpdateBookDto dto)
    {
        Validator.ValidateObject(dto, new ValidationContext(dto), true);
    
        var book = dbctx.Books.First(b => b.Id == dto.BookIdForLookupReference);
        dbctx.Entry(book).Collection(b => b.Authors).Load();
    
        book.Pages = dto.NewPageCout;
        book.Title = dto.NewTitle;
        book.Genre = dto.GenreId != null ? dbctx.Genres.First(g => g.Id == dto.GenreId) : null;
    
        book.Authors.Clear();
        dto.AuthorsIds?.ForEach(id => book.Authors.Add(dbctx.Authors.First(a => a.Id == id)));
    
        await dbctx.SaveChangesAsync();
        return new BookDto(book);
    }
    public async Task<BookDto> DeleteBook(string bookId)
    {
        var book = dbctx.Books.First(b => b.Id == bookId);
        dbctx.Books.Remove(book);
        await dbctx.SaveChangesAsync();
        return new BookDto(book);       
    }
    
}