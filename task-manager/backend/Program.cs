using System.Text.Json;
using backend.Middleware;
using backend.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<DataService>();
builder.Services.AddSingleton<RecurrenceService>();
builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()));
builder.Services.AddControllers()
    .AddJsonOptions(opts =>
    {
        opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

var app = builder.Build();

app.UseCors();
app.UseMiddleware<AuthMiddleware>();
app.MapControllers();

app.Run();
