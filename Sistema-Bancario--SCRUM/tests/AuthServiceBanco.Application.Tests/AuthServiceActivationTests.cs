using AuthServiceBanco.Application.Services;
using AuthServiceBanco.Application.Interfaces;
using AuthServiceBanco.Domain.Entities;
using AuthServiceBanco.Domain.Enums;
using AuthServiceBanco.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Moq;

namespace AuthServiceBanco.Application.Tests;

public class AuthServiceActivationTests
{
    [Fact]
    public async Task VerifyEmail_ShouldActivateUserAccountState()
    {
        var userRepository = new Mock<IUserRepository>();
        var roleRepository = new Mock<IRoleRepository>();
        var passwordHashService = new Mock<IPasswordHashService>();
        var jwtTokenService = new Mock<IJwtTokenService>();
        var cloudinaryService = new Mock<ICloudinaryService>();
        var emailService = new Mock<IEmailService>();
        var configuration = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["JwtSettings:ExpiryInMinutes"] = "30"
        }).Build();
        var logger = new Mock<ILogger<AuthService>>();

        var user = new User
        {
            Id = "user-1",
            Username = "testuser",
            Email = "test@example.com",
            Status = false,
            AccountState = AccountState.PENDIENTE,
            UserEmail = new UserEmail
            {
                Id = "email-1",
                UserId = "user-1",
                EmailVerified = false,
                EmailVerificationToken = "token",
                EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(1)
            }
        };

        userRepository.Setup(r => r.GetByEmailVerificationTokenAsync("token"))
            .ReturnsAsync(user);
        userRepository.Setup(r => r.UpdateAsync(It.IsAny<User>()))
            .ReturnsAsync((User updatedUser) => updatedUser);

        var service = new AuthService(
            userRepository.Object,
            roleRepository.Object,
            passwordHashService.Object,
            jwtTokenService.Object,
            cloudinaryService.Object,
            emailService.Object,
            configuration,
            logger.Object);

        var result = await service.VerifyEmailAsync(new AuthServiceBanco.Application.DTOs.Email.VerifyEmailDto { Token = "token" });

        Assert.True(result.Success);
        Assert.Equal(AccountState.ACTIVA, user.AccountState);
        Assert.True(user.Status);
        Assert.True(user.UserEmail?.EmailVerified);
    }
}
