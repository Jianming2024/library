using api.DTOs.Requests;
using api.DTOs.Responses;
using api.Services;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
public class LibraryController(ILibraryService libraryService) : ControllerBase       
{   
    [HttpGet(nameof(GetAuthors))]
    public async Task<List<AuthorDto>> GetAuthors()
    {
        return await libraryService.GetAuthors();
    }   
    
    [HttpGet(nameof(GetBooks))]
    public async Task<List<BookDto>> GetBooks()
    {
        return await libraryService.GetBooks();
    }   
    
    [HttpGet(nameof(GetGenres))]
    public async Task<List<GenreDto>> GetGenres()
    {
        return await libraryService.GetGenres();
    }

    [HttpPost(nameof(CreateBook))]
    public async Task<BookDto> CreateBook([FromBody]CreateBookDto dto)
    {
        return await libraryService.CreateBook(dto);
    }

    [HttpPut(nameof(UpdateBook))]
    public async Task<BookDto> UpdateBook([FromBody]UpdateBookDto dto)
    {
        return await libraryService.UpdateBook(dto);
    }

    [HttpDelete(nameof(DeleteBook))]
    public async Task<BookDto> DeleteBook([FromQuery] string bookId)
    {
        return await libraryService.DeleteBook(bookId);
    } 
    
    [HttpPost(nameof(CreateAuthor))]
    public async Task<AuthorDto> CreateAuthor([FromBody]CreateAuthorDto dto)
    {
        return await libraryService.CreateAuthor(dto);
    }
    
    [HttpPut(nameof(UpdateAuthor))]
    public async Task<AuthorDto> UpdateAuthor([FromBody]UpdateAuthorDto dto)
    {
        return await libraryService.UpdateAuthor(dto);  
    }
    
    [HttpDelete(nameof(DeleteAuthor))]
    public async Task<AuthorDto> DeleteAuthor([FromQuery] string authorId)
    {
        return await libraryService.DeleteAuthor(authorId);
    }
    
}