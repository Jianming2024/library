using api.DTOs.Requests;
using api.DTOs.Responses;

namespace api.Services;

public interface ILibraryService
{
    Task<List<AuthorDto>> GetAuthors();
    Task<List<BookDto>> GetBooks();
    Task<List<GenreDto>> GetGenres();
    Task<BookDto> CreateBook(CreateBookDto dto);
    Task<BookDto> UpdateBook(UpdateBookDto dto);
    Task<BookDto> DeleteBook(string id);
    Task<AuthorDto> CreateAuthor(CreateAuthorDto dto);
    /*Task<AuthorDto> UpdateAuthor(UpdateAuthorDto dto);
    Task<AuthorDto> DeleteAuthor(string id);*/
}