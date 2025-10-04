using api;
using api.Services;
using dataAccess.Models;

namespace tests;

public class BookTests (MyDbContext ctx, ILibraryService libraryService, ISeeder seeder, ITestOutputHelper outputHelper)
{
    [Fact]
    public async Task GetBooks_CanGetAllBookDtos()
    {
        await seeder.Seed();
        
        var actual = await libraryService.GetBooks();
        
        Assert.Equal(actual.First().Id, ctx.Books.First().Id);
    }
}