
using EscapeProtocol.Algorithms;
using EscapeProtocol.Missions;
using EscapeProtocol.Services;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Permite exibir a interface HTML, CSS e JavaScript.
app.UseDefaultFiles();
app.UseStaticFiles();

var graph = Mission01.Create();
var game = new GameService(graph);
var dfs = new DepthFirstSearch(graph);

// Estado atual da missão.
app.MapGet("/api/status", () =>
{
    return Results.Ok(new
    {
        Mission = "Protocolo de Emergência",
        TotalRooms = graph.Rooms.Count,
        HasAccessCard = game.HasAccessCard,
        HasRestoredPower = game.HasRestoredPower,
        VisitedRooms = game.VisitedRooms
    });
});

// Executa a DFS e registra as salas alcançadas.
app.MapGet("/api/explore", () =>
{
    var events = dfs.Search("R01");

    game.RegisterExploration(dfs.VisitedRooms);

    return Results.Ok(new
    {
        VisitedRooms = dfs.VisitedRooms,
        Events = events
    });
});

// Tenta coletar o cartão.
app.MapPost("/api/objectives/card", () =>
{
    var success = game.CollectAccessCard();

    if (!success)
    {
        return Results.BadRequest(new
        {
            Message = "Você precisa explorar o Depósito (R05) primeiro."
        });
    }

    return Results.Ok(new
    {
        Message = "Cartão de acesso encontrado!",
        HasAccessCard = game.HasAccessCard
    });
});

// Tenta restaurar a energia.
app.MapPost("/api/objectives/power", () =>
{
    var success = game.RestorePower();

    if (!success)
    {
        return Results.BadRequest(new
        {
            Message = "Você precisa explorar a Sala de Energia (R07) primeiro."
        });
    }

    return Results.Ok(new
    {
        Message = "Energia restaurada!",
        HasRestoredPower = game.HasRestoredPower
    });
});

app.Run();
