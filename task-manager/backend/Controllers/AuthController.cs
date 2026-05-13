using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly DataService _dataService;

    public AuthController(DataService dataService)
    {
        _dataService = dataService;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        var data = _dataService.Load();
        var hash = DataService.Hash(req.Password);
        var user = data.Users.FirstOrDefault(u =>
            u.Email.Equals(req.Email, StringComparison.OrdinalIgnoreCase) &&
            u.PasswordHash == hash);

        if (user == null)
            return Unauthorized(new { error = "Invalid credentials" });

        var token = Guid.NewGuid().ToString("N");
        data.Sessions[token] = user.Id;
        _dataService.Save(data);

        return Ok(new
        {
            token,
            user = new { user.Id, user.Name, user.Email, user.Color }
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        var authHeader = Request.Headers.Authorization.FirstOrDefault();
        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            var token = authHeader["Bearer ".Length..];
            var data = _dataService.Load();
            data.Sessions.Remove(token);
            _dataService.Save(data);
        }
        return Ok();
    }

    public record LoginRequest(string Email, string Password);
}
