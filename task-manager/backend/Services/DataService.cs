using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using backend.Models;

namespace backend.Services;

public class DataService
{
    private readonly string _dataPath;
    private readonly JsonSerializerOptions _jsonOptions = new() { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public DataService(IWebHostEnvironment env)
    {
        _dataPath = Path.Combine(env.ContentRootPath, "data.json");
    }

    public AppData Load()
    {
        if (!File.Exists(_dataPath))
        {
            var seed = CreateSeedData();
            Save(seed);
            return seed;
        }
        var json = File.ReadAllText(_dataPath);
        return JsonSerializer.Deserialize<AppData>(json, _jsonOptions) ?? CreateSeedData();
    }

    public void Save(AppData data)
    {
        var json = JsonSerializer.Serialize(data, _jsonOptions);
        File.WriteAllText(_dataPath, json);
    }

    private AppData CreateSeedData()
    {
        var now = DateTime.UtcNow.Date;
        return new AppData
        {
            Users = new List<User>
            {
                new() { Id = "u1", Name = "Alice", Email = "alice@team.com", PasswordHash = Hash("alice123"), Color = "#7c3aed" },
                new() { Id = "u2", Name = "Bob",   Email = "bob@team.com",   PasswordHash = Hash("bob123"),   Color = "#059669" },
                new() { Id = "u3", Name = "Carol", Email = "carol@team.com", PasswordHash = Hash("carol123"), Color = "#dc2626" }
            },
            Tasks = new List<AppTask>
            {
                new()
                {
                    Id = "t1",
                    Title = "Weekly Sync",
                    Description = "Team weekly sync meeting",
                    DueDate = now,
                    AssignedTo = new List<string> { "u1", "u2", "u3" },
                    Status = "todo",
                    Priority = "medium",
                    CreatedBy = "u1",
                    Recurrence = new RecurrenceRule
                    {
                        IntervalDays = 7,
                        StartDate = now.AddDays(-(int)now.DayOfWeek + 1),
                        EndDate = null
                    }
                },
                new()
                {
                    Id = "t2",
                    Title = "Deploy v2",
                    Description = "Deploy version 2 to production",
                    DueDate = now.AddDays(3),
                    AssignedTo = new List<string> { "u2" },
                    Status = "todo",
                    Priority = "high",
                    CreatedBy = "u1",
                    Recurrence = null
                }
            },
            RecurrenceOverrides = new List<RecurrenceOverride>(),
            Sessions = new Dictionary<string, string>()
        };
    }

    public static string Hash(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
