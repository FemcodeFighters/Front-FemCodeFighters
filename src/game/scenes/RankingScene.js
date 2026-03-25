import { Scene } from "phaser";

export default class RankingScene extends Scene {
    constructor() {
        super("RankingScene");
    }

    create() {
        const { width, height } = this.scale;
        this.add.rectangle(0, 0, width, height, 0x020408).setOrigin(0);
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.lineStyle(1, 0x00ffc8, 0.05);
        graphics.strokeRect(0, 0, 40, 40);
        graphics.generateTexture("grid-pattern", 40, 40);
        this.grid = this.add
            .tileSprite(0, 0, width, height, "grid-pattern")
            .setOrigin(0);
        const scanlines = this.add.graphics();
        scanlines.fillStyle(0x000000, 0.1);
        for (let i = 0; i < height; i += 4) {
            scanlines.fillRect(0, i, width, 2);
        }
        this.cameras.main.fadeIn(500, 0, 0, 0);
    }

    update() {
        if (this.grid) {
            this.grid.tilePositionY -= 0.4;
            this.grid.tilePositionX -= 0.1;
        }
    }
}
