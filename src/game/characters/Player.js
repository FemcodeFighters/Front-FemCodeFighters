import Phaser from 'phaser';
import Character, { CharacterState } from './Character';
import { EventBus } from '../EventBus';
import Ultimate from './Ultimate';
import { generateCharacterFrames } from '../../components/molecules/characterSVG';
import { soundManager } from '../characters/effects/SoundManager';

export default class Player extends Character {
    constructor(scene, x, y) {
        super(scene, x, y, 'player', {
            maxHP:          100,
            speed:          220,
            jumpForce:      -500,
            attackDamage:   12,
            attackRange:    65,
            attackCooldown: 500,
            rangedCooldown: 5000,
            bodyW:          36,
            bodyH:          58,
            
        });
        this.projectileType = 'duck';

        // ── Debug rect — se oculta cuando carga la textura ────────────────
        this._debugRect = scene.add.rectangle(x, y, 36, 58, 0x7c3aed, 0.85);

        // ── Carga texturas animadas del personaje ─────────────────────────
        const character = scene.registry.get('character');
        if (character) {
            this._loadAnimations(character);
        }

        // ── Ultimate ──────────────────────────────────────────────────────
        this.ultimateEnergy    = 0;
        this.ultimateMaxEnergy = 100;
        this.ultimateReady     = false;
        this._ultimate         = new Ultimate(scene, this);

        this._energyPerMeleeHit  = 20;
        this._energyPerRangedHit = 35;

        this._setupControls(scene);

        EventBus.emit('player-cooldown-attack', true);
        EventBus.emit('player-cooldown-ranged', true);
        EventBus.emit('player-ultimate', { energy: 0, max: this.ultimateMaxEnergy, ready: false });
    }

    // ── Carga todos los frames SVG como texturas Phaser ───────────────────
    _loadAnimations(character) {
        const animNames = ['idle', 'run', 'attack', 'hurt', 'jump'];
        let loaded = 0;
        const total = animNames.reduce((acc, anim) => {
            return acc + generateCharacterFrames(character, anim).length;
        }, 0);

        const onAllLoaded = () => {
            // Registra animaciones en Phaser
            this.scene.anims.create({
                key:       'player-idle',
                frames:    this._buildFrameList('idle'),
                frameRate: 6,
                repeat:    -1,
            });
            this.scene.anims.create({
                key:       'player-run',
                frames:    this._buildFrameList('run'),
                frameRate: 10,
                repeat:    -1,
            });
            this.scene.anims.create({
                key:       'player-attack',
                frames:    this._buildFrameList('attack'),
                frameRate: 12,
                repeat:    0,
            });
            this.scene.anims.create({
                key:       'player-hurt',
                frames:    this._buildFrameList('hurt'),
                frameRate: 8,
                repeat:    0,
            });
            this.scene.anims.create({
                key:       'player-jump',
                frames:    this._buildFrameList('jump'),
                frameRate: 8,
                repeat:    0,
            });

            this.setTexture('player-idle-0');
            this.setDisplaySize(60, 120);
            this.body.setSize(36, 58);
            this.body.setOffset(22, 102);
            this._debugRect.setVisible(false);
            this.play('player-idle');
        };

        animNames.forEach(anim => {
            const frames = generateCharacterFrames(character, anim);
            frames.forEach((svgStr, i) => {
                const key = `player-${anim}-${i}`;
                if (this.scene.textures.exists(key)) {
                    this.scene.textures.remove(key);
                }
                const blob = new Blob([svgStr], { type: 'image/svg+xml' });
                const url  = URL.createObjectURL(blob);
                const img  = new Image();
                img.onload = () => {
                    const tex = this.scene.textures.createCanvas(key, 80, 160);
                    tex.context.drawImage(img, 0, 0);
                    tex.refresh();
                    URL.revokeObjectURL(url);
                    loaded++;
                    if (loaded === total) onAllLoaded();
                };
                img.src = url;
            });
        });
    }

    _buildFrameList(anim) {
        const frames = generateCharacterFrames(this.scene.registry.get('character'), anim);
        return frames.map((_, i) => ({ key: `player-${anim}-${i}` }));
    }

    update(delta) {
        super.update(delta);
        this._handleInput();
        this._debugRect.setPosition(this.x, this.y);
    }

    _setupControls(scene) {
        this.keys = scene.input.keyboard.addKeys({
            left:     Phaser.Input.Keyboard.KeyCodes.A,
            right:    Phaser.Input.Keyboard.KeyCodes.D,
            jump:     Phaser.Input.Keyboard.KeyCodes.W,
            jumpAlt:  Phaser.Input.Keyboard.KeyCodes.SPACE,
            jumpAlt2: Phaser.Input.Keyboard.KeyCodes.UP,
            attack:   Phaser.Input.Keyboard.KeyCodes.F,
            ranged:   Phaser.Input.Keyboard.KeyCodes.G,
            ultimate: Phaser.Input.Keyboard.KeyCodes.R,
            leftAlt:  Phaser.Input.Keyboard.KeyCodes.LEFT,
            rightAlt: Phaser.Input.Keyboard.KeyCodes.RIGHT,
        });
    }

