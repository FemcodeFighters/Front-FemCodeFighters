import Character, { CharacterState } from "./Character";

export default class RemotePlayer extends Character {
    constructor(scene, x, y, texture, playerId) {
        super(scene, x, y, texture, {
            maxHP: 100,
            speed: 200,
            jumpForce: -720,
            attackDamage: 15,
            attackRange: 30,
        });

        this.playerId = playerId;
        this.body.setAllowGravity(false);
        this.body.setImmovable(true);
        this.setOrigin(0.5, 1.0);
        this.setDisplaySize(120, 120);
        this.body.setSize(40, 90);
        this.body.setOffset((128 - 40) / 2, 128 - 90);
        this._targetX = x;
        this._targetY = y;
        this._prevX = x;
        this._prevY = y;
        this._targetFacingRight = true;
        this._snapshotTime = Date.now();
        this._interpDuration = 100;
        this._targetState = CharacterState.IDLE;
        this._isLockAnim = false;
        this._pendingAction = null;
        this._lastAttackCount = 0;
        this._lastUltimateCount = 0;
    }

    applyServerState(serverState) {
        if (!this.scene) return;

        const translatedY = this.scene._toClientY(serverState.y);
        this._snapshotTime = Date.now();
        this._prevX = this.x;
        this._prevY = this.y;
        this._targetX = serverState.x;
        this._targetY = translatedY;
        this._targetFacingRight = serverState.facingRight;
        const newAttacks = (serverState.attackCount ?? 0) - this._lastAttackCount;
        const newUltimates = (serverState.ultimateCount ?? 0) - this._lastUltimateCount;
        this._lastAttackCount = serverState.attackCount ?? 0;
        this._lastUltimateCount = serverState.ultimateCount ?? 0;
        if (newUltimates > 0 || newAttacks > 0) {
            const isUltimate = newUltimates > 0;
            if (!this._isLockAnim) {
                this._triggerAttackAnim(isUltimate);
            } else {
                if (!this._pendingAction || isUltimate) {
                    this._pendingAction = isUltimate ? "ultimate" : "attack";
                }
            }
            return;
        }

        if (!this._isLockAnim) {
            if (serverState.jumping) {
                this._targetState = CharacterState.JUMP;
            } else if (Math.abs(serverState.x - this._prevX) > 0.1) {
                this._targetState = CharacterState.RUN;
            } else {
                this._targetState = CharacterState.IDLE;
            }
        }
    }

    _triggerAttackAnim(isUltimate) {
        this._isLockAnim = true;
        this._pendingAction = null;
        if (isUltimate) {
            this.canRanged = true;
            this.rangedAttack();
        } else {
            this.canAttack = true;
            this.attack();
        }
        const onComplete = () => {
            this._isLockAnim = false;
            if (this._pendingAction) {
                const wasUltimate = this._pendingAction === "ultimate";
                this._triggerAttackAnim(wasUltimate);
            }
        };
        this.once("animationcomplete", onComplete);
        this.scene.time.delayedCall(600, () => {
            if (this._isLockAnim) {
                this._isLockAnim = false;
                this.off("animationcomplete", onComplete);
                if (this._pendingAction) {
                    const wasUltimate = this._pendingAction === "ultimate";
                    this._triggerAttackAnim(wasUltimate);
                }
            }
        });
    }

    update(delta) {
        if (!this.active) return;
        const elapsed = Date.now() - this._snapshotTime;
        const t = Math.min(1, elapsed / this._interpDuration);
        this.x = Phaser.Math.Linear(this._prevX, this._targetX, t);
        this.y = Phaser.Math.Linear(this._prevY, this._targetY, t);
        if (this._label) this._label.setPosition(this.x, this.y - 140);
        this.setFlipX(!this._targetFacingRight);
        if (!this._isLockAnim) {
            if (this.state !== this._targetState) {
                this.setState(this._targetState);
            }
            const animToPlay = this.state.toLowerCase();
            this._playAnimation(animToPlay);
        }
        if (this._updateState) this._updateState();
    }
}