namespace backend.Models;

public class RecurrenceRule
{
    public int IntervalDays { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
}
