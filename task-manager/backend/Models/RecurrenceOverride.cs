namespace backend.Models;

public class RecurrenceOverride
{
    public string TaskId { get; set; } = string.Empty;
    public DateTime InstanceDate { get; set; }
    public string Status { get; set; } = string.Empty;
}
