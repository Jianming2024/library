using System.ComponentModel.DataAnnotations;
using api;
using api.Services;
using dataAccess.Models;
using Microsoft.EntityFrameworkCore;

public class Program
{
    public static void ConfigureServices(IServiceCollection services)
    {
        services.AddSingleton<AppOptions>(provider =>
        {
            var configuration = provider.GetRequiredService<IConfiguration>();
            var appOptions = new AppOptions();
            configuration.GetSection(nameof(AppOptions)).Bind(appOptions);
            return appOptions;
        });

        services.AddDbContext<MyDbContext>((services, opt) =>
        {
            opt.UseNpgsql(services.GetRequiredService<AppOptions>().DbConnectionString);
        }); 
        services.AddControllers();
        services.AddOpenApiDocument(); 
        services.AddCors();
        services.AddScoped<ILibraryService, LibraryService>();
        services.AddScoped<ISeeder, Seeder>();
        services.AddExceptionHandler<MyGlobalExceptionHandler>();
    }

    public static void Main()
    {
        var builder = WebApplication.CreateBuilder();
        ConfigureServices(builder.Services);
        var app = builder.Build();
        var appOptions = app.Services.GetRequiredService<AppOptions>();
        //trigger the DataAnnotations validations for AppOptions properties
        Validator.ValidateObject(appOptions, new ValidationContext(appOptions), true);
        
        app.UseOpenApi();
        app.UseSwaggerUi();
        app.UseCors(config => config.
            AllowAnyHeader()
            .AllowAnyMethod()
            .AllowAnyOrigin()
            .SetIsOriginAllowed(x => true));
        app.MapControllers();
        app.GenerateApiClientsFromOpenApi("/../../client/src/generated-ts-client.ts").GetAwaiter().GetResult();
        if (app.Environment.IsDevelopment())
        {
            using (var scope = app.Services.CreateScope())
            {
                var seeder = scope.ServiceProvider.GetService<ISeeder>();
                if (seeder != null)
                {
                    seeder.Seed();
                }
            }
        }
        app.Run();
    }
}
