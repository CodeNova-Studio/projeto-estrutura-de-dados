
// ============================================================
// ESCAPE PROTOCOL — INTERFACE E LÓGICA DO JOGO
// ============================================================


// ------------------------------------------------------------
// 1. CONFIGURAÇÃO DAS SALAS
// ------------------------------------------------------------

const roomNames = {
    R01: "Recepção",
    R02: "Segurança",
    R03: "Corredor Norte",
    R04: "Arquivo",
    R05: "Depósito",
    R06: "Laboratório",
    R07: "Energia",
    R08: "Oficina",
    R09: "Ala Médica",
    R10: "Controle Central",
    R11: "Câmara de Contenção",
    R12: "Saída"
};

// Identidade visual de cada sala.
const roomTypes = {
    R01: "reception",
    R02: "security",
    R03: "corridor",
    R04: "archive",
    R05: "storage",
    R06: "laboratory",
    R07: "power",
    R08: "workshop",
    R09: "medical",
    R10: "control",
    R11: "containment",
    R12: "exit"
};


// Posições das salas no mapa.
const roomPositions = {
    R01: [8, 45],
    R02: [25, 20],
    R03: [25, 72],
    R04: [43, 8],
    R05: [43, 35],
    R06: [43, 82],
    R07: [60, 25],
    R08: [60, 70],
    R09: [77, 12],
    R10: [77, 48],
    R11: [93, 48],
    R12: [93, 84]
};


// Conexões do grafo.
const connections = [
    ["R01", "R02"],
    ["R01", "R03"],
    ["R02", "R04"],
    ["R02", "R05"],
    ["R03", "R06"],
    ["R04", "R07"],
    ["R05", "R07"],
    ["R06", "R08"],
    ["R07", "R08"],
    ["R07", "R09"],
    ["R08", "R10"],
    ["R09", "R10"],
    ["R10", "R11"],
    ["R11", "R12"]
];


// ------------------------------------------------------------
// 2. ESTADO DA MISSÃO
// ------------------------------------------------------------

const visitedRooms = new Set();

let isExploring = false;

let hasAccessCard = false;
let hasRestoredPower = false;

let isCollectingCard = false;
let isRestoringPower = false;


// ------------------------------------------------------------
// 3. ELEMENTOS DA INTERFACE
// ------------------------------------------------------------

const mapElement = document.getElementById("room-map");

const logElement = document.getElementById("event-log");

const exploreButton = document.getElementById("explore-button");

const collectCardButton = document.getElementById(
    "collect-card-button"
);

const restorePowerButton = document.getElementById(
    "restore-power-button"
);

const stackElement = document.getElementById("recursion-stack");

const stackCounter = document.getElementById("stack-counter");


// ------------------------------------------------------------
// 4. CRIAÇÃO DAS PLANTAS BAIXAS DAS SALAS
// ------------------------------------------------------------

function createRoomPlan(id) {
    const plan = document.createElement("div");

    plan.className = `room-floorplan ${roomTypes[id]}`;

    plan.dataset.room = id;

    plan.setAttribute("aria-hidden", "true");

    // Porta da sala.
    const door = document.createElement("span");

    door.className = "room-door";

    // Primeiro objeto interno.
    const objectA = document.createElement("span");

    objectA.className = "room-object object-one";

    // Segundo objeto interno.
    const objectB = document.createElement("span");

    objectB.className = "room-object object-two";

    plan.append(
        door,
        objectA,
        objectB
    );

    return plan;
}


// ------------------------------------------------------------
// 5. DESENHO DOS CORREDORES
// ------------------------------------------------------------

