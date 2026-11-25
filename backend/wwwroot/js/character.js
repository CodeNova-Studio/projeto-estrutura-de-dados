class AlexCharacter {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.statusElement = document.getElementById("alex-animation-status");

        this.sheetPath = "assets/characters/alex/alex-sheet.png";
        this.frameWidth = 256;
        this.frameHeight = 256;

        this.directionRows = {
            front: 0,
            left: 1,
            right: 2,
            back: 3
        };

        // Coluna 0: parada; colunas 1–4: caminhada; coluna 5: corrida.
        this.animations = {
            idle: [0],
            walk: [1, 2, 3, 4],
            run: [5]
        };

        this.frameDelays = {
            idle: 500,
            walk: 125,
            run: 85
        };

        this.direction = "front";
        this.state = "idle";
        this.sequenceIndex = 0;
        this.lastFrameTime = 0;
        this.image = new Image();
        this.isReady = false;
        this.isPlaying = false;

        if (!this.element) return;

        this.image.onload = () => {
            if (
                this.image.naturalWidth !== 1536 ||
                this.image.naturalHeight !== 1024
            ) {
                this.setStatus("DIMENSÕES DA SPRITESHEET INVÁLIDAS");
                return;
            }

            this.isReady = true;
            this.element.dataset.spriteReady = "true";

            const placeholder = this.element.querySelector(
                ".alex-sprite-placeholder"
            );

            if (placeholder) placeholder.hidden = true;

            this.render();
            this.setStatus("ESTADO: PARADA");
            this.start();
        };

        this.image.onerror = () => {
            this.setStatus("ERRO AO CARREGAR SPRITESHEET");
            this.element.dataset.spriteReady = "false";
        };

        this.image.src = this.sheetPath;
    }

    setDirection(direction) {
        if (!(direction in this.directionRows)) return;

        this.direction = direction;
        this.sequenceIndex = 0;
        this.render();
    }

    setState(state) {
        if (!(state in this.animations)) return;

        this.state = state;
        this.sequenceIndex = 0;
        this.lastFrameTime = 0;

        const labels = {
            idle: "ESTADO: PARADA",
            walk: "ESTADO: CAMINHANDO",
            run: "ESTADO: CORRENDO"
        };

        this.setStatus(labels[state]);
        this.render();
    }

    render() {
        if (!this.isReady) return;

        const frames = this.animations[this.state];
        const column = frames[this.sequenceIndex];
        const row = this.directionRows[this.direction];

        this.element.style.backgroundImage =
            `url("${this.sheetPath}")`;

        this.element.style.backgroundRepeat = "no-repeat";
        this.element.style.backgroundSize = "768px 512px";

        this.element.style.backgroundPosition =
            `-${column * 128}px -${row * 128}px`;
    }

    animate(timestamp) {
        if (!this.isPlaying || !this.isReady) return;

        if (!this.lastFrameTime) {
            this.lastFrameTime = timestamp;
        }

        if (
            timestamp - this.lastFrameTime >=
            this.frameDelays[this.state]
        ) {
            const frames = this.animations[this.state];

            if (frames.length > 1) {
                this.sequenceIndex =
                    (this.sequenceIndex + 1) % frames.length;

                this.render();
            }

            this.lastFrameTime = timestamp;
        }

        requestAnimationFrame(this.animate.bind(this));
    }

    start() {
        if (this.isPlaying || !this.isReady) return;

        this.isPlaying = true;
        requestAnimationFrame(this.animate.bind(this));
    }

    stop() {
        this.isPlaying = false;
    }

    investigate() {
        this.setStatus("ESTADO: INVESTIGANDO");
    }

    setStatus(message) {
        if (this.statusElement) {
            this.statusElement.textContent = message;
        }
    }
}

let alex = null;

document.addEventListener("DOMContentLoaded", () => {
    alex = new AlexCharacter("alex-sprite");
});
