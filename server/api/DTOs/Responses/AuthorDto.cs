using dataAccess;
using Author = dataAccess.Models.Author;

namespace api.DTOs.Responses;

public class AuthorDto
{
    public AuthorDto(Author entity)
    {
        Id = entity.Id;
        Name = entity.Name;
        Createdat = entity.Createdat;
        Books = entity.Books?.Select(b => new BookDto(b)).ToList() ?? new List<BookDto>();
    }
    
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public DateTime? Createdat { get; set; }
    public virtual ICollection<BookDto> Books { get; set; } = new List<BookDto>();
    
}
