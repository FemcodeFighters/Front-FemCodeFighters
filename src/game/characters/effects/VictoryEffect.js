export function playVictoryEffect(scene, onDone) {
    const { width, height } = scene.scale;

    if (!scene.textures.exists("confetti")) {
        const g = scene.make.graphics({ x: 0, y: 0, add: false });
        g.fillStyle(0xffffff, 1);
        g.fillRect(0, 0, 8, 8);
        g.generateTexture("confetti", 8, 8);
        g.destroy();
    }

    const banner = scene.add
        .text(width / 2, height / 2, "¡FULL STACK MASTERED!", {
            fontFamily: "Orbitron",
            fontSize: "64px",
            fill: "#00ff41",
            stroke: "#000000",
            strokeThickness: 12,
        })
        .setOrigin(0.5)
        .setDepth(2000)
        .setAlpha(0);
    scene.tweens.add({
        targets: banner,
        alpha: 1,
        scale: { from: 0.5, to: 1 },
        duration: 500,
        ease: "Back.out",
    });

    const confetti = {
        speed: { min: 400, max: 800 },
        gravityY: 400,
        lifespan: 3000,
        tint: [0x00ff41, 0x00ccff, 0xf59e0b, 0xff0055],
        scale: { start: 1, end: 0 },
        quantity: 5,
        rotate: { min: 0, max: 360 },
    };
    const left = scene.add
        .particles(0, height, "confetti", {
            ...confetti,
            angle: { min: -60, max: -20 },
        })
        .setDepth(1500);
    const right = scene.add
        .particles(width, height, "confetti", {
            ...confetti,
            angle: { min: 200, max: 240 },
        })
        .setDepth(1500);

    scene.cameras.main.flash(500, 255, 255, 255);
    scene.cameras.main.shake(1000, 0.01);

    scene.time.delayedCall(4000, () => {
        left.stop();
        right.stop();
        onDone?.();
    });
}