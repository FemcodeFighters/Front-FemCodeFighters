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

        this._prevX = x;
        this._prevY = y;
        this._targetX = x;
        this._targetY = y;
        this._targetState = CharacterState.IDLE;
        this._targetFacingRight = true;
        this._snapshotTime = Date.now();
        this._interpDuration = 80;

        this._label = scene.add
            .text(x, y - 140, playerId, {
                fontFamily: "Share Tech Mono, monospace",
                fontSize: "13px",
                color: "#00ffc8",
                stroke: "#000000",
                strokeThickness: 3,
            })
            .setOrigin(0.5, 1)
            .setDepth(100);
    }

    applyServerState(serverState) {
        const translatedY = this.scene._toClientY(serverState.y);

        this._prevX = this._targetX ?? serverState.x;
        this._prevY = this._targetY ?? translatedY;
        this._targetX = serverState.x;
        this._targetY = translatedY;
        this._targetFacingRight = serverState.facingRight;

        const wasAttacking = this._wasAttacking ?? false;
        const wasUsingUltimate = this._wasUsingUltimate ?? false;

        const isAttacking = serverState.attacking;
        const isUsingUltimate = serverState.usingUltimate;

        if (isAttacking && !wasAttacking) {
            this.canAttack = true;
            this.attack();
        }

        if (isUsingUltimate && !wasUsingUltimate) {
            this.canRanged = true;
            this.rangedAttack();
        }

        this._wasAttacking = isAttacking;
        this._wasUsingUltimate = isUsingUltimate;

        if (isAttacking || isUsingUltimate) {
            this._targetState = CharacterState.ATTACK;
        } else if (serverState.jumping) {
            this._targetState = CharacterState.JUMP;
        } else if (
            !serverState.jumping &&
            Math.abs(serverState.velocityY) > 1
        ) {
            this._targetState = CharacterState.FALL;
        } else if (
            Math.abs(serverState.x - (this._prevX ?? serverState.x)) > 2
        ) {
            this._targetState = CharacterState.RUN;
        } else {
            this._targetState = CharacterState.IDLE;
        }

        this._snapshotTime = Date.now();
        this.isJumping = serverState.jumping;
        this.isFalling = serverState.falling;
    }

    update(delta) {
        if (!this.scene || !this.active) return;

        const elapsed = Date.now() - (this._snapshotTime ?? 0);
        const t = Math.min(1, elapsed / (this._interpDuration ?? 80));

        if (this.state !== CharacterState.ATTACK) {
            this.x = Phaser.Math.Linear(
                this._prevX ?? this.x,
                this._targetX ?? this.x,
                t,
            );
            this.y = Phaser.Math.Linear(
                this._prevY ?? this.y,
                this._targetY ?? this.y,
                t,
            );
        }

        if (this._label) {
            this._label.setPosition(this.x, this.y - 140);
        }

        this.facingRight = this._targetFacingRight;
        this.setFlipX(!this._targetFacingRight);

        if (
            this.state !== this._targetState &&
            this.state !== CharacterState.DEAD
        ) {
            this.setState(this._targetState);
        }

        this._updateState();
        this._playAnimation(this.state.toLowerCase());
    }
    destroy() {
        if (this._label) this._label.destroy();
        super.destroy();
    }
}
