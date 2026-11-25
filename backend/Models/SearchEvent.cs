namespace EscapeProtocol.Models;

public class SearchEvent
{
    public string Type { get; set; }
    public string RoomId { get; set; }
    public string Message { get; set; }

    public List<string> ActiveStack { get; set; }

    public SearchEvent(
        string type,
        string roomId,
        string message,
        IEnumerable<string>? activeStack = null)
    {
        Type = type;
        RoomId = roomId;
        Message = message;
        ActiveStack = activeStack?.ToList() ?? new List<string>();
    }
}
