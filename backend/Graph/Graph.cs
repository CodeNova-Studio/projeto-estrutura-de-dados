using EscapeProtocol.Models;

namespace EscapeProtocol.Graph;

public class Graph
{
    private readonly Dictionary<string, Room> _rooms = new();

    private readonly Dictionary<string, List<Connection>> _adjacencyList = new();

    public IReadOnlyDictionary<string, Room> Rooms => _rooms;

    public void AddRoom(Room room)
    {
        if (_rooms.ContainsKey(room.Id))
        {
            throw new InvalidOperationException(
                $"A sala {room.Id} já existe no grafo.");
        }

        _rooms.Add(room.Id, room);
        _adjacencyList.Add(room.Id, new List<Connection>());
    }

    public void AddConnection(Connection connection)
    {
        if (!_rooms.ContainsKey(connection.RoomAId) ||
            !_rooms.ContainsKey(connection.RoomBId))
        {
            throw new InvalidOperationException(
                "As duas salas precisam existir antes de criar uma conexão.");
        }

        if (_adjacencyList[connection.RoomAId]
            .Any(c => c.RoomBId == connection.RoomBId ||
                      c.RoomAId == connection.RoomBId))
        {
            throw new InvalidOperationException(
                "Essa conexão já existe.");
        }

        // O mesmo objeto representa a conexão nos dois sentidos.
        _adjacencyList[connection.RoomAId].Add(connection);
        _adjacencyList[connection.RoomBId].Add(connection);
    }

    public Room GetRoom(string roomId)
    {
        if (!_rooms.TryGetValue(roomId, out var room))
        {
            throw new KeyNotFoundException(
                $"A sala {roomId} não foi encontrada.");
        }

        return room;
    }

    public IReadOnlyList<Connection> GetConnections(string roomId)
    {
        if (!_adjacencyList.TryGetValue(roomId, out var connections))
        {
            throw new KeyNotFoundException(
                $"A sala {roomId} não foi encontrada no grafo.");
        }

        return connections.AsReadOnly();
    }

    public IEnumerable<Room> GetNeighbors(string roomId)
    {
        return GetConnections(roomId)
            .Where(connection => !connection.IsBlocked)
            .Select(connection =>
            {
                var neighborId = connection.RoomAId == roomId
                    ? connection.RoomBId
                    : connection.RoomAId;

                return GetRoom(neighborId);
            });
    }


public void UnlockConnection(string roomAId, string roomBId)
{
    if (!_adjacencyList.TryGetValue(roomAId, out var connections))
    {
        throw new KeyNotFoundException(
            $"A sala {roomAId} não foi encontrada.");
    }

    var connection = connections.FirstOrDefault(c =>
        (c.RoomAId == roomAId && c.RoomBId == roomBId) ||
        (c.RoomAId == roomBId && c.RoomBId == roomAId));

    if (connection == null)
    {
        throw new InvalidOperationException(
            $"Não existe conexão entre {roomAId} e {roomBId}.");
    }

    connection.IsBlocked = false;
}

}