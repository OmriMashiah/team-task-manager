using backend.Services;

namespace backend.Middleware;

public class AuthMiddleware
{
    private readonly RequestDelegate _next;

    public AuthMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, DataService dataService)
    {
        var path = context.Request.Path.Value ?? string.Empty;
        if (path.StartsWith("/api/auth", StringComparison.OrdinalIgnoreCase))
        {
            await _next(context);
            return;
        }

        var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
        if (authHeader == null || !authHeader.StartsWith("Bearer "))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { error = "Unauthorized" });
            return;
        }

        var token = authHeader["Bearer ".Length..];
        var data = dataService.Load();
        if (!data.Sessions.TryGetValue(token, out var userId))
        {
            context.Response.StatusCode = 401;
            await context.Response.WriteAsJsonAsync(new { error = "Invalid token" });
            return;
        }

        context.Items["UserId"] = userId;
        await _next(context);
    }
}
