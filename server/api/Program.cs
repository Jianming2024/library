using api;
using dataAccess;
//using Infrastructure.Postgres.Scaffolding;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var appOptions = builder.Services.AddAppOptions(builder.Configuration);
builder.Services.AddDbContext<MyDbContext>(opt =>
{
    opt.UseNpgsql(appOptions.DbConnectionString );
});

builder.Services.AddCors();
var app = builder.Build();
app.UseCors(config => config.
    AllowAnyHeader()
    .AllowAnyMethod()
    .AllowAnyOrigin()
    .SetIsOriginAllowed(x => true));

app.MapGet("/", () => "Hello!");

app.Run();
