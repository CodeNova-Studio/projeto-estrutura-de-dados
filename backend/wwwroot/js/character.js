
class AlexCharacter {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.statusElement = document.getElementById("alex-animation-status");

        // Caminhos das spritesheets.
        this.sheetPath = "assets/characters/alex/alex-sheet.png";

        this.walkLeftPath =
            "assets/characters/alex/alex-walk-spritesheet-left-fixed.png";

        this.walkRightPath =
            "assets/characters/alex/alex-walk-spritesheet-right-fixed.png";

        // Dimensões dos quadros.
        this.frameWidth = 256;
        this.frameHeight = 256;
        this.displaySize = 136;

        this.sideTotalFrames = 8;

        this.directionRows = {
            front: 0,
            left: 1,
            right: 2,
            back: 3
        };

        this.animations = {
            idle: [0],
            walk: [1, 2, 3, 4, 3, 2, 1, 2],
            run: [5]
        };

        this.walkSideFrames = [0, 1, 2, 3, 4, 5, 6, 7];
        this.walkLeftFrames = [7, 6, 5, 4, 3, 2, 1, 0];

        this.frameDelays = {
            idle: 500,
            walk: 200,
            run: 85
        };

        this.direction = "front";
        this.state = "idle";

        this.sequenceIndex = 0;
        this.lastFrameTime = 0;

        this.images = {};
        this.isReady = false;
        this.isPlaying = false;

        if (!this.element) return;

        Promise.all([
            this.loadImage(this.sheetPath),
            this.loadImage(this.walkLeftPath),
            this.loadImage(this.walkRightPath)
        ])
        .then(([base, left, right]) => {

            // Valida a spritesheet principal.
            if (
                base.naturalWidth !== 1536 ||
                base.naturalHeight !== 1024
            ) {
                throw new Error(
                    "Dimensões da spritesheet original inválidas"
                );
            }

            // Valida as novas spritesheets laterais.
            if (
                left.naturalWidth !== 2048 ||
                left.naturalHeight !== 256 ||
                right.naturalWidth !== 2048 ||
                right.naturalHeight !== 256
            ) {
                throw new Error(
                    "Dimensões das spritesheets laterais inválidas"
                );
            }

            this.images = {
                base,
                left,
                right
            };

            this.isReady = true;
            this.element.dataset.spriteReady = "true";

            const placeholder = this.element.querySelector(
                ".alex-sprite-placeholder"
            );

            if (placeholder) {
                placeholder.hidden = true;
            }

            this.render();
            this.setStatus("ESTADO: PARADA");
            this.start();
        })
        .catch(error => {
            console.error("Erro ao carregar sprites da Alex:", error);

            this.setStatus("ERRO AO CARREGAR SPRITESHEET");
            this.element.dataset.spriteReady = "false";
        });
    }

    loadImage(path) {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => resolve(image);

            image.onerror = () => reject(
                new Error(`Não foi possível carregar: ${path}`)
            );

            image.src = path;
        });
    }

    setDirection(direction) {
        if (!(direction in this.directionRows)) return;
        if (this.direction === direction) return;

        this.direction = direction;
        this.sequenceIndex = 0;
        this.lastFrameTime = 0;

        this.render();
    }

    setState(state) {
        if (!(state in this.animations)) return;
        if (this.state === state) return;

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

    getCurrentFrames() {
        if (this.state === "walk" && this.direction === "left") {
    return this.walkLeftFrames;
}

if (this.state === "walk" && this.direction === "right") {
    return this.walkSideFrames;
}

        return this.animations[this.state];
    }

    render() {
        if (!this.isReady) return;

        const isSideWalking =
            this.state === "walk" &&
            (this.direction === "left" || this.direction === "right");

        if (isSideWalking) {

            const image = this.direction === "left"
                ? this.images.left
                : this.images.right;

            const frames = this.getCurrentFrames();
            const column = frames[this.sequenceIndex];

            // Cada quadro lateral possui 256 × 256 pixels.
            const scale = this.displaySize / this.frameWidth;

            const frameDisplayed = this.frameWidth * scale;
            const backgroundWidth = image.naturalWidth * scale;
            const backgroundHeight = image.naturalHeight * scale;

            const horizontalOffset = -(column * frameDisplayed);

            this.element.style.backgroundImage =
                `url("${image.src}")`;

            this.element.style.backgroundSize =
                `${backgroundWidth}px ${backgroundHeight}px`;

            this.element.style.backgroundPosition =
                `${horizontalOffset}px 0px`;

        } else {

            const frames = this.animations[this.state];
            const column = frames[this.sequenceIndex];
            const row = this.directionRows[this.direction];

            const scale = this.displaySize / this.frameWidth;

            const backgroundWidth =
                this.images.base.naturalWidth * scale;

            const backgroundHeight =
                this.images.base.naturalHeight * scale;

            this.element.style.backgroundImage =
                `url("${this.sheetPath}")`;

            this.element.style.backgroundSize =
                `${backgroundWidth}px ${backgroundHeight}px`;

            this.element.style.backgroundPosition =
                `${-(column * this.displaySize)}px ${-(row * this.displaySize)}px`;
        }

        this.element.style.backgroundRepeat = "no-repeat";
    }

    

    animate(timestamp) {
        if (!this.isPlaying || !this.isReady) return;

        if (!this.lastFrameTime) {
            this.lastFrameTime = timestamp;
        }

        const frames = this.getCurrentFrames();

        const delay = this.state === "walk"
            ? (this.direction === "front" || this.direction === "back"
                ? 400
                : 200)
            : this.frameDelays[this.state];

        let frameChanged = false;

        while (timestamp - this.lastFrameTime >= delay) {
            if (frames.length > 1) {
                this.sequenceIndex =
                    (this.sequenceIndex + 1) % frames.length;

                frameChanged = true;
            }

            this.lastFrameTime += delay;
        }

        if (frameChanged) {
            this.render();
        }

        requestAnimationFrame(this.animate.bind(this));
    }

    start() {
        if (this.isPlaying || !this.isReady) return;

        this.isPlaying = true;

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
