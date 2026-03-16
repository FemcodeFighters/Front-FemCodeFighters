import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {

        const {width,height}=this.scale;

        //fondo de carga
        this.add.rectangle(width/2,height/2,width,height,0x1a1a2e);


        //titulo
        this.add.text(width/2,height/2-60,'CARGANDO...',{
            fontFamily:'monospace',
            fontSize:'20px',
            color:'#ffffff',
        }).setOrigin(0.5);


        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(width/2,height/2,468,32).setStrokeStyle(1, 0x7c3aed);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(width/2-230,height/2,4,28,0x7c3aed);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

         //fondos
        // this.load.image('bg_combat', 'backgrounds/combat.png');

        // sprites de personajes
        // Cuando esten los spritesheets, se descomenta esto
        //
        // this.load.spritesheet('player', 'characters/player.png', {
        //     frameWidth: 48, frameHeight: 64
        // });
        // this.load.spritesheet('enemy_js', 'characters/enemy_js.png', {
        //     frameWidth: 48, frameHeight: 64
        // });
        // this.load.spritesheet('enemy_java', 'characters/enemy_java.png', {
        //     frameWidth: 48, frameHeight: 64
        // });
        // this.load.spritesheet('enemy_react', 'characters/enemy_react.png', {
        //     frameWidth: 48, frameHeight: 64
        // });

        // audio
        // this.load.audio('hit',    'audio/hit.wav');
        // this.load.audio('jump',   'audio/jump.wav');
        // this.load.audio('music',  'audio/combat_theme.mp3');

        //plataformas / tilemap
        // this.load.image('tiles',  'tilemaps/tiles.png');
        // this.load.tilemapTiledJSON('map', 'tilemaps/combat.json');
    }

    create ()
    {
       // Cuando todos los assets estén cargados, crear animaciones globales:
        // this._createAnimations();

        this.scene.start('MainMenu');
    }

    // Descomenta cuando tengas spritesheets
    // _createAnimations() {
    //     const anims = this.anims;
    //
    //     // Jugadora
    //     anims.create({ key: 'player_idle',   frames: anims.generateFrameNumbers('player', { start: 0,  end: 3  }), frameRate: 8,  repeat: -1 });
    //     anims.create({ key: 'player_run',    frames: anims.generateFrameNumbers('player', { start: 4,  end: 9  }), frameRate: 12, repeat: -1 });
    //     anims.create({ key: 'player_jump',   frames: anims.generateFrameNumbers('player', { start: 10, end: 12 }), frameRate: 8,  repeat: 0  });
    //     anims.create({ key: 'player_attack', frames: anims.generateFrameNumbers('player', { start: 13, end: 17 }), frameRate: 14, repeat: 0  });
    //     anims.create({ key: 'player_hurt',   frames: anims.generateFrameNumbers('player', { start: 18, end: 20 }), frameRate: 10, repeat: 0  });
    //
    //     // Enemigo JS
    //     anims.create({ key: 'enemy_js_idle',   frames: anims.generateFrameNumbers('enemy_js', { start: 0, end: 3  }), frameRate: 8,  repeat: -1 });
    //     anims.create({ key: 'enemy_js_run',    frames: anims.generateFrameNumbers('enemy_js', { start: 4, end: 9  }), frameRate: 12, repeat: -1 });
    //     anims.create({ key: 'enemy_js_attack', frames: anims.generateFrameNumbers('enemy_js', { start: 10, end: 14 }), frameRate: 14, repeat: 0  });
    // }
    }

