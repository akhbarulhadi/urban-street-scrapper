import Phaser from 'phaser';
/**
 * Player — encapsulates all player logic:
 *  - Physics body setup
 *  - Input handling (keyboard + potential gamepad)
 *  - State machine: IDLE | RUN | JUMP | DOUBLE_JUMP | WALL_SLIDE | DASH | HURT
 *  - Animations (driven by procedural textures from PreloadScene)
 *  - Upgrade-aware: reads playerStats from bridge for enhanced abilities
 */

const STATE = {
  IDLE: 'IDLE',
  RUN: 'RUN',
  JUMP: 'JUMP',
  DOUBLE_JUMP: 'DOUBLE_JUMP',
  WALL_SLIDE: 'WALL_SLIDE',
  DASH: 'DASH',
  HURT: 'HURT',
};

// Tunable constants
const CFG = {
  SPEED: 220,
  JUMP_VEL: -520,
  JUMP_VEL_BOOST: -680,   // with sneakers
  DOUBLE_JUMP_VEL: -460,
  WALL_JUMP_VX: 260,
  WALL_JUMP_VY: -480,
  DASH_VEL: 520,
  DASH_DURATION: 180,   // ms
  DASH_COOLDOWN: 700,   // ms
  HURT_DURATION: 800,   // ms
  COYOTE_TIME: 100,   // ms — grace jump after walking off edge
  JUMP_BUFFER: 120,   // ms — pre-press buffer
  WALL_SLIDE_VEL: 60,    // slow fall speed when wall-sliding
};

export default class Player {
  scene: any;
  bridge: any;
  state: string;
  _stats: any;
  sprite: any;
  keys: any;

  // timers/state flags
  _jumpsLeft!: number;
  _lastDir!: number;
  _coyoteTimer!: number;
  _jumpBuffer!: number;
  _dashTimer!: number;
  _dashCooldown!: number;
  _lastOnGround!: boolean;

  // Input edge-detection tracking
  _jumpPressed!: boolean;
  _dashPressed!: boolean;
  _attackPressed!: boolean;
  _grafPressed!: boolean;
  _hurtTween!: any;

  touchingWallLeft!: boolean;
  touchingWallRight!: boolean;

  _hurtTimer!: number;
  _invulnerable!: boolean;
  body!: any;

