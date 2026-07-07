using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Application.Services;
using AuthServiceBanco.Application.Validators;
using AuthServiceBanco.Domain.Entities;
using AuthServiceBanco.Domain.Interfaces;
using AuthServiceBanco.Persistence.Data;
using AuthServiceBanco.Persistence.Repositories;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace AuthServiceBanco.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? configuration["ConnectionStrings__DefaultConnection"]
            ?? configuration["DATABASE_URL"]
            ?? configuration["POSTGRES_URL"]
            ?? configuration["POSTGRESQL_URL"];

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("No database connection string configured. Set ConnectionStrings__DefaultConnection, DATABASE_URL, POSTGRES_URL or POSTGRESQL_URL.");
        }

        var effectiveConnectionString = BuildConnectionString(connectionString);

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(effectiveConnectionString)
                .UseSnakeCaseNamingConvention());
        
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<IPasswordHashService, PasswordHashService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<ICloudinaryService, CloudinaryService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();

        // Add FluentValidation
        services.AddFluentValidationAutoValidation();
        services.AddValidatorsFromAssemblyContaining<CreateClientDtoValidator>();

        services.AddHealthChecks();

        return services;
    }

    public static IServiceCollection AddApiDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        return services;
    }

    private static string BuildConnectionString(string connectionString)
    {
        if (Uri.TryCreate(connectionString, UriKind.Absolute, out var uri) &&
            (uri.Scheme == "postgres" || uri.Scheme == "postgresql"))
        {
            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = uri.IsDefaultPort ? 5432 : uri.Port,
                Database = uri.AbsolutePath.Trim('/'),
                SslMode = SslMode.Require,
                TrustServerCertificate = true
            };

            if (!string.IsNullOrWhiteSpace(uri.UserInfo))
            {
                var userInfo = uri.UserInfo.Split(':', 2);
                builder.Username = Uri.UnescapeDataString(userInfo[0]);
                if (userInfo.Length > 1)
                {
                    builder.Password = Uri.UnescapeDataString(userInfo[1]);
                }
            }

            return builder.ConnectionString;
        }

        return connectionString;
    }
}