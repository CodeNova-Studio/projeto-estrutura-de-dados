namespace EscapeProtocol.Models;

public class Room
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Description { get; set; }

    public bool IsVisited { get; set; }
    public bool IsUnlocked { get; set; }

    public Room(
        string id,
        string name,
        string description,
        bool isUnlocked = true)
    {
        Id = id;
        Name = name;
        Description = description;
        IsUnlocked = isUnlocked;
        IsVisited = false;
    }
}
