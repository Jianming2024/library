using System.ComponentModel.DataAnnotations;

namespace api.DTOs.Requests;

public record UpdateAuthorDto
{
    [Required] [MinLength(1)] public string AuthorIdForLookupReference { get; set; }
    [Required] [MinLength(1)] public string NewName { get; set; }
    
}