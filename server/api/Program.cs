using api;
using api.Services;
using dataAccess.Models;
//using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var appOptions = builder.Services.AddAppOptions(builder.Configuration);
builder.Services.AddScoped<ILibraryService, LibraryService>();
builder.Services.AddDbContext<MyDbContext>(opt =>
{
    opt.UseNpgsql(appOptions.DbConnectionString );
}); 

builder.Services.AddControllers();
builder.Services.AddOpenApiDocument(); 
builder.Services.AddCors();


var app = builder.Build();
app.UseCors(config => config.
    AllowAnyHeader()
    .AllowAnyMethod()
    .AllowAnyOrigin()
    .SetIsOriginAllowed(x => true));

app.MapControllers();
app.UseOpenApi();
app.UseSwaggerUi();
app.GenerateApiClientsFromOpenApi("/../../client/src/generated-ts-client.ts").GetAwaiter().GetResult();
app.Run();
