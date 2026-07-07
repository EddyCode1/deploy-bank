namespace AuthServiceBanco.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailVerificationAsync(string email, string username, string token);
    Task SendPasswordResetAsync(string email, string username, string token);
    Task SendWelcomeEmailAsync(string email, string username);
    Task SendAdminNotificationAsync(string userEmail, string username, string name, string surname);
}