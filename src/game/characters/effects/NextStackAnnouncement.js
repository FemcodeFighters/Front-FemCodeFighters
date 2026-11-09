const STACK_COLORS = {
    HTML: "#e34c26",
    CSS: "#264de4",
    JAVASCRIPT: "#f7df1e",
    REACT: "#00d8ff",
    JAVA: "#ed8b00",
    SPRINGBOOT: "#6db33f",
};

export function showNextStackAnnouncement(scene, type) {
    const { width, height } = scene.scale;
    const color = STACK_COLORS[type] || "#00ccff";

    const overlay = scene.add
        .rectangle(width / 2, height / 2, width, height, 0x000000, 0.6)
        .setDepth(1999)
        .setAlpha(0);
    const label = scene.add
        .text(width / 2, height / 2 - 60, "NEXT STACK", {
            fontFamily: "Orbitron",
            fontSize: "32px",
            fill: "#888888",
            stroke: "#000000",
            strokeThickness: 6,
            letterSpacing: 12,
        })
        .setOrigin(0.5)
        .setDepth(2000)
        .setAlpha(0)
        .setScale(0.5);
    const nameText = scene.add
        .text(width / 2, height / 2 + 20, type, {
            fontFamily: "Orbitron",
            fontSize: "96px",
            fill: color,
            stroke: "#000000",
            strokeThickness: 14,
        })
        .setOrigin(0.5)
        .setDepth(2000)
        .setAlpha(0)
        .setScale(0.3);

    scene.tweens.add({ targets: overlay, alpha: 1, duration: 300, ease: "Power2" });
    scene.tweens.add({
        targets: label,
        alpha: 1,
        scale: 1,
        duration: 400,
        ease: "Back.out",
        delay: 100,
    });
    scene.tweens.add({
        targets: nameText,
        alpha: 1,
        scale: 1,
        duration: 500,
        ease: "Back.out",
        delay: 250,
        onComplete: () => {
            scene.cameras.main.shake(400, 0.015);
            const hex = parseInt(color.replace("#", ""), 16);
            scene.cameras.main.flash(
                300,
                (hex >> 16) & 255,
                (hex >> 8) & 255,
                hex & 255,
                false,
            );
        },
    });
    scene.time.delayedCall(2000, () => {
        scene.tweens.add({
            targets: [overlay, label, nameText],
            alpha: 0,
            scale: 1.2,
            duration: 400,
            ease: "Power2.in",
            onComplete: () => {
                overlay.destroy();
                label.destroy();
                nameText.destroy();
            },
        });
    });
}