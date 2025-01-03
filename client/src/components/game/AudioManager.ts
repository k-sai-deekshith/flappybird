export class AudioManager {
  private context: AudioContext;
  private sounds: Map<string, AudioBuffer>;
  private bgMusic: AudioBufferSourceNode | null;
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
      flap: this.generateTone(600, 0.1),
      point: this.generateTone(800, 0.1),
      hit: this.generateTone(200, 0.2),
    };

    for (const [name, buffer] of Object.entries(soundEffects)) {
      this.sounds.set(name, buffer);
    }
  }

  private generateTone(frequency: number, duration: number): AudioBuffer {
    const sampleRate = this.context.sampleRate;
    const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * 
                Math.exp(-5 * t); // Add decay
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

    // Create a simple melody using oscillators
    const oscillator = this.context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, this.context.currentTime);

    // Add some modulation
    const modulator = this.context.createOscillator();
    modulator.type = 'sine';
    modulator.frequency.setValueAtTime(2, this.context.currentTime);

    const modulatorGain = this.context.createGain();
    modulatorGain.gain.setValueAtTime(10, this.context.currentTime);

    modulator.connect(modulatorGain);
    modulatorGain.connect(oscillator.frequency);

    const musicGain = this.context.createGain();
    musicGain.gain.setValueAtTime(0.1, this.context.currentTime);

    oscillator.connect(musicGain);
    musicGain.connect(this.gainNode);

    oscillator.start();
    modulator.start();
  }

  public stopBackgroundMusic() {
    if (this.bgMusic) {
      this.bgMusic.stop();
      this.bgMusic = null;
    }
  }
}

export const audioManager = new AudioManager();
