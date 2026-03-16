import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import Player from '../characters/Player';
import EnemyJavaScript from '../characters/EnemyJavaScript';

export default class CombatScene extends Scene {
    constructor() {
        super({
            key: 'CombatScene',
            physics: {
                arcade: {
                    gravity: { y: 600 },
                    debug: false,
                }
            }
        });
    }

    create() {
        const { width, height } = this.scale;

        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

        this.platforms = this._createPlatforms(width, height);

        this.player = new Player(this, 160, height - 200);
        this.enemy  = new EnemyJavaScript(this, width - 160, height - 200);

        // Registrar targets para las ultimates
        this.player.setTargets([this.enemy]);

        // Colisiones personajes ↔ plataformas
        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.enemy,  this.platforms);

        // Eventos → React vía EventBus
        this.player.on('healthChanged', (hp, maxHP) => {
            EventBus.emit('player-health', { hp, maxHP });
        });
        this.enemy.on('healthChanged', (hp, maxHP) => {
            EventBus.emit('enemy-health', { hp, maxHP });
        });
        this.player.on('died', () => this._onCombatEnd('enemy'));
        this.enemy.on('died',  () => this._onCombatEnd('player'));

        EventBus.emit('current-scene-ready', this);
    }

    update(_time, delta) {
        if (this.player?.isAlive()) this.player.update(delta);
        if (this.enemy?.isAlive())  this.enemy.update(delta, this.player);

        if (this.player?.isAlive() && this.enemy?.isAlive()) {
            // Melee jugadora → acumula energía ultimate jugadora
            const playerMeleeHit = this.player.checkAttackHit(this.enemy);
            if (playerMeleeHit) this.player.onMeleeHit();

            // Melee enemigo → acumula energía ultimate enemigo
            const enemyMeleeHit = this.enemy.checkAttackHit(this.player);
            if (enemyMeleeHit) this.enemy.onMeleeHit();

            // Proyectiles jugadora → acumula energía ultimate jugadora
            this.player.checkProjectileHit(this.enemy, () => this.player.onRangedHit());

            // Proyectiles enemigo → acumula energía ultimate enemigo
            this.enemy.checkProjectileHit(this.player, () => this.enemy.onRangedHit());
        }
    }

    _createPlatforms(width, height) {
        const platforms = this.physics.add.staticGroup();

        const ground = this.add.rectangle(width / 2, height - 40, width, 80, 0x2d3561);
        platforms.add(ground);
        this.physics.add.existing(ground, true);

        [
            { x: width * 0.25, y: height - 200, w: 200, h: 20 },
            { x: width * 0.75, y: height - 200, w: 200, h: 20 },
            { x: width * 0.5,  y: height - 340, w: 260, h: 20 },
        ].forEach(({ x, y, w, h }) => {
            const plat = this.add.rectangle(x, y, w, h, 0x4a5394);
            platforms.add(plat);
            this.physics.add.existing(plat, true);
        });

        return platforms;
    }

    _onCombatEnd(winner) {
        this.time.delayedCall(800, () => {
            EventBus.emit('combat-end', winner);
            this.scene.start('GameOver');
        });
    }
}
