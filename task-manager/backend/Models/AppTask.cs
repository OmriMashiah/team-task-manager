namespace backend.Models;

public class AppTask
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime DueDate { get; set; }
    public List<string> AssignedTo { get; set; } = new();
    public string Status { get; set; } = "todo";
    public string Priority { get; set; } = "medium";
    public string CreatedBy { get; set; } = string.Empty;
    public RecurrenceRule? Recurrence { get; set; }
}
