export class AudioManager {
  private context: AudioContext;
  private sounds: Map<string, AudioBuffer>;
  private bgMusic: {
    oscillator: OscillatorNode;
    modulator: OscillatorNode;
    musicGain: GainNode;
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

  public startBackgroundMusic() {
    if (this.bgMusic) return;

    // Create a western/cowboy style background music
    const oscillator = this.context.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(220, this.context.currentTime); // A3 note

    // Add tremolo effect for western feel
    const modulator = this.context.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(4, this.context.currentTime); // 4Hz tremolo

    const modulatorGain = this.context.createGain();
    modulatorGain.gain.setValueAtTime(20, this.context.currentTime);

    // Create rhythm using periodic gain changes
    const musicGain = this.context.createGain();
    musicGain.gain.setValueAtTime(0.1, this.context.currentTime);

    // Connect western style effects chain
    modulator.connect(modulatorGain);
    modulatorGain.connect(oscillator.frequency);
    oscillator.connect(musicGain);
    musicGain.connect(this.gainNode);

    // Start the oscillators
    oscillator.start();
    modulator.start();

    // Store references for cleanup
    this.bgMusic = { oscillator, modulator, musicGain };

    // Add western rhythm pattern
    this.startWesternRhythm(musicGain);
  }

  private startWesternRhythm(gainNode: GainNode) {
    const rhythm = [0.2, 0.1, 0.15, 0.1]; // Western-style rhythm pattern
    let step = 0;

    const rhythmInterval = setInterval(() => {
      if (!this.bgMusic) {
        clearInterval(rhythmInterval);
        return;
      }

      const time = this.context.currentTime;
      gainNode.gain.setValueAtTime(rhythm[step], time);
      step = (step + 1) % rhythm.length;
    }, 300); // 300ms between rhythm steps
  }

  public stopBackgroundMusic() {
    if (this.bgMusic) {
      const { oscillator, modulator, musicGain } = this.bgMusic;
      oscillator.stop();
      modulator.stop();
      musicGain.disconnect();
      this.bgMusic = null;
    }
  }
}

export const audioManager = new AudioManager();