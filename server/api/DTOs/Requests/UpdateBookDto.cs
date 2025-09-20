using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace api.DTOs.Requests;

public record UpdateBookDto
{
    [Required] [MinLength(1)] public string BookIdForLookupReference { get; set; }
    [Required] [Range(1, Int32.MaxValue)]public int NewPageCout { get; set; }
    [Required] [MinLength(1)] public string NewTitle { get; set; }
    [Required] public List<string> AuthorsIds { get; set; }
    public string? GenreId { get; set; }
}