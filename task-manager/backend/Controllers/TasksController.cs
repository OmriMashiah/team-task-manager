using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/tasks")]
public class TasksController : ControllerBase
{
    private readonly DataService _dataService;
    private readonly RecurrenceService _recurrenceService;

    public TasksController(DataService dataService, RecurrenceService recurrenceService)
    {
        _dataService = dataService;
        _recurrenceService = recurrenceService;
    }

    [HttpGet]
    public IActionResult GetTasks([FromQuery] DateTime from, [FromQuery] DateTime to)
    {
        var data = _dataService.Load();
        var instances = data.Tasks
            .SelectMany(t => _recurrenceService.ExpandInstances(t, from, to, data.RecurrenceOverrides))
            .OrderBy(t => t.InstanceDate)
            .ToList();
        return Ok(instances);
    }

    [HttpPost]
    public IActionResult CreateTask([FromBody] AppTask task)
    {
        var userId = (string?)HttpContext.Items["UserId"] ?? string.Empty;
        task.Id = Guid.NewGuid().ToString("N");
        task.CreatedBy = userId;

        var data = _dataService.Load();
        data.Tasks.Add(task);
        _dataService.Save(data);
        return Ok(task);
    }

    [HttpPut("{id}")]
    public IActionResult UpdateTask(string id, [FromBody] AppTask task)
    {
        var data = _dataService.Load();
        var idx = data.Tasks.FindIndex(t => t.Id == id);
        if (idx == -1) return NotFound();

        task.Id = id;
        task.CreatedBy = data.Tasks[idx].CreatedBy;
        data.Tasks[idx] = task;
        _dataService.Save(data);
        return Ok(task);
    }

    [HttpDelete("{id}")]
    public IActionResult DeleteTask(string id)
    {
        var data = _dataService.Load();
        var removed = data.Tasks.RemoveAll(t => t.Id == id);
        if (removed == 0) return NotFound();
        data.RecurrenceOverrides.RemoveAll(o => o.TaskId == id);
        _dataService.Save(data);
        return Ok();
    }

    [HttpPatch("{id}/status")]
    public IActionResult PatchStatus(string id, [FromBody] PatchStatusRequest req)
    {
        var data = _dataService.Load();
        var task = data.Tasks.FirstOrDefault(t => t.Id == id);
        if (task == null) return NotFound();

        if (task.Recurrence != null && req.InstanceDate.HasValue)
        {
            var instanceDate = req.InstanceDate.Value.Date;
            var existing = data.RecurrenceOverrides.FirstOrDefault(o =>
                o.TaskId == id && o.InstanceDate.Date == instanceDate);

            if (existing != null)
                existing.Status = req.Status;
            else
                data.RecurrenceOverrides.Add(new RecurrenceOverride { TaskId = id, InstanceDate = instanceDate, Status = req.Status });
        }
        else
        {
            task.Status = req.Status;
        }

        _dataService.Save(data);
        return Ok();
    }

    public record PatchStatusRequest(string Status, DateTime? InstanceDate);
}