function createCorridor(svgNS, roomA, roomB) {
    const [x1, y1] = roomPositions[roomA];

    const [x2, y2] = roomPositions[roomB];

    const isPowerGate =
        roomA === "R10" && roomB === "R11";

    const isExitGate =
        roomA === "R11" && roomB === "R12";

    const blocked =
        (isPowerGate && !hasRestoredPower) ||
        (isExitGate && !(hasAccessCard && hasRestoredPower));

    // Grupo que contém as camadas do corredor.
    const corridor = document.createElementNS(
        svgNS,
        "g"
    );

    corridor.classList.add("corridor");

    if (blocked) {
        corridor.classList.add("corridor-blocked");

    } else if (isPowerGate || isExitGate) {
        corridor.classList.add("corridor-unlocked");

    } else {
        corridor.classList.add("corridor-normal");
    }

    // Camada 1: paredes externas.
    const wall = document.createElementNS(
        svgNS,
        "line"
    );

    wall.setAttribute("x1", x1);
    wall.setAttribute("y1", y1);
    wall.setAttribute("x2", x2);
    wall.setAttribute("y2", y2);

    wall.classList.add("corridor-wall");

    // Camada 2: piso interno.
    const floor = document.createElementNS(
        svgNS,
        "line"
    );

    floor.setAttribute("x1", x1);
    floor.setAttribute("y1", y1);
    floor.setAttribute("x2", x2);
    floor.setAttribute("y2", y2);

    floor.classList.add("corridor-floor");

    // Camada 3: iluminação central.
    const light = document.createElementNS(
        svgNS,
        "line"
    );

    light.setAttribute("x1", x1);
    light.setAttribute("y1", y1);
    light.setAttribute("x2", x2);
    light.setAttribute("y2", y2);

    light.classList.add("corridor-light");

    corridor.append(
        wall,
        floor,
        light
    );

    return corridor;
}


// ------------------------------------------------------------
// 6. CRIAÇÃO DOS MÓDULOS DAS SALAS
// ------------------------------------------------------------

function createRoomNode(id, position) {
    const room = document.createElement("button");

    room.className = "room-node";

    room.dataset.roomId = id;

    room.type = "button";

    room.style.left = `${position[0]}%`;

    room.style.top = `${position[1]}%`;

    room.setAttribute(
        "aria-label",
        `${id} - ${roomNames[id]}`
    );

    // Sala já visitada.
    if (visitedRooms.has(id)) {
        room.classList.add("visited");
    }

    // Câmara de contenção sem energia.
    if (id === "R11" && !hasRestoredPower) {
        room.classList.add("without-power");
    }

    // Saída ainda bloqueada.
    if (
        id === "R12" &&
        !(hasAccessCard && hasRestoredPower)
    ) {
        room.classList.add("locked");
    }

    // Planta baixa.
    const plan = createRoomPlan(id);

    // Identificação da sala.
    const roomId = document.createElement("span");

    roomId.className = "room-id";

    roomId.textContent = id;

    // Nome da sala.
    const roomName = document.createElement("span");

    roomName.className = "room-name";

    roomName.textContent = roomNames[id];

    room.append(
        plan,
        roomId,
        roomName
    );

    room.title = `${id} — ${roomNames[id]}`;

    return room;
}


// ------------------------------------------------------------
// 7. DESENHO COMPLETO DO MAPA
// ------------------------------------------------------------

function renderMap() {
    if (!mapElement) return;

    // Limpa o mapa anterior.
    mapElement.innerHTML = "";

    const svgNS = "http://www.w3.org/2000/svg";

    // Cria o SVG dos corredores.
    const svg = document.createElementNS(
        svgNS,
        "svg"
    );

    svg.setAttribute("viewBox", "0 0 100 100");

    svg.setAttribute("preserveAspectRatio", "none");

    svg.classList.add("connections");

    // Desenha todas as conexões.
    connections.forEach(([roomA, roomB]) => {
        const corridor = createCorridor(
            svgNS,
            roomA,
            roomB
        );

        svg.appendChild(corridor);
    });

    // Adiciona os corredores ao mapa.
    mapElement.appendChild(svg);

    // Desenha os 12 módulos das salas.
    Object.entries(roomPositions).forEach(([id, position]) => {
        const room = createRoomNode(id, position);

        mapElement.appendChild(room);
    });

    // Atualiza o contador.
    updateCounter();
}


// ------------------------------------------------------------
// 8. CONTADOR DE SALAS
// ------------------------------------------------------------

function updateCounter() {
    const counter = document.getElementById("room-counter");

    if (!counter) return;

    counter.textContent = `${visitedRooms.size} / 12 SALAS`;
}


// ------------------------------------------------------------
// 9. PILHA DE RECURSÃO
// ------------------------------------------------------------

