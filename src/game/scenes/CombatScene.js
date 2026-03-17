import { EventBus } from "../EventBus";
import { Scene } from "phaser";
import Player from "../characters/Player";
import EnemyJavaScript from "../characters/EnemyJavaScript";

export default class CombatScene extends Scene {
    constructor() {
        super({
            key: "CombatScene",
            physics: { arcade: { gravity: { y: 800 } } },
        });
    }

    create() {
        
        EventBus.emit("current-scene-ready", this);
        const { width, height } = this.scale;
        this._createMockupTextures();
        this.platforms = this._createPlatforms(width, height);
        this._initEntities(width, height);
        this.cameras.main.setBackgroundColor("#1a1a2e").fadeIn(500);
        this.time.delayedCall(100, () => this._updateUI());
    }

    _initEntities(width, height) {
        if (this.player || this.enemy) return;

        this.player = new Player(this, 200, height - 150, "player_custom");
        this.enemy = new EnemyJavaScript(this, width - 200, height - 150);

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemy, this.platforms);

        this.player.on("healthChanged", () => this._updateUI());
        this.enemy.on("healthChanged", () => this._updateUI());

        this.player.on("died", () => this._onCombatEnd("enemy"));
        this.enemy.on("died", () => this._onCombatEnd("player"));
    }

    update(_time, delta) {
        if (!this.player || !this.enemy || !this.player.active) return;
        this.player.update(delta);
        if (this.enemy.isAlive()) this.enemy.update(delta, this.player);

        this._checkCombatCollisions();
    }

    _checkCombatCollisions() {
        if (!this.player.isAlive() || !this.enemy.isAlive()) return;

        if (this.player.checkAttackHit(this.enemy)) {
            this.player.onMeleeHit();
            this.cameras.main.shake(100, 0.005);
            this._updateUI();
        }

        if (this.enemy.checkAttackHit?.(this.player)) {
            this.cameras.main.shake(100, 0.005);
            this._updateUI();
        }

        this.player.checkProjectileHit(this.enemy, () => {
            this.player.onRangedHit();
            this._updateUI();
        });
    }

    _updateUI() {
        if (!this.player || !this.enemy) return;

        EventBus.emit("player-health", {
            hp: this.player.hp,
            maxHP: this.player.maxHP,
        });
        EventBus.emit("enemy-health", {
            hp: this.enemy.hp,
            maxHP: this.enemy.maxHP,
        });

        EventBus.emit("player-ultimate", {
            energy: this.player.energy,
            max: this.player.maxEnergy,
            ready: this.player.energy >= this.player.ultimateCost,
        });

        EventBus.emit("player-cooldown-attack", !this.player.isAttackCooldown);
        EventBus.emit("player-cooldown-ranged", !this.player.isRangedCooldown);
    }

    _createPlatforms(width, height) {
        const platforms = this.physics.add.staticGroup();
        const ground = this.add.rectangle(
            width / 2,
            height - 30,
            width,
            60,
            0x000000,
        );
        platforms.add(ground);
        return platforms;
    }

    _createMockupTextures() {
        if (!this.textures.exists("player"))
            this.textures.generate("player", {
                data: ["3"],
                pixelWidth: 40,
                pixelHeight: 60,
            });
        if (!this.textures.exists("enemy_js"))
            this.textures.generate("enemy_js", {
                data: ["e"],
                pixelWidth: 40,
                pixelHeight: 60,
            });
    }
    _onCombatEnd(winner) {
        this.physics.pause();
        this.player.setTint(winner === "player" ? 0x00ff00 : 0xff0000);

        EventBus.emit("combat-result", { winner });

        this.time.delayedCall(1500, () => {
            this.scene.start("GameOver", { winner: winner });
        });
    }
}
