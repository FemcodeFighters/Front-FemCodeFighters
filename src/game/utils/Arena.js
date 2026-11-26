import Phaser from "phaser";

// Distancia entre la línea del suelo y el borde inferior de la pantalla
export const ARENA_FLOOR_OFFSET = 58;

function strokeLine(gfx, x1, y1, x2, y2) {
    gfx.beginPath();
    gfx.moveTo(x1, y1);
    gfx.lineTo(x2, y2);
    gfx.strokePath();
}

// Crea una textura dibujada con gráficos, solo si todavía no existe
function makeTexture(scene, key, width, height, draw) {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    draw(g);
    g.generateTexture(key, width, height);
    g.destroy();
}

export function createArenaTextures(scene) {
    makeTexture(scene, "spaghetti", 2, 20, (g) => {
        g.lineStyle(2, 0xf7df1e, 1);
        g.strokeLineShape(new Phaser.Geom.Line(0, 0, 0, 20));
    });

    makeTexture(scene, "confetti", 8, 8, (g) => {
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 8, 8);
    });

    makeTexture(scene, "projectile-duck", 36, 32, (g) => {
        g.fillStyle(0xf7df1e, 1);
        g.fillEllipse(16, 20, 24, 18);
        g.fillEllipse(22, 12, 16, 14);
        g.fillStyle(0xe6c800, 1);
        g.fillEllipse(14, 22, 14, 8);
        g.fillStyle(0xff8c00, 1);
        g.fillTriangle(28, 10, 34, 10, 34, 14);
        g.fillStyle(0x0a0a0a, 1);
        g.fillCircle(24, 10, 2);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(25, 9, 0.8);
    });

    makeTexture(scene, "projectile-bug", 32, 32, (g) => {
        g.fillStyle(0x22c55e, 1);
        g.fillEllipse(16, 18, 16, 20);
        g.fillStyle(0x16a34a, 1);
        g.fillEllipse(16, 9, 12, 10);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(13, 8, 1.8);
        g.fillCircle(19, 8, 1.8);
        g.fillStyle(0x0a0a0a, 1);
        g.fillCircle(13.5, 8, 1);
        g.fillCircle(19.5, 8, 1);
    });

    makeTexture(scene, "spaghetti_code", 3, 24, (g) => {
        g.fillStyle(0xf7df1e, 1);
        g.fillRect(0, 0, 3, 24);
        g.fillStyle(0xffffff, 0.6);
        g.fillRect(1, 0, 1, 24);
    });
}

export function createArenaBackground(scene, width, height) {
    scene.add
        .rectangle(width / 2, height / 2, width, height, 0x020408)
        .setDepth(-10);

    const buildingGfx = scene.add.graphics().setDepth(-9).setAlpha(0.6);
    const buildings = [
        { x: 0, w: 80, h: 280 },
        { x: 60, w: 60, h: 200 },
        { x: 110, w: 100, h: 320 },
        { x: 190, w: 50, h: 180 },
        { x: 230, w: 90, h: 260 },
        { x: 310, w: 70, h: 300 },
        { x: 370, w: 110, h: 220 },
        { x: 560, w: 90, h: 290 },
        { x: 640, w: 60, h: 200 },
        { x: 690, w: 100, h: 340 },
        { x: 780, w: 70, h: 260 },
        { x: 840, w: 90, h: 190 },
        { x: 920, w: 60, h: 310 },
        { x: 970, w: 80, h: 240 },
    ];
    buildings.forEach((b) => {
        buildingGfx.fillStyle(0x06080f, 1);
        buildingGfx.fillRect(b.x, height - 60 - b.h, b.w, b.h);
        buildingGfx.fillStyle(0x00ffc8, 0.12);
        for (let wy = height - 60 - b.h + 10; wy < height - 70; wy += 18) {
            for (let wx = b.x + 6; wx < b.x + b.w - 6; wx += 14) {
                if ((wx + wy) % 3 !== 0) {
                    buildingGfx.fillRect(wx, wy, 6, 8);
                }
            }
        }
        buildingGfx.fillStyle(0x00ffc8, 0.15);
        buildingGfx.fillRect(b.x, height - 60 - b.h, b.w, 1);
    });

    const gridGfx = scene.add.graphics().setDepth(-8);
    const groundY = height - 60;
    const horizon = height * 0.55;

    for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const y = horizon + (groundY - horizon) * t;
        gridGfx.lineStyle(1, 0x00ffc8, 0.05 + t * 0.2);
        strokeLine(gridGfx, 0, y, width, y);
    }

    const vLines = 16;
    for (let i = 0; i <= vLines; i++) {
        const t = i / vLines;
        const xGround = width * t;
        const xHorizon = width / 2 + (xGround - width / 2) * 0.1;
        gridGfx.lineStyle(1, 0x00ffc8, 0.06 + Math.abs(t - 0.5) * 0.1);
        strokeLine(gridGfx, xHorizon, horizon, xGround, groundY);
    }

    const scanGfx = scene.add.graphics().setDepth(100).setAlpha(0.04);
    for (let y = 0; y < height; y += 4) {
        scanGfx.fillStyle(0x000000, 1);
        scanGfx.fillRect(0, y + 2, width, 2);
    }

    const horizonGfx = scene.add.graphics().setDepth(-7);
    horizonGfx.lineStyle(1, 0x00ffc8, 0.3);
    strokeLine(horizonGfx, 0, horizon, width, horizon);
    horizonGfx.lineStyle(3, 0x00ffc8, 0.05);
    strokeLine(horizonGfx, 0, horizon, width, horizon);
}

