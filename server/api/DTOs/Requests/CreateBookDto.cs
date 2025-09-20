using System.ComponentModel.DataAnnotations;

namespace api.DTOs.Requests;

public record CreateBookDto     
{
    [Required][Range(1,int.MaxValue)] public int Pages { get; set; }
    [Required] [MinLength(1)] public string Title { get; set; }
}