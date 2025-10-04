using System.ComponentModel.DataAnnotations;

namespace api;

public class AppOptions
{
    [Required][MinLength(1)]
    public string DbConnectionString { get; set; }
}