export function createArenaPlatforms(scene, width, height) {
    const platforms = scene.physics.add.staticGroup();
    const groundY = height - 30;

    const floorBody = scene.add.rectangle(
        width / 2,
        groundY,
        width,
        60,
        0x000000,
        0,
    );
    scene.physics.add.existing(floorBody, true);
    platforms.add(floorBody);

    const floorGfx = scene.add.graphics().setDepth(1);
    floorGfx.fillStyle(0x020408, 1);
    floorGfx.fillRect(0, groundY - 28, width, 58);
    floorGfx.lineStyle(2, 0x00ffc8, 1);
    strokeLine(floorGfx, 0, groundY - 28, width, groundY - 28);
    floorGfx.lineStyle(6, 0x00ffc8, 0.08);
    strokeLine(floorGfx, 0, groundY - 25, width, groundY - 25);
    for (let x = 0; x < width; x += 40) {
        floorGfx.lineStyle(1, 0x00ffc8, 0.12);
        strokeLine(floorGfx, x, groundY - 28, x, groundY + 30);
    }

    buildPlatform(scene, platforms, 160, height - 260, 180, 28);
    buildPlatform(scene, platforms, width / 2, height - 370, 200, 28);
    buildPlatform(scene, platforms, width - 180, height - 290, 180, 28);

    return platforms;
}

function buildPlatform(scene, platforms, cx, cy, w, h) {
    const body = scene.add.rectangle(cx, cy, w, h, 0x000000, 0);
    scene.physics.add.existing(body, true);
    platforms.add(body);

    const gfx = scene.add.graphics().setDepth(2);
    const x = cx - w / 2;
    const y = cy - h / 2;
    gfx.fillStyle(0x0a0d14, 1);
    gfx.fillRect(x, y, w, h);
    gfx.lineStyle(1.5, 0x00ffc8, 0.9);
    gfx.beginPath();
    gfx.moveTo(x + 5, y);
    gfx.lineTo(x + w - 5, y);
    gfx.lineTo(x + w, y + 4);
    gfx.lineTo(x + w, y + h - 4);
    gfx.lineTo(x + w - 5, y + h);
    gfx.lineTo(x + 5, y + h);
    gfx.lineTo(x, y + h - 4);
    gfx.lineTo(x, y + 4);
    gfx.closePath();
    gfx.strokePath();

    const keySize = 7;
    const keyGap = 2;
    const padX = 6;
    const padY = 4;
    const cols = Math.floor((w - padX * 2) / (keySize + keyGap));
    const rows = Math.floor((h - padY * 2) / (keySize + keyGap));
    const keyColors = [
        { fill: 0x141a24, stroke: 0x00ffc8, alpha: 0.9 },
        { fill: 0x141a24, stroke: 0x7c3aed, alpha: 0.8 },
        { fill: 0x141a24, stroke: 0x00ffc8, alpha: 0.6 },
    ];
    const litKeys = [
        { fill: 0x00ffc8, stroke: 0x00ffc8, alpha: 1 },
        { fill: 0x7c3aed, stroke: 0xb388ff, alpha: 1 },
        { fill: 0xf7df1e, stroke: 0xf7df1e, alpha: 1 },
    ];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const kx = x + padX + col * (keySize + keyGap);
            const ky = y + padY + row * (keySize + keyGap);
            const seed = (col * 7 + row * 13) % 100;
            const lit = seed < 6;
            const style = lit
                ? litKeys[seed % litKeys.length]
                : keyColors[(col + row) % keyColors.length];
            gfx.fillStyle(0x000000, 0.5);
            gfx.fillRect(kx + 1, ky + 1, keySize, keySize);
            gfx.fillStyle(style.fill, style.alpha);
            gfx.fillRect(kx, ky, keySize, keySize);
            gfx.lineStyle(0.5, style.stroke, style.alpha);
            gfx.strokeRect(kx, ky, keySize, keySize);
            if (lit) {
                gfx.fillStyle(style.fill, 0.3);
                gfx.fillRect(kx + 1, ky + 1, keySize - 2, 3);
            }
        }
    }

    gfx.lineStyle(10, 0x00ffc8, 0.03);
    strokeLine(gfx, x + 10, y + h + 5, x + w - 10, y + h + 5);
    gfx.lineStyle(18, 0x00ffc8, 0.015);
    strokeLine(gfx, x + 20, y + h + 9, x + w - 20, y + h + 9);

    const brand = ["CYBER-KB v2", "MECH-PRO X", "CODE-DECK"][
        Math.floor((cx * 7) % 3)
    ];
    scene.add
        .text(cx, y + h - 2, brand, {
            fontFamily: "monospace",
            fontSize: "5px",
            color: "#00ffc8",
        })
        .setOrigin(0.5, 1)
        .setDepth(3)
        .setAlpha(0.25);
}