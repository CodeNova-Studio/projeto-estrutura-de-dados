
/* =========================================
   ALEX CHARACTER CONTROLLER
   Escape Protocol
========================================= */

class AlexCharacter {

    constructor(elementId) {

        this.element = document.getElementById(elementId);

        this.statusElement = document.getElementById(
            "alex-animation-status"
        );

        this.frameWidth = 64;
        this.frameHeight = 96;

        this.displayScale = 2;

        this.direction = "front";
        this.state = "idle";

        this.frame = 0;
        this.lastFrameTime = 0;

        this.animationSpeed = {
            idle: 350,
            walk: 120,
            interaction: 250
        };

        this.directionRows = {
            front: 0,
            left: 1,
            right: 2,
            back: 3
        };

        this.frameCounts = {
            idle: 4,
            walk: 6,
            interaction: 4
        };

        this.sheets = {
            idle: "assets/characters/alex/idle.png",
            walk: "assets/characters/alex/walk.png",
            interaction: "assets/characters/alex/interaction.png"
        };

        this.loadedSheets = {};
        this.currentSheet = null;

        this.isReady = false;
        this.isPlaying = false;

        if (!this.element) {
            return;
        }

        this.loadSheets();
    }

    async loadSheets() {

        const entries = Object.entries(this.sheets);

        const results = await Promise.all(
            entries.map(([name, path]) => {

                return new Promise(resolve => {

                    const image = new Image();

                    image.onload = () => {
                        resolve({
                            name,
                            image,
                            success: true
                        });
                    };

                    image.onerror = () => {
                        resolve({
                            name,
                            image: null,
                            success: false
                        });
                    };

                    image.src = path;
                });
            })
        );

        results.forEach(result => {

            if (result.success) {
                this.loadedSheets[result.name] = result.image;
            }

        });

        if (!this.loadedSheets.idle) {

            this.setStatus("SPRITES NÃO CARREGADOS");
            this.element.dataset.spriteReady = "false";

            return;
        }

        this.isReady = true;

        this.element.dataset.spriteReady = "true";

        this.setState("idle");
        this.setStatus("ESTADO: PARADA");

        this.start();
    }

    setDirection(direction) {

        if (!(direction in this.directionRows)) {
            return;
        }

        this.direction = direction;

        this.frame = 0;

        this.render();
    }

    setState(state) {

        if (!(state in this.frameCounts)) {
            return;
        }

        if (state === "interaction" && !this.loadedSheets.interaction) {
            this.setStatus("ANIMAÇÃO DE INTERAÇÃO INDISPONÍVEL");
            return;
        }

        if (state === "walk" && !this.loadedSheets.walk) {
            this.setStatus("ANIMAÇÃO DE CAMINHADA INDISPONÍVEL");
            return;
        }

        this.state = state;
        this.frame = 0;
        this.lastFrameTime = 0;

        this.render();

        const labels = {
            idle: "ESTADO: PARADA",
            walk: "ESTADO: CAMINHANDO",
            interaction: "ESTADO: INVESTIGANDO"
        };

        this.setStatus(labels[state]);
    }

    render() {

        if (!this.isReady) {
            return;
        }

        const image = this.loadedSheets[this.state];

        if (!image) {
            return;
        }

        const row = this.state === "interaction"
            ? 0
            : this.directionRows[this.direction];

        const x = this.frame * this.frameWidth * this.displayScale;
        const y = row * this.frameHeight * this.displayScale;

        this.element.style.backgroundImage =
            `url("${this.sheets[this.state]}")`;

        this.element.style.backgroundPosition =
            `-${x}px -${y}px`;

        this.element.style.backgroundSize =
            `${image.width * this.displayScale}px ` +
            `${image.height * this.displayScale}px`;
    }

    animate(timestamp) {

        if (!this.isPlaying || !this.isReady) {
            return;
        }

        if (!this.lastFrameTime) {
            this.lastFrameTime = timestamp;
        }

        const elapsed = timestamp - this.lastFrameTime;

        if (elapsed >= this.animationSpeed[this.state]) {

            this.frame++;

            if (this.state === "interaction") {

                if (this.frame >= this.frameCounts.interaction) {
                    this.frame = 0;
                    this.setState("idle");
                }

            } else {

                this.frame %= this.frameCounts[this.state];
            }

            this.lastFrameTime = timestamp;

            this.render();
        }

        requestAnimationFrame(
            this.animate.bind(this)
        );
    }

    start() {

        if (this.isPlaying || !this.isReady) {
            return;
        }

        this.isPlaying = true;

        requestAnimationFrame(
            this.animate.bind(this)
        );
    }

    stop() {
        this.isPlaying = false;
    }

    investigate() {

        if (!this.isReady || !this.loadedSheets.interaction) {
            return;
        }

        this.setState("interaction");
    }

    setStatus(message) {

        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }
}

/* Inicialização */

let alex = null;

document.addEventListener("DOMContentLoaded", () => {

    alex = new AlexCharacter("alex-sprite");

});
