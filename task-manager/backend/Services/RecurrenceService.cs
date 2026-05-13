using backend.Models;

namespace backend.Services;

public class RecurrenceService
{
    public List<TaskInstance> ExpandInstances(AppTask task, DateTime from, DateTime to, List<RecurrenceOverride> overrides)
    {
        var results = new List<TaskInstance>();

        if (task.Recurrence == null)
        {
            var due = task.DueDate.Date;
            if (due >= from.Date && due <= to.Date)
                results.Add(ToInstance(task, due, false, overrides));
            return results;
        }

        var rule = task.Recurrence;
        var current = rule.StartDate.Date;
        var end = rule.EndDate?.Date ?? to.Date;

        while (current <= end && current <= to.Date)
        {
            if (current >= from.Date)
                results.Add(ToInstance(task, current, true, overrides));
            current = current.AddDays(rule.IntervalDays);
        }

        return results;
    }

    private static TaskInstance ToInstance(AppTask task, DateTime instanceDate, bool isRecurring, List<RecurrenceOverride> overrides)
    {
        var ov = overrides.FirstOrDefault(o =>
            o.TaskId == task.Id && o.InstanceDate.Date == instanceDate.Date);

        return new TaskInstance
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            DueDate = task.DueDate,
            AssignedTo = task.AssignedTo,
            Status = task.Status,
            Priority = task.Priority,
            CreatedBy = task.CreatedBy,
            Recurrence = task.Recurrence,
            IsRecurrenceInstance = isRecurring,
            InstanceDate = instanceDate,
            OverriddenStatus = ov?.Status
        };
    }
}