function renderStack(stack = [], completed = false) {
    if (!stackElement) return;

    stackElement.innerHTML = "";

    const currentStack = Array.isArray(stack)
        ? stack
        : [];

    if (stackCounter) {
        stackCounter.textContent =
            `${currentStack.length} NÍVEIS`;
    }

    // Pilha vazia.
    if (currentStack.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "stack-empty";

        emptyMessage.textContent = completed
            ? "Pilha vazia — busca concluída."
            : "Aguardando execução da DFS...";

        stackElement.appendChild(emptyMessage);

        return;
    }

    // Exibe primeiro o topo da pilha.
    const reversedStack = [...currentStack].reverse();

    reversedStack.forEach((roomId, index) => {
        const item = document.createElement("div");

        item.className = "stack-item";

        if (index === 0) {
            item.classList.add("current");
        }

        const roomLabel = document.createElement("span");

        roomLabel.textContent =
            `${roomId} — ${roomNames[roomId] || "Sala"}`;

        const position = document.createElement("small");

        position.textContent = index === 0
            ? "TOPO"
            : `NÍVEL ${currentStack.length - index}`;

        item.append(
            roomLabel,
            position
        );

        stackElement.appendChild(item);
    });

    stackElement.scrollTop = 0;
}


// ------------------------------------------------------------
// 10. REGISTRO DE EVENTOS
// ------------------------------------------------------------

function addLog(message, type = "SYSTEM") {
    if (!logElement) return;

    const entry = document.createElement("p");

    entry.className = "log-entry";

    const label = document.createElement("span");

    label.textContent = `[${type}] `;

    entry.appendChild(label);

    entry.appendChild(
        document.createTextNode(message)
    );

    logElement.appendChild(entry);

    logElement.scrollTop = logElement.scrollHeight;
}


// ------------------------------------------------------------
// 11. ATUALIZAÇÃO DOS OBJETIVOS
// ------------------------------------------------------------

function updateObjective(id, completed) {
    const element = document.getElementById(id);

    if (!element) return;

    element.classList.toggle(
        "completed",
        completed
    );

    const state = element.querySelector(
        ".objective-state"
    );

    if (state) {
        state.textContent = completed
            ? "CONCLUÍDO"
            : "PENDENTE";
    }
}


// ------------------------------------------------------------
// 12. CONSULTA DO ESTADO DA MISSÃO
// ------------------------------------------------------------

async function updateStatus() {
    const response = await fetch("/api/status");

    if (!response.ok) {
        throw new Error(
            "Não foi possível consultar o estado da missão."
        );
    }

    const data = await response.json();

    hasAccessCard = data.hasAccessCard;

    hasRestoredPower = data.hasRestoredPower;

    // Atualiza os objetivos.
    updateObjective(
        "card-objective",
        hasAccessCard
    );

    updateObjective(
        "power-objective",
        hasRestoredPower
    );

    // Atualiza os textos de status.
    const cardStatus = document.getElementById(
        "card-status"
    );

    const powerStatus = document.getElementById(
        "power-status"
    );

    if (cardStatus) {
        cardStatus.textContent = hasAccessCard
            ? "Encontrado"
            : "Não encontrado";
    }

    if (powerStatus) {
        powerStatus.textContent = hasRestoredPower
            ? "Restaurada"
            : "Desligada";
    }

    // Atualiza os botões.
    if (collectCardButton) {
        collectCardButton.disabled = hasAccessCard;

        collectCardButton.textContent = hasAccessCard
            ? "✓ CARTÃO COLETADO"
            : "◇ COLETAR CARTÃO";
    }

    if (restorePowerButton) {
        restorePowerButton.disabled = hasRestoredPower;

        restorePowerButton.textContent = hasRestoredPower
            ? "✓ ENERGIA RESTAURADA"
            : "ϟ RESTAURAR ENERGIA";
    }

    // Atualiza as conexões e as salas.
    renderMap();
}


// ------------------------------------------------------------
// 13. EXPLORAÇÃO COM BUSCA EM PROFUNDIDADE
// ------------------------------------------------------------

