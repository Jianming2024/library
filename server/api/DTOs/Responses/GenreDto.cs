using dataAccess;
using Genre = dataAccess.Models.Genre;

namespace api.DTOs.Responses;

public class GenreDto
{
    public GenreDto(Genre entity)
    {
        Id = entity.Id;
        Name = entity.Name;
        Createdat = entity.Createdat;
        Books = entity.Books?.Select(b => b.Id).ToList() ?? new List<string>();
    }
    
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public DateTime? Createdat { get; set; }
    public List<string> Books { get; set; } = new List<string>();
}