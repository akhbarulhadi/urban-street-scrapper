import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  _makeTexture(key, w, h, drawFn) {
    const g = this.make.graphics({ x: 0, y: 0 });
    drawFn(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  _roundRect(g, x, y, w, h, r, fill, stroke, strokeW = 1) {
    g.fillStyle(fill, 1);
    g.fillRoundedRect(x, y, w, h, r);
    if (stroke !== undefined) {
      g.lineStyle(strokeW, stroke, 1);
      g.strokeRoundedRect(x, y, w, h, r);
    }
  }

  _genPlayer() {
    this._makeTexture('player', 24, 36, (g) => {
      g.fillStyle(0xff6600, 1);
      g.fillRect(4, 10, 16, 18);
      g.fillStyle(0xff8800, 1);
      g.fillRoundedRect(6, 0, 12, 12, 6);
      g.fillStyle(0xcc4400, 1);
      g.fillRect(4, 10, 16, 4);
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
      g.fillRect(0, 12, 4, 12);
      g.fillRect(20, 12, 4, 12);
      g.fillStyle(0xaa00ff, 1);
      g.fillRect(20, 14, 4, 8);
      g.fillStyle(0xff00ff, 1);
      g.fillRect(21, 12, 2, 3);
    });

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
      g.fillStyle(0xff6600, 1);
      g.fillRect(-2, 10, 4, 12);
      g.fillRect(20, 14, 4, 12);
    });

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
      g.fillRect(0, 14, 4, 12);
      g.fillRect(22, 10, 4, 12);
    });

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
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(4, 25, 7, 5);
      g.fillRect(13, 25, 7, 5);
      g.fillStyle(0xffffff, 1);
      g.fillRect(3, 28, 9, 2);
      g.fillRect(12, 28, 9, 2);
      g.fillStyle(0xff6600, 1);
      g.fillRect(-2, 8, 4, 12);
      g.fillRect(22, 8, 4, 12);
    });
  }

  _genEnemy() {
    this._makeTexture('enemy', 20, 30, (g) => {
      g.fillStyle(0x6600cc, 1);
      g.fillRect(3, 8, 14, 14);
      g.fillStyle(0x8800ff, 1);
      g.fillRoundedRect(4, 0, 12, 10, 5);
      g.fillStyle(0xff0000, 1);
      g.fillRect(6, 2, 3, 2);
      g.fillRect(11, 2, 3, 2);
      g.fillStyle(0x330066, 1);
      g.fillRect(7, 6, 6, 1);
      g.fillStyle(0x1a0033, 1);
      g.fillRect(3, 22, 6, 8);
      g.fillRect(11, 22, 6, 8);
      g.fillStyle(0x220044, 1);
      g.fillRect(2, 28, 8, 2);
      g.fillRect(10, 28, 8, 2);
      g.fillStyle(0x6600cc, 1);
      g.fillRect(0, 10, 3, 10);
      g.fillRect(17, 10, 3, 10);
    });

    this._makeTexture('enemy_stun', 24, 36, (g) => {
      g.fillStyle(0x6600cc, 0.7);
      g.fillRect(5, 10, 14, 14);
      g.fillStyle(0x8800ff, 0.7);
      g.fillRoundedRect(6, 2, 12, 10, 5);
      g.fillStyle(0xffff00, 1);
      g.fillRect(8, 4, 2, 2);
      g.fillRect(14, 4, 2, 2);
      g.fillRect(9, 5, 2, 2);
      g.fillRect(13, 5, 2, 2);
      const starPositions = [[4, 0], [16, 0], [0, 6], [20, 6]];
      g.fillStyle(0xffff00, 1);
      starPositions.forEach(([sx, sy]) => {
        g.fillRect(sx, sy, 3, 3);
      });
      g.fillStyle(0x1a0033, 1);
      g.fillRect(5, 24, 6, 8);
      g.fillRect(13, 24, 6, 8);
    });

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
    this._makeTexture('platform', 32, 16, (g) => {
      g.fillStyle(0x2a2a3e, 1);
      g.fillRect(0, 0, 32, 16);
      g.fillStyle(0x3a3a5e, 1);
      g.fillRect(0, 0, 32, 3);
      g.fillStyle(0xff6600, 1);
      g.fillRect(0, 0, 32, 1);
      g.fillStyle(0x1a1a2e, 1);
      g.fillRect(8, 4, 1, 6);
      g.fillRect(20, 6, 1, 4);
    });

    this._makeTexture('ground', 32, 24, (g) => {
      g.fillStyle(0x1e1e2e, 1);
      g.fillRect(0, 0, 32, 24);
      g.fillStyle(0x2e2e4e, 1);
      g.fillRect(0, 0, 32, 4);
      g.fillStyle(0xff6600, 0.8);
      g.fillRect(0, 0, 32, 2);
      g.fillStyle(0xff00ff, 0.3);
      g.fillRect(4, 6, 8, 4);
      g.fillStyle(0x00ffff, 0.3);
      g.fillRect(18, 8, 6, 3);
    });

    this._makeTexture('wall', 16, 32, (g) => {
      g.fillStyle(0x1e1e2e, 1);
      g.fillRect(0, 0, 16, 32);
      g.fillStyle(0x2e2e4e, 1);
      g.fillRect(0, 0, 3, 32);
      g.fillStyle(0xff6600, 0.6);
      g.fillRect(0, 0, 1, 32);
      g.fillStyle(0x0e0e1e, 1);
      for (let y = 8; y < 32; y += 8) {
        g.fillRect(0, y, 16, 1);
      }
    });
  }

  _genProjectiles() {
    this._makeTexture('graffiti_tag', 14, 14, (g) => {
      g.fillStyle(0xaa00ff, 0.3);
      g.fillCircle(7, 7, 7);
      g.fillStyle(0xdd44ff, 0.9);
      g.fillCircle(7, 7, 4);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(7, 7, 2);
      g.fillStyle(0xaa00ff, 1);
      g.fillRect(11, 6, 3, 2);
    });

    this._makeTexture('graffiti_splash', 24, 24, (g) => {
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

    this._makeTexture('punch_fx', 20, 20, (g) => {
      g.fillStyle(0xffaa00, 0.7);
      g.fillCircle(10, 10, 9);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(10, 10, 4);
      g.fillStyle(0xffdd00, 1);
      g.fillRect(3, 8, 14, 4);
      g.fillRect(8, 3, 4, 14);
    });
  }

  _genPickups() {
    this._makeTexture('cred_pickup', 12, 12, (g) => {
      g.fillStyle(0xffcc00, 1);
      g.fillCircle(6, 6, 6);
      g.fillStyle(0xff8800, 1);
      g.fillCircle(6, 6, 4);
      g.fillStyle(0xffee88, 1);
      g.fillRect(4, 2, 4, 1);
      g.fillRect(4, 5, 4, 1);
      g.fillRect(4, 8, 4, 1);
      g.fillRect(4, 2, 1, 4);
      g.fillRect(7, 5, 1, 4);
      g.fillRect(5, 1, 1, 10);
    });
  }

  _genBackground() {
    this._makeTexture('bg_building_a', 64, 120, (g) => {
      g.fillStyle(0x0d0d1a, 1);
      g.fillRect(0, 0, 64, 120);
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 3; col++) {
          const lit = Math.random() > 0.4;
          g.fillStyle(lit ? 0xff8800 : 0x1a1a2e, lit ? 0.8 : 1);
          g.fillRect(8 + col * 18, 10 + row * 14, 10, 8);
        }
      }
      g.fillStyle(0xff6600, 0.7);
      g.fillRect(30, 0, 4, 10);
      g.fillStyle(0xff0000, 1);
      g.fillRect(29, 0, 6, 2);
    });

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
      g.fillStyle(0xff00ff, 0.25);
      g.fillRect(10, 80, 30, 20);
      g.fillStyle(0x00ffff, 0.2);
      g.fillRect(40, 90, 25, 15);
    });

    this._makeTexture('particle_star', 4, 4, (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillRect(1, 0, 2, 4);
      g.fillRect(0, 1, 4, 2);
    });

    this._makeTexture('neon_sign', 48, 20, (g) => {
      g.fillStyle(0x0a0010, 1);
      g.fillRect(0, 0, 48, 20);
      g.lineStyle(2, 0xff6600, 1);
      g.strokeRect(2, 2, 44, 16);
      g.fillStyle(0xff6600, 1);
      g.fillRect(4, 4, 6, 12);
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
    this._makeTexture('load_bar_bg', 200, 20, (g) => {
      g.fillStyle(0x111122, 1);
      g.fillRoundedRect(0, 0, 200, 20, 10);
      g.lineStyle(1, 0xff6600, 0.5);
      g.strokeRoundedRect(0, 0, 200, 20, 10);
    });
  }

  create() {
    const { width, height } = this.scale;

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

    const barBg = this.add.rectangle(width / 2, height / 2 + 40, 202, 22, 0x111122).setOrigin(0.5);
    this.add.rectangle(width / 2, height / 2 + 40, 200, 20, 0x111122).setOrigin(0.5);
    const bar = this.add.rectangle(width / 2 - 99, height / 2 + 40, 0, 16, 0xff6600).setOrigin(0, 0.5);

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
      // Small delay lets the browser repaint the progress bar between heavy generation steps.
      this.time.delayedCall(50, runNextStep);
    };

    // One-frame delay ensures the loading UI renders before generation starts.
    this.time.delayedCall(100, runNextStep);

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
