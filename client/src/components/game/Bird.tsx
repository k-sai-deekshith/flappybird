import Particle, { type ParticleConfig } from './Particle';

const BIRD_STYLES = {
  cowboy: { body: '#f4ce42', hat: '#8b4513', bandana: '#cd5c5c' },
  sheriff: { body: '#e6b800', hat: '#654321', bandana: '#483d8b' },
  bandit: { body: '#4a4a4a', hat: '#1a1a1a', bandana: '#8b0000' },
  prospector: { body: '#deb887', hat: '#966f33', bandana: '#daa520' },
};

export default class Bird {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number;
  private rotation: number;
  private particles: Particle[];
  private flapAnimation: number;
  private style: keyof typeof BIRD_STYLES;

  constructor(x: number, y: number, style: keyof typeof BIRD_STYLES = 'cowboy') {
    this.x = x;
    this.y = y;
    this.width = 34;
    this.height = 24;
    this.velocity = 0;
    this.rotation = 0;
    this.particles = [];
    this.flapAnimation = 0;
    this.style = style;
  }

  setStyle(style: keyof typeof BIRD_STYLES) {
    this.style = style;
  }

  addParticles(type: 'flap' | 'hit') {
    const configs: ParticleConfig[] = [];

    if (type === 'flap') {
      // Dust particles when flapping
      for (let i = 0; i < 5; i++) {
        configs.push({
          x: this.x,
          y: this.y + this.height / 2,
          color: '#d4a373', // Desert dust color
          size: Math.random() * 3 + 1,
          speedX: -Math.random() * 2 - 1,
          speedY: (Math.random() - 0.5) * 2,
          life: 30 + Math.random() * 20
        });
      }
    } else if (type === 'hit') {
      // Explosion particles on collision
      for (let i = 0; i < 15; i++) {
        configs.push({
          x: this.x + this.width / 2,
          y: this.y + this.height / 2,
          color: BIRD_STYLES[this.style].body, // Use bird's color for feathers
          size: Math.random() * 4 + 2,
          speedX: (Math.random() - 0.5) * 6,
          speedY: (Math.random() - 0.5) * 6,
          life: 40 + Math.random() * 20
        });
      }
    }

    this.particles.push(...configs.map(config => new Particle(config)));
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Update and draw particles
    this.particles = this.particles.filter(particle => {
      particle.update();
      particle.draw(ctx);
      return particle.update();
    });

    // Draw bird with rotation based on velocity
    ctx.save();
    ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

    // Calculate rotation based on velocity
    this.rotation = Math.max(-0.5, Math.min(0.5, this.velocity * 0.05));
    ctx.rotate(this.rotation);

    const colors = BIRD_STYLES[this.style];

    // Draw western-themed bird (cowboy hat and bandana)
    ctx.fillStyle = colors.body;
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Cowboy hat
    ctx.fillStyle = colors.hat;
    ctx.fillRect(-this.width / 2, -this.height / 2 - 8, this.width * 0.8, 8);
    ctx.fillRect(-this.width / 3, -this.height / 2 - 12, this.width * 0.6, 4);

    // Bandana
    ctx.fillStyle = colors.bandana;
    ctx.fillRect(-this.width / 2, -this.height / 4, this.width, 6);

    // Eye
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.width / 4, -this.height / 6, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}