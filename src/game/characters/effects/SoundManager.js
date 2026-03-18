class SoundManager {
    constructor() {
        this._ctx = null;
    }

    _getContext() {
        if (!this._ctx) {
            this._ctx = new (
                window.AudioContext || window.webkitAudioContext
            )();
        }
        return this._ctx;
    }

    playMeleeHit() {
        const ctx = this._getContext();
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const dist = ctx.createWaveShaper();

        dist.curve = this._makeDistortionCurve(200);
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(220, now);
        osc1.frequency.exponentialRampToValueAtTime(60, now + 0.1);
        gain1.gain.setValueAtTime(0.6, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc1.connect(dist);
        dist.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.15);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = "bandpass";
        filter.frequency.value = 2000;
        filter.Q.value = 8;

        osc2.type = "square";
        osc2.frequency.setValueAtTime(880, now);
        osc2.frequency.exponentialRampToValueAtTime(440, now + 0.08);
        gain2.gain.setValueAtTime(0.3, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc2.connect(filter);
        filter.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now);
        osc2.stop(now + 0.12);

        const osc3 = ctx.createOscillator();
        const gain3 = ctx.createGain();

        osc3.type = "sine";
        osc3.frequency.setValueAtTime(1200, now + 0.02);
        osc3.frequency.exponentialRampToValueAtTime(300, now + 0.2);
        gain3.gain.setValueAtTime(0, now);
        gain3.gain.setValueAtTime(0.25, now + 0.02);
        gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc3.connect(gain3);
        gain3.connect(ctx.destination);
        osc3.start(now + 0.02);
        osc3.stop(now + 0.2);
    }

    playRangedShot() {
        const ctx = this._getContext();
        const now = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = "highpass";
        filter.frequency.value = 800;

        osc.type = "sine";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playHurt() {
        const ctx = this._getContext();
        const now = ctx.currentTime;

        const buffer = ctx.createBuffer(
            1,
            ctx.sampleRate * 0.15,
            ctx.sampleRate,
        );
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
        }

        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = "bandpass";
        filter.frequency.value = 400;
        filter.Q.value = 2;

        source.buffer = buffer;
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start(now);
    }

    playUltimate() {
        const ctx = this._getContext();
        const now = ctx.currentTime;

        [0, 0.05, 0.1].forEach((delay, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const freq = [200, 400, 800][i];

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, now + delay);
            osc.frequency.exponentialRampToValueAtTime(
                freq * 3,
                now + delay + 0.4,
            );
            gain.gain.setValueAtTime(0.3, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + delay);
            osc.stop(now + delay + 0.5);
        });
    }

    _makeDistortionCurve(amount) {
        const samples = 256;
        const curve = new Float32Array(samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < samples; i++) {
            const x = (i * 2) / samples - 1;
            curve[i] =
                ((3 + amount) * x * 20 * deg) /
                (Math.PI + amount * Math.abs(x));
        }
        return curve;
    }
}

export const soundManager = new SoundManager();
