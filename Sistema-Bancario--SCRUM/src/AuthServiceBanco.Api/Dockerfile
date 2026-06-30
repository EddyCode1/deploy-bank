FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Directory.Build.props .
COPY src/AuthServiceBanco.Domain/AuthServiceBanco.Domain.csproj src/AuthServiceBanco.Domain/
COPY src/AuthServiceBanco.Application/AuthServiceBanco.Application.csproj src/AuthServiceBanco.Application/
COPY src/AuthServiceBanco.Persistence/AuthServiceBanco.Persistence.csproj src/AuthServiceBanco.Persistence/
COPY src/AuthServiceBanco.Api/AuthServiceBanco.Api.csproj src/AuthServiceBanco.Api/

RUN dotnet restore src/AuthServiceBanco.Api/AuthServiceBanco.Api.csproj

COPY . .
WORKDIR /src/src/AuthServiceBanco.Api
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
EXPOSE 5025

ENV ASPNETCORE_URLS=http://0.0.0.0:5025
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "AuthServiceBanco.Api.dll"]
