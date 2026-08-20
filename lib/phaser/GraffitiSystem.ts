import Phaser from 'phaser';
/**
 * GraffitiTag — the player's graffiti spray projectile.
 *
 * Manages a pool of active tags and the player's ammo count.
 * Tags travel horizontally, expire after MAX_RANGE, and spawn
 * a splash effect on impact with anything.
 */

const GCFG = {
  SPEED: 400,    // px/s
  MAX_RANGE: 380,    // px before auto-destroy
  REGEN_TIME: 4000,   // ms per ammo regen tick
};

export default class GraffitiSystem {
  scene: any;
  bridge: any;
  _tags: GraffitiTag[];
  _ammo: number;
  _maxAmmo: number;
  _regenTimer: number;

  /**
   * @param {Phaser.Scene} scene
   * @param {object}       bridge  React↔Phaser bridge
   */
  constructor(scene, bridge) {
    this.scene = scene;
    this.bridge = bridge;
    this._tags = [];       // active GraffitiTag objects
    this._ammo = bridge?.playerStats?.graffitiAmmo ?? 3;
    this._maxAmmo = this._ammo;
    this._regenTimer = 0;

    // Notify React HUD of initial ammo
    this.bridge?.onAmmoChange?.(this._ammo);
  }

  get ammo() { return this._ammo; }
  get maxAmmo() { return this._maxAmmo; }

  // Refresh max ammo from latest playerStats (called after shop purchase)
  syncStats(stats) {
    const newMax = stats?.graffitiAmmo ?? this._maxAmmo;
    if (newMax > this._maxAmmo) {
      this._ammo += newMax - this._maxAmmo;
      this._maxAmmo = newMax;
      this.bridge?.onAmmoChange?.(this._ammo);
    }
  }

  // Fire
  /**
   * Attempt to fire one graffiti tag.
   * @param {number} x      Origin X (player position)
   * @param {number} y      Origin Y
   * @param {number} dir    1 = right, -1 = left
   * @returns {boolean}     true if fired, false if no ammo
   */
  fire(x, y, dir) {
    if (this._ammo <= 0) {
      this._showNoAmmoFeedback(x, y);
      return false;
    }

    this._ammo = Math.max(0, this._ammo - 1);
    this.bridge?.onAmmoChange?.(this._ammo);

    const tag = new GraffitiTag(this.scene, x, y, dir);
    this._tags.push(tag);
    return true;
  }

  // Update
  /** @param {number} delta ms */
  update(delta) {
    // Ammo regen
    if (this._ammo < this._maxAmmo) {
      this._regenTimer += delta;
      if (this._regenTimer >= GCFG.REGEN_TIME) {
        this._regenTimer = 0;
        this._ammo = Math.min(this._maxAmmo, this._ammo + 1);
        this.bridge?.onAmmoChange?.(this._ammo);
      }
    }

    // Update each tag
    this._tags = this._tags.filter((tag) => {
      tag.update(delta);
      return !tag.isDead;
    });
  }

  // Getters for collision
  // Returns all live tag sprites for overlap checks
  getSprites() {
    return this._tags.filter((t) => !t.isDead).map((t) => t.sprite);
  }

  // Called by CombatSystem when a tag hits something
  onTagHit(sprite) {
    const tag = this._tags.find((t) => t.sprite === sprite);
    if (tag) tag.explode();
  }

  // No-ammo feedback
  _showNoAmmoFeedback(x, y) {
    const txt = this.scene.add.text(x, y - 30, 'NO AMMO!', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ff4444',
      stroke: '#000',
      strokeThickness: 2,
    }).setOrigin(0.5).setDepth(50);
    this.scene.tweens.add({
      targets: txt,
      y: y - 60,
      alpha: 0,
      duration: 700,
      onComplete: () => txt.destroy(),
    });
  }

  destroy() {
    this._tags.forEach((t) => t.destroy());
    this._tags = [];
  }
}

// Single Graffiti Tag

class GraffitiTag {
  scene: any;
  dir: number;
  _distTravelled: number;
  isDead: boolean;
  sprite: any;
  _pulseTween: any;

  constructor(scene, x, y, dir) {
    this.scene = scene;
    this.dir = dir;
    this._distTravelled = 0;
    this.isDead = false;

    this.sprite = scene.physics.add.sprite(x, y - 8, 'graffiti_tag');
    this.sprite.setDepth(12);
    this.sprite.body.setAllowGravity(false);
    this.sprite.body.setVelocityX(dir * GCFG.SPEED);
    this.sprite.setFlipX(dir < 0);

    // Trailing glow tween
    this._pulseTween = scene.tweens.add({
      targets: this.sprite,
      alpha: 0.7,
      duration: 120,
      yoyo: true,
      repeat: -1,
    });
  }

  update(delta) {
    if (this.isDead) return;
    this._distTravelled += Math.abs(GCFG.SPEED) * (delta / 1000);
    if (this._distTravelled >= GCFG.MAX_RANGE) {
      this.explode();
    }
  }

  // Trigger impact explosion and mark as dead
  explode() {
    if (this.isDead) return;
    this.isDead = true;
    this._pulseTween?.stop();

    const { x, y } = this.sprite;

    // Splash effect
    const emitter = this.scene.add.particles(x, y, 'graffiti_splash', {
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 500,
      quantity: 8,
      tint: [0xcc44ff, 0xff00ff, 0xaa00ff],
      duration: 150,
    });
    this.scene.time.delayedCall(1000, () => emitter.destroy());

    // Splash image that fades
    const splash = this.scene.add.image(x, y, 'graffiti_splash').setDepth(11).setAlpha(0.9);
    this.scene.tweens.add({
      targets: splash,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      onComplete: () => splash.destroy(),
    });

    this.sprite.destroy();
  }

  destroy() {
    this._pulseTween?.stop();
    if (!this.isDead) this.sprite?.destroy();
    this.isDead = true;
  }
}
