

using GraphStructure = EscapeProtocol.Graph.Graph;
using EscapeProtocol.Models;

namespace EscapeProtocol.Algorithms;

public class DepthFirstSearch
{
    private readonly GraphStructure _graph;

    private readonly HashSet<string> _visitedRooms = new();
    private readonly List<string> _activeStack = new();
    private readonly List<SearchEvent> _events = new();

    public IReadOnlyCollection<string> VisitedRooms => _visitedRooms;
    public IReadOnlyList<string> ActiveStack => _activeStack;
    public IReadOnlyList<SearchEvent> Events => _events;

    public DepthFirstSearch(GraphStructure graph)
    {
        _graph = graph;
    }

    public IReadOnlyList<SearchEvent> Search(string startRoomId)
    {
        _visitedRooms.Clear();
        _activeStack.Clear();
        _events.Clear();

        foreach (var room in _graph.Rooms.Values)
        {
            room.IsVisited = false;
        }

        _graph.GetRoom(startRoomId);

        Visit(startRoomId);

        _events.Add(new SearchEvent(
            "SearchCompleted",
            startRoomId,
            "Busca em profundidade concluída.",
            _activeStack));

        return _events.AsReadOnly();
    }

    private void Visit(string roomId)
    {
        var room = _graph.GetRoom(roomId);

        _visitedRooms.Add(roomId);
        room.IsVisited = true;

        _activeStack.Add(roomId);

        _events.Add(new SearchEvent(
            "PushRoom",
            roomId,
            $"Sala {roomId} adicionada à pilha de recursão.",
            _activeStack));

        _events.Add(new SearchEvent(
            "VisitRoom",
            roomId,
            $"Visitando: {room.Name}.",
            _activeStack));

        var connections = _graph.GetConnections(roomId)
            .OrderBy(connection =>
                connection.RoomAId == roomId
                    ? connection.RoomBId
                    : connection.RoomAId);

        foreach (var connection in connections)
        {
            var neighborId = connection.RoomAId == roomId
                ? connection.RoomBId
                : connection.RoomAId;

            if (connection.IsBlocked)
            {
                _events.Add(new SearchEvent(
                    "BlockedConnection",
                    roomId,
                    $"Conexão entre {roomId} e {neighborId} está bloqueada.",
                    _activeStack));

                continue;
            }

            if (_visitedRooms.Contains(neighborId))
                continue;

            Visit(neighborId);
        }

        _activeStack.RemoveAt(_activeStack.Count - 1);

        _events.Add(new SearchEvent(
            "Backtrack",
            roomId,
            $"Retornando da sala {roomId}.",
            _activeStack));
    }
}
