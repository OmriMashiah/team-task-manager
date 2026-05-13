namespace backend.Models;

public class AppData
{
    public List<User> Users { get; set; } = new();
    public List<AppTask> Tasks { get; set; } = new();
    public List<RecurrenceOverride> RecurrenceOverrides { get; set; } = new();
    public Dictionary<string, string> Sessions { get; set; } = new();
}
