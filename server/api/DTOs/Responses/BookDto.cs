using dataAccess;
using Book = dataAccess.Models.Book;

namespace api.DTOs.Responses;

public class BookDto
{
    public BookDto(Book entity)
    {
        Id = entity.Id;
        Title = entity.Title;
        Pages = entity.Pages;
        Createdat = entity.Createdat;
        if (entity.Genre != null)
        {
                  Genre = new GenreDto(entity.Genre);
        }
        AuthorsIds = entity.Authors?.Select(a => a.Id).ToList() ?? new List<string>();
    }
    
    public string Id { get; set; } = null!;
    public string Title { get; set; } = null!;
    public int Pages { get; set; }
    public DateTime? Createdat { get; set; }
    public virtual GenreDto? Genre { get; set; }
    public virtual ICollection<string> AuthorsIds { get; set; } = new List<string>();
}