    _handleInput() {
        if (this.state === CharacterState.DEAD) return;

        const goLeft   = this.keys.left.isDown  || this.keys.leftAlt.isDown;
        const goRight  = this.keys.right.isDown || this.keys.rightAlt.isDown;
        const doJump   = Phaser.Input.Keyboard.JustDown(this.keys.jump)    ||
                         Phaser.Input.Keyboard.JustDown(this.keys.jumpAlt) ||
                         Phaser.Input.Keyboard.JustDown(this.keys.jumpAlt2);
        const doAttack = Phaser.Input.Keyboard.JustDown(this.keys.attack);
        const doRanged = Phaser.Input.Keyboard.JustDown(this.keys.ranged);
        const doUlt    = Phaser.Input.Keyboard.JustDown(this.keys.ultimate);

        if (goLeft)       this.moveLeft();
        else if (goRight) this.moveRight();
        else              this.stopHorizontal();

        if (doJump)   this.jump();
        if (doAttack) this.attack();
        if (doRanged) this.rangedAttack();
        if (doUlt)    this._activateUltimate();
    }

    attack() {
        if (this._isActionLocked()) return;
        if (!this.canAttack) return;
        super.attack();
        EventBus.emit('player-cooldown-attack', false);
        this.scene.time.delayedCall(this.attackCooldown, () => {
            EventBus.emit('player-cooldown-attack', true);
        });
    }

   onMeleeHit() {
    this._gainEnergy(this._energyPerMeleeHit);
    soundManager.playMeleeHit();
}

    rangedAttack() {
        if (this._isActionLocked()) return;
        if (!this.canRanged) return;
        super.rangedAttack();
        EventBus.emit('player-cooldown-ranged', false);
        this.scene.time.delayedCall(this.rangedCooldown, () => {
            EventBus.emit('player-cooldown-ranged', true);
        });
    }

    onRangedHit() {
        this._gainEnergy(this._energyPerRangedHit);
    }

    _activateUltimate() {
        if (!this.ultimateReady) return;
        if (this._isActionLocked()) return;
        this.ultimateEnergy = 0;
        this.ultimateReady  = false;
        EventBus.emit('player-ultimate', { energy: 0, max: this.ultimateMaxEnergy, ready: false });
        this._ultimate.activate(this._targets ?? []);
    }

    setTargets(targets) {
        this._targets = targets;
    }

    _gainEnergy(amount) {
        if (this.ultimateReady) return;
        this.ultimateEnergy = Math.min(this.ultimateMaxEnergy, this.ultimateEnergy + amount);
        this.ultimateReady  = this.ultimateEnergy >= this.ultimateMaxEnergy;
        EventBus.emit('player-ultimate', {
            energy: this.ultimateEnergy,
            max:    this.ultimateMaxEnergy,
            ready:  this.ultimateReady,
        });
    }

    // ── Animación según estado ────────────────────────────────────────────
    _playAnimation() {
        if (!this.scene.textures.exists('player-idle-0')) {
            // Fallback al rect debug mientras cargan las texturas
            switch (this.state) {
                case CharacterState.ATTACK: this._debugRect.setFillStyle(0xf59e0b); break;
                case CharacterState.RANGED: this._debugRect.setFillStyle(0x00ccff); break;
                case CharacterState.HURT:   this._debugRect.setFillStyle(0xef4444); break;
                case CharacterState.JUMP:
                case CharacterState.FALL:   this._debugRect.setFillStyle(0x6d28d9); break;
                default:                    this._debugRect.setFillStyle(0x7c3aed); break;
            }
            return;
        }

        switch (this.state) {
            case CharacterState.IDLE:
                if (this.anims.currentAnim?.key !== 'player-idle')
                    this.play('player-idle');
                break;
            case CharacterState.RUN:
                if (this.anims.currentAnim?.key !== 'player-run')
                    this.play('player-run');
                break;
            case CharacterState.ATTACK:
                this.play('player-attack');
                break;
            case CharacterState.HURT:
                this.play('player-hurt');
                break;
            case CharacterState.JUMP:
            case CharacterState.FALL:
                if (this.anims.currentAnim?.key !== 'player-jump')
                    this.play('player-jump');
                break;
        }
    }

    destroy(fromScene) {
        this._debugRect?.destroy();
        this._ultimate?.destroy();
        super.destroy(fromScene);
    }
}
