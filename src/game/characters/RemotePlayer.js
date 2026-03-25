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
    }

    applyServerState(serverState) {
    if (!this.scene) return;

    const isAttacking = serverState.attacking || serverState.isAttacking || false;
    const isUsingUltimate = serverState.usingUltimate || serverState.isUsingUltimate || false;

    const translatedY = this.scene._toClientY(serverState.y);
    this._snapshotTime = Date.now();
    this._prevX = this.x;
    this._prevY = this.y;
    this._targetX = serverState.x;
    this._targetY = translatedY;
    this._targetFacingRight = serverState.facingRight;


    if ((isAttacking || isUsingUltimate) && !this._isLockAnim) {
        console.log("!!! DISPARANDO ATAQUE REMOTO !!!");
        this._isLockAnim = true;
        this.state = CharacterState.IDLE; 
        this._isAttacking = false; 

        if (isUsingUltimate) {
            this.canRanged = true;
            this.rangedAttack(); 
        } else {
            this.canAttack = true;
            this.attack(); 
        }

        this.off('animationcomplete'); 
        this.once('animationcomplete', () => {
            this._isLockAnim = false;
        });

        this.scene.time.delayedCall(500, () => { 
            this._isLockAnim = false; 
        });
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

    update(delta) {
        if (!this.active) return;


        if (this.scene.input.keyboard.addKey('P').isDown) {
        console.log("TEST: Forzando ataque visual en RemotePlayer");
        this.canAttack = true;
        this.attack(); 
    }

        // 1. Interpolación (Movimiento suave)
        const elapsed = Date.now() - this._snapshotTime;
        const t = Math.min(1, elapsed / this._interpDuration);
        this.x = Phaser.Math.Linear(this._prevX, this._targetX, t);
        this.y = Phaser.Math.Linear(this._prevY, this._targetY, t);

        if (this._label) this._label.setPosition(this.x, this.y - 140);

        // 2. Orientación
        this.setFlipX(!this._targetFacingRight);

        // 3. Animaciones: Solo cambiamos si NO hay un ataque en curso
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