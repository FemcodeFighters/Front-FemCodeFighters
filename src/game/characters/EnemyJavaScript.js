import Phaser from 'phaser';
import Character, { CharacterState } from './Character';
import Ultimate from './Ultimate';

const AIState = {
    IDLE:    'ai_idle',
    CHASE:   'ai_chase',
    ATTACK:  'ai_attack',
    RANGED:  'ai_ranged',
    RETREAT: 'ai_retreat',
};

export default class EnemyJavaScript extends Character {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy_js', {
            maxHP:          100,
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
        this._debugRect = scene.add.rectangle(x, y, 34, 56, 0xf7df1e, 0.85);
        this._labelText = scene.add.text(x, y - 40, 'JS', {
            fontSize:        '12px',
            fontFamily:      'monospace',
            color:           '#000',
            backgroundColor: '#f7df1e',
            padding:         { x: 4, y: 2 },
        }).setOrigin(0.5);

        // ── Ultimate ──────────────────────────────────────────────────────
        this.ultimateEnergy    = 0;
        this.ultimateMaxEnergy = 100;
        this.ultimateReady     = false;
        this._ultimate         = new Ultimate(scene, this);

        // Energía acumulada por impacto
        this._energyPerMeleeHit  = 20;
        this._energyPerRangedHit = 35;

        // ── IA ────────────────────────────────────────────────────────────
        this._aiState       = AIState.IDLE;
        this._target        = null;
        this._thinkTimer    = 0;
        this._thinkInterval = 300;
    }

    update(delta, target) {
        super.update(delta);

        if (!target || !target.isAlive()) return;
        this._target = target;

        this._thinkTimer += delta;
        if (this._thinkTimer >= this._thinkInterval) {
            this._thinkTimer = 0;
            this._think();
        }

        this._executeAI();

        this._debugRect.setPosition(this.x, this.y);
        this._labelText.setPosition(this.x, this.y - 40);
    }

    // Llamado desde CombatScene cuando un ataque impacta al jugador
    onMeleeHit()  { this._gainEnergy(this._energyPerMeleeHit); }
    onRangedHit() { this._gainEnergy(this._energyPerRangedHit); }

    // ─────────────────────────────────────────────────────────────────────
    // IA
    // ─────────────────────────────────────────────────────────────────────
    _think() {
        if (!this._target || this.state === CharacterState.DEAD) return;

        // Ultimate automática al llenarse
        if (this.ultimateReady) {
            this._activateUltimate();
            return;
        }

        const dist = Phaser.Math.Distance.Between(
            this.x, this.y,
            this._target.x, this._target.y
        );

        // Decidir entre rango y melee aleatoriamente cuando puede
        if (dist < this.attackRange + 10) {
            // En rango melee — 30% de chance de usar proyectil de todos modos
            this._aiState = Math.random() < 0.3 ? AIState.RANGED : AIState.ATTACK;
        } else if (dist < 350) {
            // A media distancia — 40% de chance de usar proyectil
            this._aiState = Math.random() < 0.4 ? AIState.RANGED : AIState.CHASE;
        } else {
            // Lejos — siempre proyectil si puede, si no perseguir
            this._aiState = this.canRanged ? AIState.RANGED : AIState.CHASE;
        }

        // Impredecibilidad: retrocede ocasionalmente
        if (Math.random() < 0.08) {
            this._aiState = AIState.RETREAT;
            this.scene.time.delayedCall(400, () => {
                if (this._aiState === AIState.RETREAT) this._aiState = AIState.CHASE;
            });
        }
    }

    _executeAI() {
        if (this.state === CharacterState.DEAD) return;

        switch (this._aiState) {
            case AIState.CHASE:   this._chaseTarget();   break;
            case AIState.ATTACK:  this._attemptAttack(); break;
            case AIState.RANGED:  this._attemptRanged(); break;
            case AIState.RETREAT: this._retreat();       break;
            default:              this.stopHorizontal(); break;
        }
    }

    _chaseTarget() {
        if (!this._target) return;
        if (this._target.x < this.x) this.moveLeft();
        else                          this.moveRight();
        if (this.body.blocked.right || this.body.blocked.left) this.jump();
    }

    _attemptAttack() {
        if (!this.canAttack) return;
        this.scene.time.delayedCall(Phaser.Math.Between(0, 300), () => {
            if (this.isAlive() && this.canAttack) this.attack();
        });
    }

    _attemptRanged() {
        if (!this.canRanged) return;
        // Orientarse hacia el target antes de disparar
        if (this._target) {
            if (this._target.x < this.x) {
                this.facingRight = false;
                this.setFlipX(true);
            } else {
                this.facingRight = true;
                this.setFlipX(false);
            }
        }
        this.rangedAttack();
    }

    _retreat() {
        if (!this._target) return;
        if (this._target.x < this.x) this.moveRight();
        else                          this.moveLeft();
    }

    _activateUltimate() {
        if (!this.ultimateReady) return;
        if (this._isActionLocked()) return;

        this.ultimateEnergy = 0;
        this.ultimateReady  = false;
        this._ultimate.activate([this._target]);
    }

    _gainEnergy(amount) {
        if (this.ultimateReady) return;
        this.ultimateEnergy = Math.min(this.ultimateMaxEnergy, this.ultimateEnergy + amount);
        this.ultimateReady  = this.ultimateEnergy >= this.ultimateMaxEnergy;
    }

    // ─────────────────────────────────────────────────────────────────────
    // ANIMACIÓN
    // ─────────────────────────────────────────────────────────────────────
    _playAnimation() {
        switch (this.state) {
            case CharacterState.ATTACK: this._debugRect.setFillStyle(0xff9900); break;
            case CharacterState.RANGED: this._debugRect.setFillStyle(0x00ffcc); break;
            case CharacterState.HURT:   this._debugRect.setFillStyle(0xef4444); break;
            default:                    this._debugRect.setFillStyle(0xf7df1e); break;
        }
    }

    destroy(fromScene) {
        this._debugRect?.destroy();
        this._labelText?.destroy();
        this._ultimate?.destroy();
        super.destroy(fromScene);
    }
}
