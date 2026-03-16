import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // Fondo negro — React pinta el menú por encima
        const { width, height } = this.scale;
        this.add.rectangle(width / 2, height / 2, width, height, 0x020408);

        // Avisa a React que esta escena está activa
        EventBus.emit('current-scene-ready', this);
    }

    changeScene() {
        // Llamado desde React al pulsar PLAY
        EventBus.emit('main-menu-leave');
        this.cameras.main.fade(400, 2, 4, 8);
        this.time.delayedCall(400, () => {
            this.scene.start('CombatScene');
        });
    }
}
