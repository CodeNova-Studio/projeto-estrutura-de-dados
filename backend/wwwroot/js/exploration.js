
document.addEventListener("DOMContentLoaded", () => {
    const map = document.getElementById("room-map");
    if (!map) return;

    const screen = document.createElement("section");
    screen.className = "exploration-screen";
    screen.hidden = true;

    screen.innerHTML = `
        <header class="exploration-header">
            <div>
                <span>ORION FACILITY // EXPLORAÇÃO LOCAL</span>
                <h2>R01 — RECEPÇÃO</h2>
            </div>
            <button type="button" id="close-exploration">
                VOLTAR AO MAPA ×
            </button>
        </header>

        <div class="exploration-world" id="exploration-world">
            <div class="exploration-player" id="exploration-player">
                <div id="exploration-alex" class="alex-sprite"
                     role="img" aria-label="Alex"></div>
            </div>
        </div>

        <footer class="exploration-controls">
            <span>W A S D / SETAS — MOVIMENTAR</span>
            <span>ESC — VOLTAR AO MAPA</span>
            <span id="exploration-position">R01 // RECEPÇÃO</span>
        </footer>
    `;

    document.querySelector(".game-container").appendChild(screen);

    const world = document.getElementById("exploration-world");
    const player = document.getElementById("exploration-player");
    const closeButton = document.getElementById("close-exploration");

   
const roomCameras = {
    R01: {
        name: "RECEPÇÃO",
        image: "assets/rooms/reception.png"
    },
    R02: {
        name: "SEGURANÇA",
        image: "assets/rooms/security-room.jpg"
    },
    R03: {
        name: "CORREDOR NORTE",
        image: "assets/rooms/corridor.jpg"
    },
    R04: {
        name: "ARQUIVO",
        image: "assets/rooms/archive.jpg"
    },
    R05: {
        name: "DEPÓSITO",
        image: "assets/rooms/storage-room.jpg"
    },
    R06: {
        name: "LABORATÓRIO",
        image: "assets/rooms/laboratory.jpg"
    },
    R07: {
        name: "ENERGIA",
        image: "assets/rooms/power-station.jpg"
    },
    R08: {
        name: "OFICINA",
        image: "assets/rooms/workshop.jpg"
    },
    R09: {
        name: "ALA MÉDICA",
        image: "assets/rooms/medical-ward.jpg"
    },
    R10: {
        name: "CONTROLE CENTRAL",
        image: "assets/rooms/command-room.jpg"
    },
    R11: {
        name: "CÂMARA DE CONTENÇÃO",
        image: "assets/rooms/containment-chamber.jpg"
    },
    R12: {
        name: "SAÍDA",
        image: "assets/rooms/exit-chamber.jpg"
    }
};

function updateSurveillance(roomId) {
    const camera = roomCameras[roomId];

    if (!camera) return;

    const image = document.getElementById("surveillance-image");
    const name = document.getElementById("camera-name");
    const sector = document.getElementById("camera-sector");
    const signal = document.getElementById("camera-signal");
    const warning = document.getElementById("camera-warning");

    if (image) {
        image.src = camera.image;
        image.alt = `Monitoramento: ${camera.name}`;
    }

    if (name) {
        name.textContent = `CAM ${roomId.slice(1)} // ${camera.name}`;
    }

    if (sector) {
        sector.textContent = roomId;
    }

    if (signal) {
        signal.textContent = "ESTÁVEL";
    }

    if (warning) {
        warning.textContent = "SISTEMA DE VIGILÂNCIA ATIVO";
    }
}

updateSurveillance("R01");

world.style.backgroundImage =
    "url('assets/rooms/reception.png')";


    const character = new AlexCharacter("exploration-alex");

    // A movimentação não altera o status exibido no perfil da Alex.
    character.statusElement = null;

    const keys = new Set();

    let open = false;
    let x = 0;
    let y = 0;
    let lastTime = 0;
    let animationFrame = null;

    const speed = 210;
    const margin = 38;

    // Obstáculos físicos da recepção.
    // As coordenadas serão definidas com base na imagem do cenário.
    const obstacles = [];

    // Verifica se a Alex está tentando atravessar um obstáculo.
    function checkCollision(nextX, nextY) {
        const playerWidth = player.offsetWidth;
        const playerHeight = player.offsetHeight;

        const playerBox = {
            left: nextX - playerWidth / 2,
            right: nextX + playerWidth / 2,
            top: nextY - playerHeight / 2,
            bottom: nextY + playerHeight / 2
        };

        return obstacles.some(obstacle => {
            return (
                playerBox.left < obstacle.right &&
                playerBox.right > obstacle.left &&
                playerBox.top < obstacle.bottom &&
                playerBox.bottom > obstacle.top
            );
        });
    }

    function drawPlayer() {
        player.style.left = `${x}px`;
        player.style.top = `${y}px`;
    }

    function openRoom() {
        screen.hidden = false;
        open = true;

        const bounds = world.getBoundingClientRect();

        x = bounds.width / 2;
        y = bounds.height * 0.72;

        drawPlayer();

        character.setDirection("front");
        character.setState("idle");

        lastTime = 0;
        animationFrame = requestAnimationFrame(movePlayer);
    }

    function closeRoom() {
        open = false;
        keys.clear();

        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }

        screen.hidden = true;
        character.setState("idle");
    }

    function movePlayer(timestamp) {
        if (!open) return;

        const delta = lastTime
            ? Math.min((timestamp - lastTime) / 1000, 0.05)
            : 0;

        lastTime = timestamp;

        let dx = 0;
        let dy = 0;

        if (keys.has("ArrowLeft") || keys.has("a")) dx--;
        if (keys.has("ArrowRight") || keys.has("d")) dx++;
        if (keys.has("ArrowUp") || keys.has("w")) dy--;
        if (keys.has("ArrowDown") || keys.has("s")) dy++;

        const moving = dx !== 0 || dy !== 0;

        if (moving) {
            const length = Math.hypot(dx, dy);

            dx /= length;
            dy /= length;

            const nextX = x + dx * speed * delta;
            const nextY = y + dy * speed * delta;

            const bounds = world.getBoundingClientRect();

            const halfWidth = player.offsetWidth / 2;
            const halfHeight = player.offsetHeight / 2;

            const limitX = Math.max(margin, halfWidth);
            const limitY = Math.max(margin, halfHeight);

            const boundedX = Math.max(
                limitX,
                Math.min(bounds.width - limitX, nextX)
            );

            const boundedY = Math.max(
                limitY,
                Math.min(bounds.height - limitY, nextY)
            );

            // Verifica a colisão horizontal e vertical separadamente.
            if (!checkCollision(boundedX, y)) {
                x = boundedX;
            }

            if (!checkCollision(x, boundedY)) {
                y = boundedY;
            }

            if (Math.abs(dx) > Math.abs(dy)) {
                character.setDirection(dx < 0 ? "left" : "right");
            } else {
                character.setDirection(dy < 0 ? "back" : "front");
            }

            character.setState("walk");
            drawPlayer();
        } else {
            character.setState("idle");
        }

        animationFrame = requestAnimationFrame(movePlayer);
    }

    
map.addEventListener("click", event => {
    const room = event.target.closest(".room-node");
    if (!room) return;

    const roomId = room.dataset.roomId;

    // Atualiza a câmera da sala selecionada.
    updateSurveillance(roomId);

    if (roomId === "R01") {
        openRoom();
    } else {
        addLog(
            `Câmera direcionada para ${roomId}. O cenário de exploração ainda não está disponível.`,
            "VIGILÂNCIA"
        );
    }
});


    closeButton.addEventListener("click", closeRoom);

    document.addEventListener("keydown", event => {
        if (!open) return;

        const key = event.key.length === 1
            ? event.key.toLowerCase()
            : event.key;

        if ([
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "w",
            "a",
            "s",
            "d"
        ].includes(key)) {
            event.preventDefault();
            keys.add(key);
        }

        if (event.key === "Escape") {
            closeRoom();
        }
    });

    document.addEventListener("keyup", event => {
        const key = event.key.length === 1
            ? event.key.toLowerCase()
            : event.key;

        keys.delete(key);
    });

    window.addEventListener("blur", () => keys.clear());
});
