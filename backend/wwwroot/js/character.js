
class AlexCharacter {
    constructor(elementId) {
        this.element = document.getElementById(elementId);
        this.statusElement = document.getElementById("alex-animation-status");

        this.sheetPath = "assets/characters/alex/alex-sheet.png";

        this.walkLeftPath =
            "assets/characters/alex/alex-walk-spritesheet-left.png";

        this.walkRightPath =
            "assets/characters/alex/alex-walk-spritesheet-right.png";

        this.frameWidth = 256;
        this.frameHeight = 256;

        this.directionRows = {
            front: 0,
            left: 1,
            right: 2,
            back: 3
        };

        this.animations = {
            idle: [0],
            walk: [1, 2, 3, 4, 3, 2],
            run: [5]
        };

        this.walkSideFrames = [0, 1, 2, 3, 4, 5, 6, 7];

        this.frameDelays = {
            idle: 500,
            walk: 130,
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
            if (
                base.naturalWidth !== 1536 ||
                base.naturalHeight !== 1024
            ) {
                throw new Error("Dimensões da spritesheet original inválidas");
            }

            if (
                left.naturalWidth !== 2172 ||
                left.naturalHeight !== 724 ||
                right.naturalWidth !== 2172 ||
                right.naturalHeight !== 724
            ) {
                throw new Error("Dimensões das spritesheets de caminhada inválidas");
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
        if (
            this.state === "walk" &&
            (this.direction === "left" || this.direction === "right")
        ) {
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

            const scale = 136 / 472.1;
            const frameWidth = (2172 / 8) * scale;
            const backgroundWidth = 2172 * scale;
            const backgroundHeight = 724 * scale;
            const verticalOffset = 129.4 * scale;

            const column = this.walkSideFrames[this.sequenceIndex];

            const horizontalOffset =
                ((136 - frameWidth) / 2) -
                (column * frameWidth);

            this.element.style.backgroundImage =
                `url("${image.src}")`;

            this.element.style.backgroundSize =
                `${backgroundWidth}px ${backgroundHeight}px`;

            this.element.style.backgroundPosition =
                `${horizontalOffset}px -${verticalOffset}px`;

        } else {
            const frames = this.animations[this.state];
            const column = frames[this.sequenceIndex];
            const row = this.directionRows[this.direction];

            this.element.style.backgroundImage =
                `url("${this.sheetPath}")`;

            this.element.style.backgroundSize = "816px 544px";

            this.element.style.backgroundPosition =
                `-${column * 136}px -${row * 136}px`;
        }

        this.element.style.backgroundRepeat = "no-repeat";
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
            const frames = this.getCurrentFrames();

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