async function explore() {
    if (isExploring) return;

    isExploring = true;

    if (exploreButton) {
        exploreButton.disabled = true;

        exploreButton.textContent = "EXPLORANDO...";
    }

    // Reinicia as salas visitadas na interface.
    visitedRooms.clear();

    renderMap();

    renderStack();

    if (logElement) {
        logElement.innerHTML = "";
    }

    addLog(
        "Inicializando busca em profundidade.",
        "DFS"
    );

    try {
        const response = await fetch("/api/explore");

        if (!response.ok) {
            throw new Error(
                "Falha ao executar a DFS."
            );
        }

        const data = await response.json();

        for (const event of data.events) {

            // Marca a sala como visitada.
            if (event.type === "VisitRoom") {
    visitedRooms.add(event.roomId);

    renderMap();
}

            // Atualiza a pilha de recursão.
            renderStack(
                event.activeStack,
                event.type === "SearchCompleted"
            );

            // Registra o evento.
            addLog(
                event.message,
                event.type
            );

            // Pequeno intervalo para acompanhar a busca.
            await new Promise(resolve =>
                setTimeout(resolve, 350)
            );
        }

        await updateStatus();

        addLog(
            "Exploração concluída.",
            "SYSTEM"
        );

    } catch (error) {
        addLog(
            error.message,
            "ERROR"
        );

    } finally {
        isExploring = false;

        if (exploreButton) {
            exploreButton.disabled = false;

            exploreButton.textContent =
                "✦ INICIAR EXPLORAÇÃO DFS";
        }
    }
}


// ------------------------------------------------------------
// 14. COLETA DO CARTÃO DE ACESSO
// ------------------------------------------------------------

async function collectCard() {
    if (isCollectingCard || hasAccessCard) return;

    isCollectingCard = true;

    if (collectCardButton) {
        collectCardButton.disabled = true;
    }

    try {
        const response = await fetch(
            "/api/objectives/card",
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            addLog(
                data.message,
                "WARNING"
            );

            return;
        }

        addLog(
            data.message,
            "OBJECTIVE"
        );

        await updateStatus();

    } catch (error) {
        addLog(
            "Erro ao coletar o cartão: " + error.message,
            "ERROR"
        );

    } finally {
        isCollectingCard = false;

        if (collectCardButton && !hasAccessCard) {
            collectCardButton.disabled = false;
        }
    }
}


// ------------------------------------------------------------
// 15. RESTAURAÇÃO DA ENERGIA
// ------------------------------------------------------------

async function restorePower() {
    if (isRestoringPower || hasRestoredPower) return;

    isRestoringPower = true;

    if (restorePowerButton) {
        restorePowerButton.disabled = true;
    }

    try {
        const response = await fetch(
            "/api/objectives/power",
            {
                method: "POST"
            }
        );

        const data = await response.json();

        if (!response.ok) {
            addLog(
                data.message,
                "WARNING"
            );

            return;
        }

        addLog(
            data.message,
            "OBJECTIVE"
        );

        await updateStatus();

    } catch (error) {
        addLog(
            "Erro ao restaurar a energia: " + error.message,
            "ERROR"
        );

    } finally {
        isRestoringPower = false;

        if (restorePowerButton && !hasRestoredPower) {
            restorePowerButton.disabled = false;
        }
    }
}


// ------------------------------------------------------------
// 16. INICIALIZAÇÃO DO JOGO
// ------------------------------------------------------------

async function initializeGame() {
    renderMap();

    renderStack();

    try {
        await updateStatus();

        addLog(
            "Sistema conectado ao Complexo Orion.",
            "SYSTEM"
        );

    } catch (error) {
        addLog(
            error.message,
            "ERROR"
        );
    }
}


// ------------------------------------------------------------
// 17. EVENTOS DOS BOTÕES
// ------------------------------------------------------------

if (exploreButton) {
    exploreButton.addEventListener(
        "click",
        explore
    );
}

if (collectCardButton) {
    collectCardButton.addEventListener(
        "click",
        collectCard
    );
}

if (restorePowerButton) {
    restorePowerButton.addEventListener(
        "click",
        restorePower
    );
}


// ------------------------------------------------------------
// 18. INICIAR
// ------------------------------------------------------------

initializeGame();
