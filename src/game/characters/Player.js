import Character, { CharacterState } from './Character';
import { EventBus } from '../EventBus';
import { mask, unmask } from '../../game/utils/Security';

export default class Player extends Character {
    #ultimateEnergy;

    constructor(scene, x, y) {
        const characterData = scene.registry.get('character') || {};
        const stats = characterData.stats || { hp: 100, speed: 200, attack: 15 };

        super(scene, x, y, 'player', {
            maxHP: stats.hp,
            speed: stats.speed,
            jumpForce: -480,
            attackDamage: stats.attack,
            attackRange: 80, 
        });

        this.#ultimateEnergy = mask(0);
        this.energy = 0; 
        this.maxEnergy = 100;
        this.ultimateCost = 100;
        this.isAttackCooldown = false;
        this.isRangedCooldown = false;

        this.projectileType = 'duck';

        this.cursors = scene.input.keyboard.createCursorKeys();
        this.keys = scene.input.keyboard.addKeys({
            attack: Phaser.Input.Keyboard.KeyCodes.F,
            ranged: Phaser.Input.Keyboard.KeyCodes.G,
            ultimate: Phaser.Input.Keyboard.KeyCodes.R
        });
    }

    update(delta) {
        super.update(delta);
        
        if (this.state === CharacterState.DEAD) return;
        if (!this._isActionLocked()) {
            if (this.cursors.left.isDown) {
                this.moveLeft();
            } else if (this.cursors.right.isDown) {
                this.moveRight();
            } else {
                this.stopHorizontal();
            }

            if ((this.cursors.up.isDown || this.cursors.space.isDown) && this.isOnGround) {
                this.jump();
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.attack)) {
            this.handleMeleeAttack();
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.ranged)) {
            this.handleRangedAttack();
        }
        
        if (Phaser.Input.Keyboard.JustDown(this.keys.ultimate)) {
            this.useUltimate();
        }
    }

    handleMeleeAttack() {
        if (this.isAttackCooldown || this._isActionLocked()) return;
        
        this.attack();
        this.isAttackCooldown = true;
        this._syncWithReact(); 

        this.scene.time.delayedCall(500, () => {
            this.isAttackCooldown = false;
            this._syncWithReact();
        });
    }

    handleRangedAttack() {
        if (this.isRangedCooldown || this._isActionLocked()) return;

        this.rangedAttack();
        this.isRangedCooldown = true;
        this._syncWithReact();

        this.scene.time.delayedCall(1500, () => {
            this.isRangedCooldown = false;
            this._syncWithReact();
        });
    }

    onMeleeHit() { this._gainEnergy(15); }
    onRangedHit() { this._gainEnergy(10); }

    _gainEnergy(amount) {
        let current = unmask(this.#ultimateEnergy);
        current = Math.min(this.maxEnergy, current + amount);
        this.#ultimateEnergy = mask(current);
        this.energy = current;
        this._syncWithReact();
    }

    useUltimate() {
        const currentEnergy = unmask(this.#ultimateEnergy);
        if (currentEnergy < this.ultimateCost) {
            console.log("Energía insuficiente");
            return;
        }

        this.#ultimateEnergy = mask(0);
        this.energy = 0;
        
        this.scene.cameras.main.shake(300, 0.02);
        this.scene.cameras.main.flash(500, 255, 255, 255);
        
        if (this.scene.enemy && this.scene.enemy.isAlive()) {
            this.scene.enemy.takeDamage(40, this);
        }

        this.setTint(0x00ffff);
        this.scene.time.delayedCall(1000, () => this.clearTint());
        this._syncWithReact();
    }

    _syncWithReact() {
        if (this.scene._updateUI) {
            this.scene._updateUI();
        }
        
        EventBus.emit('player-ultimate', { 
            energy: this.energy, 
            max: this.maxEnergy, 
            ready: this.energy >= this.ultimateCost 
        });

        EventBus.emit('player-cooldown-attack', !this.isAttackCooldown);
        EventBus.emit('player-cooldown-ranged', !this.isRangedCooldown);
    }
}