using Microsoft.AspNetCore.DataProtection;
using System.Text.RegularExpressions;

namespace AuthServiceBanco.Api.Extensions;

public static class SecurityExtensions
{
    private static readonly string[] DefaultAllowedOrigins =
    [
        "http://localhost:3000",
        "https://localhost:3001",
        // Puertos típicos de Vite en desarrollo (frontend React)
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175"
    ];
    private static readonly string[] DefaultAdminOrigins = ["https://admin.localhost"];
    private static readonly string[] AllowedHttpMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
    private static readonly string[] AdminHttpMethods = ["GET", "POST", "PUT", "DELETE"];
    private static readonly string[] AdminAllowedHeaders = ["Content-Type", "Authorization"];
    public static IServiceCollection AddSecurityPolicies(this IServiceCollection services, IConfiguration configuration)
    {
        // Detectar entorno desde variables de entorno (Development por defecto)
        var aspNetEnv = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")
                        ?? Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")
                        ?? "Development";
        var isDevelopment = string.Equals(aspNetEnv, "Development", StringComparison.OrdinalIgnoreCase);

        var allowedOrigins = GetConfiguredOrigins(configuration, "Security:AllowedOrigins", DefaultAllowedOrigins, "FRONTEND_URL", "VERCEL_URL", "CORS_ALLOWED_ORIGINS");
        var adminOrigins = GetConfiguredOrigins(configuration, "Security:AdminAllowedOrigins", DefaultAdminOrigins, "FRONTEND_URL", "VERCEL_URL", "CORS_ALLOWED_ORIGINS");

        // Configurar CORS
        services.AddCors(options =>
        {
            options.AddPolicy("DefaultCorsPolicy", builder =>
            {
                if (isDevelopment)
                {
                    // En desarrollo: permitir cualquier origen localhost / 127.0.0.1 (cualquier puerto)
                    // Nota: con AllowCredentials no se puede usar AllowAnyOrigin, por eso usamos SetIsOriginAllowed
                    builder.SetIsOriginAllowed(origin =>
                        {
                            if (string.IsNullOrWhiteSpace(origin)) return false;
                            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri)) return false;
                            return uri.Host == "localhost" || uri.Host == "127.0.0.1";
                        })
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                        .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
                }
                else
                {
                    builder.SetIsOriginAllowed(origin =>
                        {
                            if (string.IsNullOrWhiteSpace(origin)) return false;
                            if (!Uri.TryCreate(origin, UriKind.Absolute, out _)) return false;
                            return allowedOrigins.Any(allowedOrigin => MatchesOrigin(allowedOrigin, origin));
                        })
                        .AllowAnyHeader()
                        .WithMethods(AllowedHttpMethods)
                        .AllowCredentials()
                        .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
                }
            });

            // Política restrictiva para endpoints administrativos
            options.AddPolicy("AdminCorsPolicy", builder =>
            {
                builder.SetIsOriginAllowed(origin =>
                    {
                        if (string.IsNullOrWhiteSpace(origin)) return false;
                        if (!Uri.TryCreate(origin, UriKind.Absolute, out _)) return false;
                        return adminOrigins.Any(allowedOrigin => MatchesOrigin(allowedOrigin, origin));
                    })
                    .WithHeaders(AdminAllowedHeaders)
                    .WithMethods(AdminHttpMethods)
                    .AllowCredentials();
            });
        });

        // Configurar Data Protection
        var keysDirectory = new DirectoryInfo("./keys");
        if (!keysDirectory.Exists)
        {
            keysDirectory.Create();
        }

        var dataProtectionBuilder = services.AddDataProtection()
                .PersistKeysToFileSystem(keysDirectory)
                .SetApplicationName("AuthDotnetApi")
                .SetDefaultKeyLifetime(TimeSpan.FromDays(90));

        // En producción, configurar encriptación con certificado
        var environment = services.BuildServiceProvider().GetRequiredService<IWebHostEnvironment>();
        if (environment.IsProduction())
        {
            // En producción deberías usar un certificado real
            // dataProtectionBuilder.ProtectKeysWithCertificate("thumbprint");
            if (OperatingSystem.IsWindows())
            {
                dataProtectionBuilder.ProtectKeysWithDpapi();
            }
            // En Linux/macOS en producción, usar certificados o Azure Key Vault
        }
        else
        {
            // En desarrollo, usar DPAPI (solo Windows) o sin encriptación
            if (OperatingSystem.IsWindows())
            {
                dataProtectionBuilder.ProtectKeysWithDpapi();
            }
            // En Linux/macOS en desarrollo, las claves no se encriptan (solo para desarrollo)
        }

        // Configurar Antiforgery (CSRF Protection)
        services.AddAntiforgery(options =>
        {
            options.HeaderName = "X-CSRF-TOKEN";
            options.SuppressXFrameOptionsHeader = false;
            options.Cookie.Name = "__RequestVerificationToken";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
            options.Cookie.SameSite = SameSiteMode.Strict;
        });

        return services;
    }

    public static IServiceCollection AddSecurityOptions(this IServiceCollection services)
    {
        services.Configure<CookiePolicyOptions>(options =>
        {
            options.CheckConsentNeeded = context => true;
            options.MinimumSameSitePolicy = SameSiteMode.Strict;
            options.HttpOnly = Microsoft.AspNetCore.CookiePolicy.HttpOnlyPolicy.Always;
            options.Secure = CookieSecurePolicy.SameAsRequest;
        });

        return services;
    }

    private static string[] GetConfiguredOrigins(IConfiguration configuration, string sectionName, string[] defaultOrigins, params string[] additionalKeys)
    {
        var origins = new List<string>(defaultOrigins);

        if (configuration.GetSection(sectionName).Get<string[]>() is { Length: > 0 } configuredOrigins)
        {
            origins.AddRange(configuredOrigins);
        }

        foreach (var key in additionalKeys)
        {
            // Prefer environment variables first (Render sets plain env vars)
            var envValue = Environment.GetEnvironmentVariable(key);
            var value = !string.IsNullOrWhiteSpace(envValue) ? envValue : configuration[key];
            if (string.IsNullOrWhiteSpace(value))
            {
                continue;
            }

            foreach (var origin in value.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
            {
                if (!string.IsNullOrWhiteSpace(origin))
                {
                    origins.Add(origin);
                }
            }
        }

        return origins.Distinct(StringComparer.OrdinalIgnoreCase).ToArray();
    }

    private static bool MatchesOrigin(string allowedOrigin, string requestOrigin)
    {
        if (string.IsNullOrWhiteSpace(allowedOrigin) || string.IsNullOrWhiteSpace(requestOrigin))
        {
            return false;
        }

        if (allowedOrigin.Contains('*'))
        {
            var regexPattern = Regex.Escape(allowedOrigin).Replace(@"\*", ".*");
            return Regex.IsMatch(requestOrigin, $"^{regexPattern}$", RegexOptions.IgnoreCase);
        }

        if (!allowedOrigin.Contains("://", StringComparison.Ordinal))
        {
            return requestOrigin.Equals(allowedOrigin, StringComparison.OrdinalIgnoreCase)
                || requestOrigin.EndsWith($".{allowedOrigin}", StringComparison.OrdinalIgnoreCase);
        }

        return requestOrigin.Equals(allowedOrigin, StringComparison.OrdinalIgnoreCase);
    }
}

