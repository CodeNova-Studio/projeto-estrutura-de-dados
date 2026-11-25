
using GraphStructure = EscapeProtocol.Graph.Graph;
using EscapeProtocol.Models;

namespace EscapeProtocol.Missions;

public static class Mission01
{
    public static GraphStructure Create()
    {
        var graph = new GraphStructure();

        // 1. Criar as 12 salas da missão.
        graph.AddRoom(new Room(
            "R01", "Recepção",
            "Entrada principal do Complexo de Pesquisa Orion."));

        graph.AddRoom(new Room(
            "R02", "Segurança",
            "Sala de monitoramento e controle de acesso."));

        graph.AddRoom(new Room(
            "R03", "Corredor Norte",
            "Corredor que conecta a recepção ao laboratório."));

        graph.AddRoom(new Room(
            "R04", "Arquivo",
            "Local onde documentos da instalação são armazenados."));

        graph.AddRoom(new Room(
            "R05", "Depósito",
            "Depósito de materiais e equipamentos."));

        graph.AddRoom(new Room(
            "R06", "Laboratório",
            "Laboratório de pesquisa abandonado."));

        graph.AddRoom(new Room(
            "R07", "Energia",
            "Sala do gerador principal da instalação."));

        graph.AddRoom(new Room(
            "R08", "Oficina",
            "Área de manutenção de equipamentos."));

        graph.AddRoom(new Room(
            "R09", "Ala Médica",
            "Setor médico da instalação."));

        graph.AddRoom(new Room(
            "R10", "Controle Central",
            "Central de operações e controle da instalação."));

        graph.AddRoom(new Room(
            "R11", "Câmara de Contenção",
            "Área de contenção de experimentos perigosos."));

        graph.AddRoom(new Room(
            "R12", "Saída",
            "Saída de emergência do complexo."));

        // 2. Criar as 14 conexões entre as salas.
        graph.AddConnection(new Connection("R01", "R02"));
        graph.AddConnection(new Connection("R01", "R03"));

        graph.AddConnection(new Connection("R02", "R04"));
        graph.AddConnection(new Connection("R02", "R05"));

        graph.AddConnection(new Connection("R03", "R06"));

        graph.AddConnection(new Connection("R04", "R07"));
        graph.AddConnection(new Connection("R05", "R07"));

        graph.AddConnection(new Connection("R06", "R08"));

        graph.AddConnection(new Connection("R07", "R08"));
        graph.AddConnection(new Connection("R07", "R09"));

        graph.AddConnection(new Connection("R08", "R10"));
        graph.AddConnection(new Connection("R09", "R10"));

        // 3. Portas inicialmente bloqueadas.
        graph.AddConnection(new Connection(
            "R10", "R11",
            isBlocked: true,
            requiredCondition: "Energia restaurada"));

        graph.AddConnection(new Connection(
            "R11", "R12",
            isBlocked: true,
            requiredItem: "Cartão de acesso",
            requiredCondition: "Energia restaurada"));

        return graph;
    }
}
