namespace EscapeProtocol.Models;

public class Connection
{
    public string RoomAId { get; set; }
    public string RoomBId { get; set; }

    public bool IsBlocked { get; set; }
    public string? RequiredItem { get; set; }
    public string? RequiredCondition { get; set; }

    public Connection(
        string roomAId,
        string roomBId,
        bool isBlocked = false,
        string? requiredItem = null,
        string? requiredCondition = null)
    {
        RoomAId = roomAId;
        RoomBId = roomBId;
        IsBlocked = isBlocked;
        RequiredItem = requiredItem;
        RequiredCondition = requiredCondition;
    }
}
