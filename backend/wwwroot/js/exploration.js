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

            x += dx * speed * delta;
            y += dy * speed * delta;

            const bounds = world.getBoundingClientRect();

            x = Math.max(margin, Math.min(bounds.width - margin, x));
            y = Math.max(margin, Math.min(bounds.height - margin, y));

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

        if (room.dataset.roomId === "R01") {
            openRoom();
        } else {
            addLog(
                `O cenário de ${room.dataset.roomId} ainda não está disponível.`,
                "EXPLORAÇÃO"
            );
        }
    });

    closeButton.addEventListener("click", closeRoom);

    document.addEventListener("keydown", event => {
        if (!open) return;

        const key = event.key.length === 1
            ? event.key.toLowerCase()
            : event.key;

        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
             "w", "a", "s", "d"].includes(key)) {
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
