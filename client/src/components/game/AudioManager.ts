export class AudioManager {
  private context: AudioContext;
  private sounds: Map<string, AudioBuffer>;
  private bgMusic: {
    melody: OscillatorNode[];
    harmony: OscillatorNode[];
    gains: GainNode[];
    lfo: OscillatorNode;
    masterGain: GainNode;
  } | null;
  private gainNode: GainNode;

  constructor() {
    this.context = new AudioContext();
    this.sounds = new Map();
    this.bgMusic = null;
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
    this.loadSounds();
  }

  private async loadSounds() {
    const soundEffects = {
      // Bird flap sound - higher pitched with quick decay
      flap: this.generateTone(800, 0.1, {
        waveform: 'triangle',
        decay: 8,
        frequency: 600,
      }),
      // Point scoring sound - western style "ding"
      point: this.generateTone(900, 0.15, {
        waveform: 'sine',
        decay: 4,
        frequency: 1200,
        slide: true,
      }),
      // Collision sound - low thud
      hit: this.generateTone(200, 0.2, {
        waveform: 'square',
        decay: 6,
        frequency: 150,
      }),
    };

    for (const [name, buffer] of Object.entries(soundEffects)) {
      this.sounds.set(name, buffer);
    }
  }

  private generateTone(
    frequency: number,
    duration: number,
    options: {
      waveform?: OscillatorType;
      decay?: number;
      frequency?: number;
      slide?: boolean;
    } = {}
  ): AudioBuffer {
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    const {
      waveform = 'sine',
      decay = 5,
      slide = false,
    } = options;

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      let wave;

      // Calculate the current frequency with optional slide effect
      const currentFreq = slide
        ? frequency * (1 - t * 2) // Slide down in pitch
        : frequency;

      switch (waveform) {
        case 'square':
          wave = Math.sign(Math.sin(2 * Math.PI * currentFreq * t));
          break;
        case 'triangle':
          wave = Math.asin(Math.sin(2 * Math.PI * currentFreq * t)) / (Math.PI / 2);
          break;
        default:
          wave = Math.sin(2 * Math.PI * currentFreq * t);
      }

      // Apply envelope
      data[i] = wave * Math.exp(-decay * t);
    }

    return buffer;
  }

  public playSound(name: string) {
    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);
    source.start();
  }

  private createOscillator(frequency: number, type: OscillatorType = 'sine'): OscillatorNode {
    const osc = this.context.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.context.currentTime);
    return osc;
  }

  public startBackgroundMusic() {
    if (this.bgMusic) return;

    const masterGain = this.context.createGain();
    masterGain.gain.setValueAtTime(0.1, this.context.currentTime); // Reduced overall volume

    // Western-style melody using pentatonic scale (common in cowboy music)
    const melodyNotes = [
      196.00, // G3
      220.00, // A3
      246.94, // B3
      293.66, // D4
      329.63  // E4
    ];

    // Create melody oscillators with a mix of waveforms for richer texture
    const melody = melodyNotes.map((freq, i) =>
      this.createOscillator(freq, i % 2 === 0 ? 'triangle' : 'sine')
    );

    const gains = melody.map(() => {
      const gain = this.context.createGain();
      gain.gain.setValueAtTime(0, this.context.currentTime);
      return gain;
    });

    // Create harmony oscillators (one octave lower) with different waveform
    const harmony = melodyNotes.map(freq =>
      this.createOscillator(freq * 0.5, 'triangle')
    );

    // Tremolo LFO for western guitar-like effect
    const lfo = this.context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(6, this.context.currentTime); // Faster tremolo

    const lfoGain = this.context.createGain();
    lfoGain.gain.setValueAtTime(0.2, this.context.currentTime); // More pronounced tremolo

    // Connect everything
    lfo.connect(lfoGain);
    lfoGain.connect(masterGain.gain);

    melody.forEach((osc, i) => {
      osc.connect(gains[i]);
      gains[i].connect(masterGain);
    });

    harmony.forEach((osc, i) => {
      osc.connect(gains[i]);
    });

    masterGain.connect(this.gainNode);

    // Start all oscillators
    [...melody, ...harmony, lfo].forEach(osc => osc.start());

    this.bgMusic = {
      melody,
      harmony,
      gains,
      lfo,
      masterGain
    };

    // Start the western melody pattern
    this.playWesternMelody();
  }

  private playWesternMelody() {
    if (!this.bgMusic) return;

    // Western-style chord progression pattern
    const pattern = [
      [0, 2], // Root + Third
      [1],    // Walking note
      [2, 4], // Higher harmony
      [0, 3], // Resolution
      [4],    // High note accent
      [2],    // Middle note
      [1, 3], // Tension
      [0],    // Back to root
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (!this.bgMusic) {
        clearInterval(interval);
        return;
      }

      // Reset all gains with a slight fade-out
      this.bgMusic.gains.forEach(gain => {
        gain.gain.setTargetAtTime(0, this.context.currentTime, 0.1);
      });

      // Activate notes for current step with a slight fade-in
      pattern[step].forEach(noteIndex => {
        if (this.bgMusic) {
          this.bgMusic.gains[noteIndex].gain.setTargetAtTime(0.15, this.context.currentTime, 0.05);
        }
      });

      step = (step + 1) % pattern.length;
    }, 400); // Adjusted tempo for a more natural feel
  }

  public stopBackgroundMusic() {
    if (this.bgMusic) {
      const { melody, harmony, lfo, masterGain } = this.bgMusic;
      [...melody, ...harmony, lfo].forEach(osc => {
        try {
          osc.stop();
        } catch (e) {
          // Ignore already stopped oscillators
        }
      });
      masterGain.disconnect();
      this.bgMusic = null;
    }
  }
}

export const audioManager = new AudioManager();