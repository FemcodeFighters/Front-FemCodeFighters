import Phaser from 'phaser';
import Character from './Character';
import Ultimate from './Ultimate';
import { mask, unmask } from '../../game/utils/Security';

const AIState = {
    IDLE:    'ai_idle',
    CHASE:   'ai_chase',
    ATTACK:  'ai_attack',
    RANGED:  'ai_ranged',
    RETREAT: 'ai_retreat',
};

export default class EnemyJavaScript extends Character {
    #ultimateEnergy;

    constructor(scene, x, y) {
        const textureKey = scene.textures.exists('enemy_js') ? 'enemy_js' : null;

        super(scene, x, y, textureKey, {
            maxHP:          120,
            speed:          240,
            jumpForce:      -460,
            attackDamage:   8,
            attackRange:    55,
            attackCooldown: 700,
            rangedCooldown: 2000,
            bodyW:          34,
            bodyH:          56,
        });

        this.projectileType = 'bug';
        
        this._labelText = scene.add.text(x, y - 40, 'JS', {
            fontSize:        '12px',
            fontFamily:      'monospace',
            color:           '#000',
            backgroundColor: '#f7df1e',
            padding:         { x: 4, y: 2 },
        }).setOrigin(0.5);

        this.#ultimateEnergy = mask(0); 
        this.ultimateMaxEnergy = 100;
        this.ultimateReady     = false;
        this._ultimateKey      = 'SPAGHETTI_CODE';
        this._ultimate         = new Ultimate(scene, this, this._ultimateKey);

        const particleTexture = scene.textures.exists('bug') ? 'bug' : null;
        this._dangerParticles = scene.add.particles(0, 0, particleTexture, { 
            speed: { min: 60, max: 120 },
            scale: { start: 0.6, end: 0 },
            alpha: { start: 0.8, end: 0 },
            tint: 0xff0000,
            lifespan: 500,
            emitting: false, 
        });
        this._dangerParticles.startFollow(this);

        this._aiState       = AIState.IDLE;
        this._target        = null;
        this._thinkTimer    = 0;
        this._thinkInterval = 300;
    }


    isAlive() {
        return this.hp > 0 && this.active;
    }

    update(delta, target) {
        super.update(delta);

        if (!this.isAlive() || !target || !target.active) {
            this._stopDangerParticles();
            this.stopHorizontal();
            if (this._labelText) this._labelText.setVisible(false);
            return;
        }

        this._target = target;

        this._thinkTimer += delta;
        if (this._thinkTimer >= this._thinkInterval) {
            this._thinkTimer = 0;
            this._think();
        }

        this._executeAI();

        if (this._labelText) {
            this._labelText.setPosition(this.x, this.y - 40);
        }
    }


    onMeleeHit()  { this._gainEnergy(20); }
    onRangedHit() { this._gainEnergy(35); }

    _gainEnergy(amount) {
        if (this.ultimateReady) return;
        let current = unmask(this.#ultimateEnergy);
        current = Math.min(this.ultimateMaxEnergy, current + amount);
        this.#ultimateEnergy = mask(current);

        if (current >= this.ultimateMaxEnergy) {
            this.ultimateReady = true;
            this._startDangerParticles();
        }
    }

    _think() {
        const dist = Phaser.Math.Distance.Between(this.x, this.y, this._target.x, this._target.y);

        if (this.ultimateReady && dist < 200) {
            this._activateUltimate();
            return;
        }

        if (dist < this.attackRange + 10) {
            this._aiState = AIState.ATTACK;
        } else if (dist < 400) {
            this._aiState = AIState.CHASE;
        } else {
            this._aiState = AIState.RANGED;
        }
    }

    _executeAI() {
        switch (this._aiState) {
            case AIState.CHASE:   this._chaseTarget(); break;
            case AIState.ATTACK:  this._attemptAttack(); break;
            case AIState.RANGED:  this.rangedAttack(); break;
            case AIState.RETREAT: this._retreat(); break;
            default:              this.stopHorizontal();
        }
    }

    _chaseTarget() {
        const diff = this._target.x - this.x;
        if (diff > 0) this.moveRight();
        else this.moveLeft();
    }

    _attemptAttack() {
        this.stopHorizontal();
        this.setFlipX(this._target.x < this.x);
        this.attack();
    }

    _activateUltimate() {
        if (!this.ultimateReady) return;
        this.ultimateReady = false;
        this.#ultimateEnergy = mask(0);
        this._stopDangerParticles();
        
        this.scene.cameras.main.shake(200, 0.01);
        this._ultimate.activate([this._target]);
    }

    _startDangerParticles() {
        if (this._dangerParticles) this._dangerParticles.emitting = true;
        this.setTint(0xff0000);
    }

    _stopDangerParticles() {
        if (this._dangerParticles) this._dangerParticles.emitting = false;
        this.clearTint();
    }

    destroy(fromScene) {
        if (this._labelText) this._labelText.destroy();
        if (this._dangerParticles) this._dangerParticles.destroy();
        super.destroy(fromScene);
    }
}