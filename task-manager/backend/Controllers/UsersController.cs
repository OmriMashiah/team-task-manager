using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly DataService _dataService;

    public UsersController(DataService dataService)
    {
        _dataService = dataService;
    }

    [HttpGet]
    public IActionResult GetUsers()
    {
        var data = _dataService.Load();
        var users = data.Users.Select(u => new { u.Id, u.Name, u.Email, u.Color });
        return Ok(users);
    }
}
