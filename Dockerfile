# Base image for the build stage
FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build
WORKDIR /src

# Copy and restore dependencies
COPY *.sln .
COPY YourProjectName/*.csproj ./YourProjectName/
RUN dotnet restore

# Copy all project files and build
COPY . .
WORKDIR /src/YourProjectName
RUN dotnet publish -c Release -o /app/publish

# Final production image
FROM mcr.microsoft.com/dotnet/aspnet:6.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# This command must match the entry point of your .NET application
ENTRYPOINT ["dotnet", "AirsenseMonitor.dll"]