  /**
   * @param {Phaser.Scene} scene
   * @param {number} x  spawn X
   * @param {number} y  spawn Y
   * @param {object} bridge  React↔Phaser bridge
   */
  constructor(scene, x, y, bridge) {
    this.scene = scene;
    this.bridge = bridge;
    this.state = STATE.IDLE;

    // Stats from bridge (refreshed each frame in update)
    this._stats = bridge?.playerStats ?? {};

    // Phaser sprite
    this.sprite = scene.physics.add.sprite(x, y, 'player');
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setGravityY(0); // world gravity already applied
    this.sprite.setDepth(10);

    // Physics body sizing
    const body = this.sprite.body;
    body.setSize(18, 34);
    body.setOffset(3, 2);
    body.setMaxVelocityX(CFG.SPEED * 1.8);

    // Animations
    this._buildAnims();

    // Timers / flags
    this._jumpsLeft = 1;
    this._coyoteTimer = 0;
    this._jumpBuffer = 0;
    this._dashCooldown = 0;
    this._dashTimer = 0;
    this._hurtTimer = 0;
    this._invulnerable = false;
    this._lastOnGround = false;
    this._lastDir = 1;   // 1 = right, -1 = left

    // Keyboard cursors
    this.keys = scene.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      f: Phaser.Input.Keyboard.KeyCodes.F,
      g: Phaser.Input.Keyboard.KeyCodes.G,
      shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
    });

    // Track just-pressed (set in update for cleaner input handling)
    this._jumpPressed = false;
    this._attackPressed = false;
    this._grafPressed = false;

    scene.input.keyboard.on('keydown-UP', () => { this._jumpPressed = true; this._jumpBuffer = CFG.JUMP_BUFFER; });
    scene.input.keyboard.on('keydown-W', () => { this._jumpPressed = true; this._jumpBuffer = CFG.JUMP_BUFFER; });
    scene.input.keyboard.on('keydown-SPACE', () => { this._attackPressed = true; });
    scene.input.keyboard.on('keydown-F', () => { this._grafPressed = true; });
    scene.input.keyboard.on('keydown-G', () => { this._grafPressed = true; });

    // Hurt flash emitter ref
    this._hurtTween = null;

    // Wall detection sensors
    this.touchingWallLeft = false;
    this.touchingWallRight = false;

    // Expose sprite directly for colliders setup in MainScene
    this.body = this.sprite.body;
  }

  // Public Getters
  get x() { return this.sprite.x; }
  get y() { return this.sprite.y; }
  get alive() { return this.state !== STATE.HURT || this._hurtTimer > 0; }
  get isDashing() { return this.state === STATE.DASH; }
  get isHurt() { return this.state === STATE.HURT; }
  get isInvulnerable() { return this._invulnerable; }
  get flipX() { return this.sprite.flipX; }

  // Animation Setup
  _buildAnims() {
    const { anims } = this.scene;
    if (!anims.exists('player_idle')) {
      anims.create({ key: 'player_idle', frames: [{ key: 'player' }], frameRate: 1, repeat: -1 });
    }
    if (!anims.exists('player_run')) {
      anims.create({
        key: 'player_run',
        frames: [
          { key: 'player_run_1' },
          { key: 'player' },
          { key: 'player_run_2' },
          { key: 'player' },
        ],
        frameRate: 10,
        repeat: -1,
      });
    }
    if (!anims.exists('player_jump')) {
      anims.create({ key: 'player_jump', frames: [{ key: 'player_jump' }], frameRate: 1, repeat: 0 });
    }
  }


  _startDash(dir) {
    if (this.state === STATE.DASH || this._dashCooldown > 0) return;
    this.state = STATE.DASH;
    this._dashTimer = CFG.DASH_DURATION;
    this._dashCooldown = CFG.DASH_COOLDOWN;
    this.sprite.body.setVelocity(dir * CFG.DASH_VEL, 0);
    this.sprite.body.setAllowGravity(false);
    this._lastDir = dir;

    // Dash afterimage effect
    this._spawnDashTrail();
  }

  _spawnDashTrail() {
    for (let i = 0; i < 4; i++) {
      this.scene.time.delayedCall(i * 40, () => {
        const ghost = this.scene.add.sprite(this.sprite.x, this.sprite.y, 'player');
        ghost.setAlpha(0.4 - i * 0.08);
        ghost.setTint(0x00ccff);
        ghost.setFlipX(this.sprite.flipX);
        ghost.setDepth(9);
        this.scene.tweens.add({
          targets: ghost,
          alpha: 0,
          duration: 200,
          onComplete: () => ghost.destroy(),
        });
      });
    }
  }

  // Hurt
  takeDamage(knockbackDir = 1) {
    if (this.state === STATE.HURT || this._invulnerable) return false;

    this.state = STATE.HURT;
    this._hurtTimer = CFG.HURT_DURATION;

    // I-Frames (1.5 seconds of invulnerability)
    this._invulnerable = true;
    this.scene.time.delayedCall(1500, () => {
      this._invulnerable = false;
    });

    // Knockback
    this.sprite.body.setVelocity(knockbackDir * 180, -200);

    // Blink effect for I-Frames
    this._hurtTween?.stop();
    this._hurtTween = this.scene.tweens.add({
      targets: this.sprite,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 7, // 1500ms total approx
      onComplete: () => this.sprite.setAlpha(1),
    });
    this.sprite.setTint(0xff4444);

    return true;
  }

  _recoverFromHurt() {
    this.sprite.clearTint();
    // (Alpha will be cleared when I-Frame tween finishes)
    this.state = STATE.IDLE;
  }

  // Main Update
  /**
   * @param {number} delta  ms since last frame
   * @param {object} wallTiles  — { left: bool, right: bool } from MainScene collision checks
   */
  update(delta, wallTiles) {
    // Refresh stats from bridge
    this._stats = this.bridge?.playerStats ?? this._stats;

    this.touchingWallLeft = wallTiles?.left ?? false;
    this.touchingWallRight = wallTiles?.right ?? false;

    // Tick cooldowns
    if (this._dashCooldown > 0) this._dashCooldown -= delta;
    if (this._jumpBuffer > 0) this._jumpBuffer -= delta;

    const onGround = this.sprite.body.blocked.down;

    // Coyote time
    if (onGround) {
      this._coyoteTimer = CFG.COYOTE_TIME;
      this._jumpsLeft = this._stats?.jumpBoost ? 2 : 1;
    } else {
      this._coyoteTimer -= delta;
    }

    // State: HURT
    if (this.state === STATE.HURT) {
      this._hurtTimer -= delta;
      if (this._hurtTimer <= 0) this._recoverFromHurt();
      this._jumpPressed = false;
      this._attackPressed = false;
      this._grafPressed = false;
      return;
    }

    // State: DASH
    if (this.state === STATE.DASH) {
      this._dashTimer -= delta;
      if (this._dashTimer <= 0) {
        this.state = STATE.IDLE;
        this.sprite.body.setAllowGravity(true);
        this.sprite.body.setVelocityX(this._lastDir * CFG.SPEED * 0.5);
      }
      this._jumpPressed = false;
      this._attackPressed = false;
      this._grafPressed = false;
      this._updateAnim();
      return;
    }
    // Horizontal movement
    const heldLeft = this.keys.left.isDown || this.keys.a.isDown;
    const heldRight = this.keys.right.isDown || this.keys.d.isDown;

    // Trigger Dash via SHIFT
    if (Phaser.Input.Keyboard.JustDown(this.keys.shift) && this._stats?.airDash && this._dashCooldown <= 0) {
      // Dash in the direction held, or default to facing direction
      if (heldLeft) {
        this._startDash(-1);
      } else if (heldRight) {
        this._startDash(1);
      } else {
        this._startDash(this._lastDir);
      }
      return; // Skip normal movement this frame since we just started a dash
    }


    if (heldLeft) {
      this.sprite.body.setVelocityX(-CFG.SPEED);
      this.sprite.setFlipX(true);
      this._lastDir = -1;
    } else if (heldRight) {
      this.sprite.body.setVelocityX(CFG.SPEED);
      this.sprite.setFlipX(false);
      this._lastDir = 1;
    } else {
      // Friction deceleration
      this.sprite.body.setVelocityX(this.sprite.body.velocity.x * 0.75);
    }

    // Wall slide detection
    const onWallLeft = this.touchingWallLeft && heldLeft && !onGround;
    const onWallRight = this.touchingWallRight && heldRight && !onGround;
    const onWall = onWallLeft || onWallRight;

    if (onWall && this.sprite.body.velocity.y > 0) {
      this.sprite.body.setVelocityY(CFG.WALL_SLIDE_VEL);
      this.state = STATE.WALL_SLIDE;
    }

    // Jump logic (with buffer + coyote time)
    const canJump = (this._coyoteTimer > 0 || onGround) && this._jumpsLeft > 0;
    const wantJump = this._jumpPressed || this._jumpBuffer > 0;

    if (wantJump) {
      if (onWall) {
        // Wall jump!
        const wallDir = onWallRight ? -1 : 1;
        const jumpVel = this._stats?.jumpBoost ? CFG.JUMP_VEL_BOOST : CFG.JUMP_VEL;
        this.sprite.body.setVelocity(wallDir * CFG.WALL_JUMP_VX, CFG.WALL_JUMP_VY);
        this.state = STATE.JUMP;
        this._jumpsLeft = this._stats?.jumpBoost ? 1 : 0;
        this._jumpBuffer = 0;
        this._spawnJumpFX();
      } else if (canJump) {
        const jumpVel = this._stats?.jumpBoost ? CFG.JUMP_VEL_BOOST : CFG.JUMP_VEL;
        this.sprite.body.setVelocityY(jumpVel);
        this._jumpsLeft--;
        this._coyoteTimer = 0;
        this._jumpBuffer = 0;
        this.state = this._jumpsLeft > 0 ? STATE.JUMP : STATE.DOUBLE_JUMP;
        if (this._jumpsLeft === 0) this._spawnDoubleJumpFX();
        else this._spawnJumpFX();
      } else if (this._stats?.jumpBoost && this._jumpsLeft > 0 && !onGround) {
        // Mid-air double jump
        this.sprite.body.setVelocityY(CFG.DOUBLE_JUMP_VEL);
        this._jumpsLeft--;
        this._jumpBuffer = 0;
        this.state = STATE.DOUBLE_JUMP;
        this._spawnDoubleJumpFX();
      }
    }

    // Determine state for animation
    if (onGround) {
      const moving = Math.abs(this.sprite.body.velocity.x) > 20;
      this.state = moving ? STATE.RUN : STATE.IDLE;
    } else if (!onWall) {
      if (this.state !== STATE.JUMP && this.state !== STATE.DOUBLE_JUMP) {
        this.state = STATE.JUMP; // falling
      }
    }

    this._jumpPressed = false;

    this._updateAnim();
    this._lastOnGround = onGround;
  }

  // Animation Switcher
  _updateAnim() {
    const moving = Math.abs(this.sprite.body.velocity.x) > 20;
    const animToPlay = moving ? 'player_run' : 'player_idle';

    if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim?.key !== animToPlay) {
      this.sprite.play(animToPlay, true);
    }
  }

  // Jump VFX
  _spawnJumpFX() {
    const emitter = this.scene.add.particles(this.sprite.x, this.sprite.y + 16, 'particle_star', {
      speed: { min: 40, max: 100 },
      angle: { min: 220, max: 320 },
      scale: { start: 1, end: 0 },
      lifespan: 350,
      quantity: 6,
      tint: [0xff6600, 0xffaa00],
      duration: 150,
    });
    this.scene.time.delayedCall(1000, () => emitter.destroy());
  }

  _spawnDoubleJumpFX() {
    const emitter = this.scene.add.particles(this.sprite.x, this.sprite.y, 'particle_star', {
      speed: { min: 60, max: 160 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.2, end: 0 },
      lifespan: 500,
      quantity: 12,
      tint: [0x00ffff, 0x0088ff],
      duration: 150,
    });
    this.scene.time.delayedCall(1000, () => emitter.destroy());
  }

  // Expose attack/graffiti requests (consumed by MainScene)
  consumeAttack() { const v = this._attackPressed; this._attackPressed = false; return v; }
  consumeGraffiti() { const v = this._grafPressed; this._grafPressed = false; return v; }

  destroy() {
    this._hurtTween?.stop();
    this.sprite.destroy();
  }
}
