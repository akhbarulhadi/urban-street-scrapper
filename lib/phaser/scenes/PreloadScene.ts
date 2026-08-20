import Phaser from 'phaser';
/**
 * PreloadScene — generates ALL game textures procedurally using Phaser Graphics API.
 * No external image files needed. Game will never error due to missing assets.
 *
 * Textures generated:
 *  - player          : neon hoodie character (24×36)
 *  - player_run_1/2  : running animation frames
 *  - player_jump     : jump pose
 *  - enemy           : purple thug sprite (20×30)
 *  - enemy_stun      : stunned enemy (with stars)
 *  - platform        : concrete slab tile (32×16)
 *  - platform_edge_l : left edge decoration
 *  - platform_edge_r : right edge decoration
 *  - ground          : wide ground tile (32×24)
 *  - graffiti_tag    : spray projectile (14×14)
 *  - graffiti_splash : impact splash (24×24)
 *  - punch_fx        : melee hit effect (20×20)
 *  - cred_pickup     : street cred coin (12×12)
 *  - bg_building_*   : background building tiles (3 variants)
 *  - particle_star   : small particle (4×4)
 */
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  // Helpers

  // Render graphics to a named texture, then destroy the graphics object.
  _makeTexture(key, w, h, drawFn) {
    const g = this.make.graphics({ x: 0, y: 0 });
    drawFn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // Draw a rounded rectangle with optional glow stroke.
  _roundRect(g, x, y, w, h, r, fill, stroke, strokeW = 1) {
    g.fillStyle(fill, 1);
    g.fillRoundedRect(x, y, w, h, r);
    if (stroke !== undefined) {
      g.lineStyle(strokeW, stroke, 1);
      g.strokeRoundedRect(x, y, w, h, r);
    }
  }

  // Asset Generators

  _genPlayer() {
    // Base idle frame (24×36)
    this._makeTexture('player', 24, 36, (g) => {
      // Hoodie body
      g.fillStyle(0xff6600, 1);
      g.fillRect(4, 10, 16, 18);           // torso
      g.fillStyle(0xff8800, 1);
      g.fillRoundedRect(6, 0, 12, 12, 6); // head
      // Hood shadow
      g.fillStyle(0xcc4400, 1);
      g.fillRect(4, 10, 16, 4);           // collar shadow
      // Eyes — neon white
      g.fillStyle(0xffffff, 1);
      g.fillRect(8, 3, 3, 3);
      g.fillRect(13, 3, 3, 3);
      g.fillStyle(0x00ffff, 1);
      g.fillRect(9, 4, 2, 2);
      g.fillRect(14, 4, 2, 2);
      // Pants
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(4, 28, 7, 8);            // left leg
      g.fillRect(13, 28, 7, 8);           // right leg
      // Sneakers
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 34, 9, 2);
      g.fillRect(12, 34, 9, 2);
      // Arms
      g.fillStyle(0xff6600, 1);
      g.fillRect(0, 12, 4, 12);           // left arm
      g.fillRect(20, 12, 4, 12);          // right arm
      // Graffiti can on back
      g.fillStyle(0xaa00ff, 1);
      g.fillRect(20, 14, 4, 8);
      g.fillStyle(0xff00ff, 1);
      g.fillRect(21, 12, 2, 3);
    });

    // Run frame 1 — left arm forward, right arm back
    this._makeTexture('player_run_1', 24, 36, (g) => {
      g.fillStyle(0xff6600, 1);
      g.fillRect(4, 10, 16, 18);
      g.fillStyle(0xff8800, 1);
      g.fillRoundedRect(6, 0, 12, 12, 6);
      g.fillStyle(0xffffff, 1);
      g.fillRect(8, 3, 3, 3);
      g.fillRect(13, 3, 3, 3);
      g.fillStyle(0x00ffff, 1);
      g.fillRect(9, 4, 2, 2);
      g.fillRect(14, 4, 2, 2);
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(4, 28, 7, 8);
      g.fillRect(13, 28, 7, 8);
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 34, 9, 2);
      g.fillRect(12, 34, 9, 2);
      // Arms swing
      g.fillStyle(0xff6600, 1);
      g.fillRect(-2, 10, 4, 12);          // left arm forward
      g.fillRect(20, 14, 4, 12);          // right arm back
    });

    // Run frame 2 — opposite swing
    this._makeTexture('player_run_2', 24, 36, (g) => {
      g.fillStyle(0xff6600, 1);
      g.fillRect(4, 10, 16, 18);
      g.fillStyle(0xff8800, 1);
      g.fillRoundedRect(6, 0, 12, 12, 6);
      g.fillStyle(0xffffff, 1);
      g.fillRect(8, 3, 3, 3);
      g.fillRect(13, 3, 3, 3);
      g.fillStyle(0x00ffff, 1);
      g.fillRect(9, 4, 2, 2);
      g.fillRect(14, 4, 2, 2);
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(4, 28, 7, 8);
      g.fillRect(13, 28, 7, 8);
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 34, 9, 2);
      g.fillRect(12, 34, 9, 2);
      g.fillStyle(0xff6600, 1);
      g.fillRect(0, 14, 4, 12);           // left arm back
      g.fillRect(22, 10, 4, 12);          // right arm forward
    });

    // Jump frame — legs tucked up
    this._makeTexture('player_jump', 24, 32, (g) => {
      g.fillStyle(0xff6600, 1);
      g.fillRect(4, 10, 16, 15);
      g.fillStyle(0xff8800, 1);
      g.fillRoundedRect(6, 0, 12, 12, 6);
      g.fillStyle(0xffffff, 1);
      g.fillRect(8, 3, 3, 3);
      g.fillRect(13, 3, 3, 3);
      g.fillStyle(0x00ffff, 1);
      g.fillRect(9, 4, 2, 2);
      g.fillRect(14, 4, 2, 2);
      // Legs tucked
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(4, 25, 7, 5);
      g.fillRect(13, 25, 7, 5);
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 28, 9, 2);
      g.fillRect(12, 28, 9, 2);
      // Arms up
      g.fillStyle(0xff6600, 1);
      g.fillRect(-2, 8, 4, 12);
      g.fillRect(22, 8, 4, 12);
    });
  }

  _genEnemy() {
    // Idle
    this._makeTexture('enemy', 20, 30, (g) => {
      // Body — dark purple thug
      g.fillStyle(0x6600cc, 1);
      g.fillRect(3, 8, 14, 14);           // torso
      g.fillStyle(0x8800ff, 1);
      g.fillRoundedRect(4, 0, 12, 10, 5);// head
      // Mean eyes
      g.fillStyle(0xff0000, 1);
      g.fillRect(6, 2, 3, 2);
      g.fillRect(11, 2, 3, 2);
      // Mouth (scowl)
      g.fillStyle(0x330066, 1);
      g.fillRect(7, 6, 6, 1);
      // Pants
      g.fillStyle(0x1a0033, 1);
      g.fillRect(3, 22, 6, 8);
      g.fillRect(11, 22, 6, 8);
      // Boots
      g.fillStyle(0x220044, 1);
      g.fillRect(2, 28, 8, 2);
      g.fillRect(10, 28, 8, 2);
      // Arms
      g.fillStyle(0x6600cc, 1);
      g.fillRect(0, 10, 3, 10);
      g.fillRect(17, 10, 3, 10);
    });

    // Stunned — with stars orbiting
    this._makeTexture('enemy_stun', 24, 36, (g) => {
      // Same body, but tilted look
      g.fillStyle(0x6600cc, 0.7);
      g.fillRect(5, 10, 14, 14);
      g.fillStyle(0x8800ff, 0.7);
      g.fillRoundedRect(6, 2, 12, 10, 5);
      // X eyes for stunned
      g.fillStyle(0xffff00, 1);
      g.fillRect(8, 4, 2, 2);
      g.fillRect(14, 4, 2, 2);
      g.fillRect(9, 5, 2, 2);
      g.fillRect(13, 5, 2, 2);
      // Stars
      const starPositions = [[4, 0], [16, 0], [0, 6], [20, 6]];
      g.fillStyle(0xffff00, 1);
      starPositions.forEach(([sx, sy]) => {
        g.fillRect(sx, sy, 3, 3);
      });
      // Pants
      g.fillStyle(0x1a0033, 1);
      g.fillRect(5, 24, 6, 8);
      g.fillRect(13, 24, 6, 8);
    });

    // Walk frame
    this._makeTexture('enemy_walk', 20, 30, (g) => {
      g.fillStyle(0x6600cc, 1);
      g.fillRect(3, 8, 14, 14);
      g.fillStyle(0x8800ff, 1);
      g.fillRoundedRect(4, 0, 12, 10, 5);
      g.fillStyle(0xff0000, 1);
      g.fillRect(6, 2, 3, 2);
      g.fillRect(11, 2, 3, 2);
      g.fillStyle(0x1a0033, 1);
      g.fillRect(3, 22, 5, 8);
      g.fillRect(12, 22, 5, 8);
      g.fillStyle(0x220044, 1);
      g.fillRect(1, 28, 8, 2);
      g.fillRect(11, 28, 8, 2);
      g.fillStyle(0x6600cc, 1);
      g.fillRect(-1, 8, 3, 10);
      g.fillRect(18, 10, 3, 10);
    });
  }

  _genPlatforms() {
    // Standard platform tile (32×16) — concrete slab with neon edge
    this._makeTexture('platform', 32, 16, (g) => {
      g.fillStyle(0x2a2a3e, 1);
      g.fillRect(0, 0, 32, 16);
      // Surface highlight
      g.fillStyle(0x3a3a5e, 1);
      g.fillRect(0, 0, 32, 3);
      // Neon orange top edge
      g.fillStyle(0xff6600, 1);
      g.fillRect(0, 0, 32, 1);
      // Crack detail
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(8, 4, 1, 6);
      g.fillRect(20, 6, 1, 4);
    });

    // Ground tile (32×24) — thicker with graffiti marks
    this._makeTexture('ground', 32, 24, (g) => {
      g.fillStyle(0x1e1e2e, 1);
      g.fillRect(0, 0, 32, 24);
      g.fillStyle(0x2e2e4e, 1);
      g.fillRect(0, 0, 32, 4);
      // Neon stripe top
      g.fillStyle(0xff6600, 0.8);
      g.fillRect(0, 0, 32, 2);
      // Spray tag marks
      g.fillStyle(0xff00ff, 0.3);
      g.fillRect(4, 6, 8, 4);
      g.fillStyle(0x00ffff, 0.3);
      g.fillRect(18, 8, 6, 3);
    });

    // Wall tile (16×32) — for wall-jump surfaces
    this._makeTexture('wall', 16, 32, (g) => {
      g.fillStyle(0x1e1e2e, 1);
      g.fillRect(0, 0, 16, 32);
      g.fillStyle(0x2e2e4e, 1);
      g.fillRect(0, 0, 3, 32);
      g.fillStyle(0xff6600, 0.6);
      g.fillRect(0, 0, 1, 32);
      // Brick lines
      g.fillStyle(0x0e0e1e, 1);
      for (let y = 8; y < 32; y += 8) {
        g.fillRect(0, y, 16, 1);
      }
    });
  }

  _genProjectiles() {
    // Graffiti tag projectile — glowing spray bubble (14×14)
    this._makeTexture('graffiti_tag', 14, 14, (g) => {
      // Glow outer
      g.fillStyle(0xaa00ff, 0.3);
      g.fillCircle(7, 7, 7);
      // Core
      g.fillStyle(0xdd44ff, 0.9);
      g.fillCircle(7, 7, 4);
      // Bright center
      g.fillStyle(0xffffff, 1);
      g.fillCircle(7, 7, 2);
      // Nozzle tip (direction indicator)
      g.fillStyle(0xaa00ff, 1);
      g.fillRect(11, 6, 3, 2);
    });

    // Graffiti splash on impact (24×24)
    this._makeTexture('graffiti_splash', 24, 24, (g) => {
      // Splatter blobs
      const blobs = [
        [12, 12, 8, 0xdd44ff],
        [6, 6, 4, 0xaa00ff],
        [18, 8, 3, 0xff00ff],
        [8, 18, 3, 0xcc00ee],
        [18, 17, 4, 0xee22ff],
      ];
      blobs.forEach(([x, y, r, c]) => {
        g.fillStyle(c, 0.85);
        g.fillCircle(x, y, r);
      });
    });

    // Melee punch hit effect (20×20) — star drawn as polygon
    this._makeTexture('punch_fx', 20, 20, (g) => {
      // Outer glow circle
      g.fillStyle(0xffaa00, 0.7);
      g.fillCircle(10, 10, 9);
      // Inner bright core
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(10, 10, 4);
      // 4-point cross overlay
      g.fillStyle(0xffdd00, 1);
      g.fillRect(3, 8, 14, 4);
      g.fillRect(8, 3, 4, 14);
    });
  }

  _genPickups() {
    // Street Cred coin (12×12)
    this._makeTexture('cred_pickup', 12, 12, (g) => {
      g.fillStyle(0xffcc00, 1);
      g.fillCircle(6, 6, 6);
      g.fillStyle(0xff8800, 1);
      g.fillCircle(6, 6, 4);
      g.fillStyle(0xffee88, 1);
      // "$" symbol — two rects for the S
      g.fillRect(4, 2, 4, 1);
      g.fillRect(4, 5, 4, 1);
      g.fillRect(4, 8, 4, 1);
      g.fillRect(4, 2, 1, 4);
      g.fillRect(7, 5, 1, 4);
      g.fillRect(5, 1, 1, 10);
    });
  }

  _genBackground() {
    // Background building variant A (64×120)
    this._makeTexture('bg_building_a', 64, 120, (g) => {
      g.fillStyle(0x0d0d1a, 1);
      g.fillRect(0, 0, 64, 120);
      // Windows grid
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 3; col++) {
          const lit = Math.random() > 0.4;
          g.fillStyle(lit ? 0xff8800 : 0x1a1a2e, lit ? 0.8 : 1);
          g.fillRect(8 + col * 18, 10 + row * 14, 10, 8);
        }
      }
      // Rooftop antenna
      g.fillStyle(0xff6600, 0.7);
      g.fillRect(30, 0, 4, 10);
      g.fillStyle(0xff0000, 1);
      g.fillRect(29, 0, 6, 2);
    });

    // Background building variant B (48×90)
    this._makeTexture('bg_building_b', 48, 90, (g) => {
      g.fillStyle(0x0a0a18, 1);
      g.fillRect(0, 0, 48, 90);
      for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 2; col++) {
          const lit = Math.random() > 0.5;
          g.fillStyle(lit ? 0x00ccff : 0x111122, lit ? 0.7 : 1);
          g.fillRect(10 + col * 20, 8 + row * 14, 12, 9);
        }
      }
    });

    // Background building variant C (80×150)
    this._makeTexture('bg_building_c', 80, 150, (g) => {
      g.fillStyle(0x0c0c1e, 1);
      g.fillRect(0, 0, 80, 150);
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 4; col++) {
          const lit = Math.random() > 0.45;
          const colors = [0xff6600, 0x00ccff, 0xcc00ff, 0xffcc00];
          g.fillStyle(lit ? colors[col] : 0x151528, lit ? 0.6 : 1);
          g.fillRect(6 + col * 18, 8 + row * 14, 10, 8);
        }
      }
      // Graffiti art on building side
      g.fillStyle(0xff00ff, 0.25);
      g.fillRect(10, 80, 30, 20);
      g.fillStyle(0x00ffff, 0.2);
      g.fillRect(40, 90, 25, 15);
    });

    // Small particle (4×4) for effects
    this._makeTexture('particle_star', 4, 4, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillRect(1, 0, 2, 4);
      g.fillRect(0, 1, 4, 2);
    });

    // Neon sign decoration (48×20)
    this._makeTexture('neon_sign', 48, 20, (g) => {
      g.fillStyle(0x0a0010, 1);
      g.fillRect(0, 0, 48, 20);
      g.lineStyle(2, 0xff6600, 1);
      g.strokeRect(2, 2, 44, 16);
      g.fillStyle(0xff6600, 1);
      g.fillRect(4, 4, 6, 12);  // letter shapes
      g.fillRect(12, 4, 10, 2);
      g.fillRect(12, 10, 10, 2);
      g.fillRect(12, 16, 10, 2);
      g.fillRect(24, 4, 6, 12);
      g.fillRect(32, 4, 8, 2);
      g.fillRect(36, 9, 4, 2);
      g.fillRect(32, 16, 8, 2);
    });
  }

  _genLoadingBar() {
    // A simple loading progress bar bg (200×20)
    this._makeTexture('load_bar_bg', 200, 20, (g) => {
      g.fillStyle(0x111122, 1);
      g.fillRoundedRect(0, 0, 200, 20, 10);
      g.lineStyle(1, 0xff6600, 0.5);
      g.strokeRoundedRect(0, 0, 200, 20, 10);
    });
  }

  // ─── Scene Lifecycle ─────────────────────────────────────────────────────────

  create() {
    const { width, height } = this.scale;

    // Show a loading screen while generating textures
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x0a0010);
    const title = this.add.text(width / 2, height / 2 - 60, 'URBAN STREET SCRAPPER', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ff6600',
      stroke: '#000000',
      strokeThickness: 4,
    }).setOrigin(0.5);

    const statusText = this.add.text(width / 2, height / 2, 'Generating street assets...', {
      fontFamily: 'monospace',
      fontSize: '13px',
      color: '#ffffff',
    }).setOrigin(0.5).setAlpha(0.7);

    // Bar background
    const barBg = this.add.rectangle(width / 2, height / 2 + 40, 202, 22, 0x111122).setOrigin(0.5);
    this.add.rectangle(width / 2, height / 2 + 40, 200, 20, 0x111122).setOrigin(0.5);
    const bar = this.add.rectangle(width / 2 - 99, height / 2 + 40, 0, 16, 0xff6600).setOrigin(0, 0.5);

    // Generate all assets in order, updating the bar
    const steps = [
      { fn: () => this._genPlayer(), label: 'Drawing player...' },
      { fn: () => this._genEnemy(), label: 'Spawning enemies...' },
      { fn: () => this._genPlatforms(), label: 'Laying concrete...' },
      { fn: () => this._genProjectiles(), label: 'Loading spray cans...' },
      { fn: () => this._genPickups(), label: 'Dropping cred...' },
      { fn: () => this._genBackground(), label: 'Building skyline...' },
      { fn: () => this._genLoadingBar(), label: 'Finishing up...' },
    ];

    let stepIndex = 0;
    const runNextStep = () => {
      if (stepIndex >= steps.length) {
        statusText.setText('Ready! Hit the streets! 🎨');
        this.time.delayedCall(500, () => this.scene.start('MainScene'));
        return;
      }
      const step = steps[stepIndex];
      statusText.setText(step.label);
      bar.width = ((stepIndex + 1) / steps.length) * 198;
      step.fn();
      stepIndex++;
      // Use a small delay so the UI updates between heavy operations
      this.time.delayedCall(50, runNextStep);
    };

    // Kick off generation after one frame (ensures the loading UI is rendered first)
    this.time.delayedCall(100, runNextStep);

    // Pulse animation on title
    this.tweens.add({
      targets: title,
      alpha: 0.6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
