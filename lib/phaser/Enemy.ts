import Phaser from 'phaser';

const ESTATE = {
  PATROL: 'PATROL',
  ALERT: 'ALERT',
  STUN: 'STUN',
  DYING: 'DYING',
  DEAD: 'DEAD',
};

const ECFG = {
  SPEED: 80,
  ALERT_SPEED: 130,
  ALERT_RANGE: 220,
  STUN_DURATION: 2000,
  DYING_DURATION: 350,
  PATROL_MARGIN: 16,
};

export default class Enemy {
  scene: any;
  patrolLeft: number;
  patrolRight: number;
  state: string;
  dir: number;
  _stunTimer: number;
  _dyingTimer: number;
  credValue: number;
  sprite: any;
  _stunStars: any;

  constructor(scene, x, y, patrolLeft, patrolRight) {
    this.scene = scene;
    this.patrolLeft = patrolLeft;
    this.patrolRight = patrolRight;
    this.state = ESTATE.PATROL;
    this.dir = 1;
    this._stunTimer = 0;
    this._dyingTimer = 0;
    this.credValue = 10 + Math.floor(Math.random() * 10);

    this.sprite = scene.physics.add.sprite(x, y, 'enemy');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(8);
    this.sprite.body.setSize(16, 28);
    this.sprite.body.setOffset(2, 2);

    // Phaser 3.60 particle API: create emitter then stop immediately so it starts hidden.
    this._stunStars = scene.add.particles(x, y - 22, 'particle_star', {
      speed: { min: 30, max: 70 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 500,
      quantity: 2,
      frequency: 110,
      tint: [0xffff00, 0xffffff, 0x00ffff],
    });
    this._stunStars.stop();

    this._buildAnims();
    this.sprite.play('enemy_walk_anim', true);
  }

  get x() { return this.sprite?.x ?? 0; }
  get y() { return this.sprite?.y ?? 0; }
  get isDead() { return this.state === ESTATE.DEAD; }
  get isStunned() { return this.state === ESTATE.STUN; }

  _buildAnims() {
    const { anims } = this.scene;
    if (!anims.exists('enemy_walk_anim')) {
      anims.create({
        key: 'enemy_walk_anim',
        frames: [{ key: 'enemy' }, { key: 'enemy_walk' }],
        frameRate: 6,
        repeat: -1,
      });
    }
    if (!anims.exists('enemy_stun_anim')) {
      anims.create({
        key: 'enemy_stun_anim',
        frames: [{ key: 'enemy_stun' }],
        frameRate: 1,
        repeat: -1,
      });
    }
  }

  hitByGraffiti() {
    if (this.state === ESTATE.DYING || this.state === ESTATE.DEAD) return;
    this.state = ESTATE.STUN;
    this._stunTimer = ECFG.STUN_DURATION;
    if (this.sprite?.active) {
      this.sprite.setVelocityX(0);
      this.sprite.play('enemy_stun_anim', true);
      this.sprite.setTint(0xaa44ff);
    }
    this._stunStars?.start();
  }

  hitByMelee(playerX) {
    if (this.state === ESTATE.DYING || this.state === ESTATE.DEAD) return false;
    this._die(playerX);
    return true;
  }

  _die(sourceX) {
    this.state = ESTATE.DYING;
    this._dyingTimer = ECFG.DYING_DURATION;
    this._stunStars?.stop();

    if (!this.sprite?.active) return;

    const knockDir = (this.sprite.x - sourceX) > 0 ? 1 : -1;
    this.sprite.body.setVelocity(knockDir * 200, -250);
    this.sprite.body.setAllowGravity(true);
    this.sprite.setTint(0xff2222);

    this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0,
      angle: knockDir * 120,
      duration: ECFG.DYING_DURATION,
      ease: 'Power2',
    });

    const emitter = this.scene.add.particles(this.sprite.x, this.sprite.y - 10, 'particle_star', {
      speed: { min: 80, max: 200 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.3, end: 0 },
      lifespan: 550,
      quantity: 16,
      tint: [0xff2222, 0xff6600, 0xffaa00],
      duration: 150,
    });
    this.scene.time.delayedCall(1000, () => emitter.destroy());
  }

  update(delta, playerX, playerY) {
    if (this.state === ESTATE.DEAD || !this.sprite?.active) return;

    if (this.state === ESTATE.DYING) {
      this._dyingTimer -= delta;
      if (this._dyingTimer <= 0) {
        this.state = ESTATE.DEAD;
        this._safeDestroyStars();
        if (this.sprite?.active) this.sprite.destroy();
      }
      return;
    }

    if (this.state === ESTATE.STUN) {
      this._stunTimer -= delta;
      if (this.sprite?.active) {
        this.sprite.setVelocityX(0);
        this._stunStars?.setPosition(this.sprite.x, this.sprite.y - 22);
      }
      if (this._stunTimer <= 0) {
        this.state = ESTATE.PATROL;
        if (this.sprite?.active) {
          this.sprite.clearTint();
          this.sprite.play('enemy_walk_anim', true);
        }
        this._stunStars?.stop();
      }
      return;
    }

    const dist = Phaser.Math.Distance.Between(
      this.sprite.x, this.sprite.y, playerX, playerY
    );

    if (dist < ECFG.ALERT_RANGE) {
      if (this.state !== ESTATE.ALERT) {
        this.state = ESTATE.ALERT;
        this.sprite.setTint(0xff8800);
      }
    } else if (this.state === ESTATE.ALERT) {
      this.state = ESTATE.PATROL;
      this.sprite.clearTint();
    }

    const speed = this.state === ESTATE.ALERT ? ECFG.ALERT_SPEED : ECFG.SPEED;

    if (this.state === ESTATE.ALERT) {
      this.dir = playerX > this.sprite.x ? 1 : -1;
    } else {
      if (this.sprite.x <= this.patrolLeft + ECFG.PATROL_MARGIN) this.dir = 1;
      if (this.sprite.x >= this.patrolRight - ECFG.PATROL_MARGIN) this.dir = -1;
    }

    this.sprite.setVelocityX(this.dir * speed);
    this.sprite.setFlipX(this.dir < 0);
  }

  _safeDestroyStars() {
    try { this._stunStars?.destroy(); } catch (_) { }
    this._stunStars = null;
  }

  destroy() {
    this._safeDestroyStars();
    try {
      if (this.sprite?.active) this.sprite.destroy();
    } catch (_) { }
  }
}
