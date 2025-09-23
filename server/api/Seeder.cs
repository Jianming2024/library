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
        var genre = new Genre()
        {
            Createdat = DateTime.UtcNow,
            Id = "1",
            Name = "thriller"
        };
        ctx.Genres.Add(genre);
        ctx.SaveChanges();
        
    }
}
public interface ISeeder
{
    public Task Seed();
}