
using GraphStructure = EscapeProtocol.Graph.Graph;

namespace EscapeProtocol.Services;

public class GameService
{
    private readonly GraphStructure _graph;

    private readonly HashSet<string> _visitedRooms = new();

    public bool HasAccessCard { get; private set; }
    public bool HasRestoredPower { get; private set; }

    public IReadOnlyCollection<string> VisitedRooms => _visitedRooms;

    public GameService(GraphStructure graph)
    {
        _graph = graph;
    }

    // Registra as salas alcançadas pela exploração.
    public void RegisterExploration(IEnumerable<string> roomIds)
    {
        foreach (var roomId in roomIds)
        {
            _visitedRooms.Add(roomId);
        }
    }

    // O cartão só pode ser coletado após alcançar R05.
    public bool CollectAccessCard()
    {
        if (!_visitedRooms.Contains("R05"))
        {
            return false;
        }

        HasAccessCard = true;
        UpdateConnections();

        return true;
    }

    // A energia só pode ser restaurada após alcançar R07.
    public bool RestorePower()
    {
        if (!_visitedRooms.Contains("R07"))
        {
            return false;
        }

        HasRestoredPower = true;
        UpdateConnections();

        return true;
    }

    private void UpdateConnections()
    {
        if (HasRestoredPower)
        {
            _graph.UnlockConnection("R10", "R11");
        }

        if (HasAccessCard && HasRestoredPower)
        {
            _graph.UnlockConnection("R11", "R12");
        }
    }
}
