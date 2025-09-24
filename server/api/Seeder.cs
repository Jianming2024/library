using dataAccess.Models;

namespace api;

public class Seeder(MyDbContext ctx): ISeeder
{
    public async Task Seed()
    {   
        //Remove all before starting to add any
        ctx.Books.RemoveRange(ctx.Books);
        ctx.Authors.RemoveRange(ctx.Authors);
        ctx.Genres.RemoveRange(ctx.Genres);
        ctx.SaveChanges();
        
        var author = new Author()
        {
            Createdat = DateTime.UtcNow,
            Id = "1",
            Name = "Bob"
        };
        ctx.Authors.Add(author);
        ctx.SaveChanges();
        var book = new Book()
        {
            Createdat = DateTime.UtcNow,
            Id = "1",
            Pages = 42,
            Title = "Bobs book"
        };
        ctx.Books.Add(book);
        ctx.SaveChanges();
        
        // set several default genres
        var genreNames = new[]
        {
            "Thriller",
            "Fantasy",
            "Science Fiction",
            "Mystery",
            "Romance",
            "Non-Fiction",
            "Historical",
            "Horror",
            "Young Adult",
            "Classics"
        };
        var genres = genreNames.Select(name => new Genre
        {
            Createdat = DateTime.UtcNow,
            Id = Guid.NewGuid().ToString(),
            Name = name
        }).ToList();

        ctx.Genres.AddRange(genres);
        ctx.SaveChanges();
    }
}
public interface ISeeder
{
    public Task Seed();
}