import Phaser from 'phaser';

const ATTACK_RANGE = 44;
const ATTACK_COOLDOWN = 380;

export default class CombatSystem {
  scene: any;
  player: any;
  enemies: any;
  graft: any;
  ground: any;
  platforms: any;
  walls: any;
  onPlayerHurt: any;
  _attackCooldown: number;
  _attackActive: boolean;
  _attackHitbox: any;
  _attackTimer: number;
  _floatPool: any[];

  constructor(scene, player, enemies, grafSystem, levelGroups, onPlayerHurt) {
    this.scene = scene;
    this.player = player;
    this.enemies = enemies;
    this.graft = grafSystem;
    this.ground = levelGroups.ground;
    this.platforms = levelGroups.platforms;
    this.walls = levelGroups.walls;
    this.onPlayerHurt = onPlayerHurt ?? (() => { });

    this._attackCooldown = 0;
    this._attackActive = false;
    this._attackHitbox = null;
    this._attackTimer = 0;

    this._floatPool = [];
  }

  update(delta) {
    this._attackCooldown = Math.max(0, this._attackCooldown - delta);

    if (this._attackActive) {
      this._attackTimer -= delta;
      if (this._attackTimer <= 0) this._clearAttackHitbox();
    }

    this._checkGraffitiPlatformCollisions();
    this._checkEnemyPlayerContact(delta);
    this.graft.update(delta);
  }

  triggerMeleeAttack() {
    if (this._attackCooldown > 0) return;
    this._attackCooldown = ATTACK_COOLDOWN;
    this._attackActive = true;
    this._attackTimer = 180;

    const { x, y } = this.player;
    const dir = this.player.flipX ? -1 : 1;
    const hitX = x + dir * (ATTACK_RANGE / 2 + 9);

    const fx = this.scene.add.image(x + dir * 28, y - 4, 'punch_fx').setDepth(15);
    this.scene.tweens.add({
      targets: fx,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 200,
      onComplete: () => fx.destroy(),
    });

    this.scene.cameras.main.shake(50, 0.005);

    let hitCount = 0;
    this.enemies.forEach((enemy) => {
      if (enemy.isDead) return;
      const dist = Math.abs(enemy.x - x);
      const sameLevel = Math.abs(enemy.y - y) < 40;
      const inFront = dir > 0 ? enemy.x > x : enemy.x < x;

      if (dist < ATTACK_RANGE && sameLevel && inFront) {
        const killed = enemy.hitByMelee(x);
        if (killed) {
          hitCount++;
          this._onEnemyKilled(enemy);
        }
      }
    });

    if (hitCount === 0) {
      this.scene.cameras.main.shake(30, 0.003);
    }
  }

  triggerGraffiti() {
    const { x, y } = this.player;
    const dir = this.player.flipX ? -1 : 1;
    this.graft.fire(x, y, dir);
  }

  checkGraffitiEnemyOverlaps() {
    const tagSprites = this.graft.getSprites();
    if (!tagSprites.length || !this.enemies.length) return;

    tagSprites.forEach((tagSprite) => {
      if (!tagSprite?.active) return;
      this.enemies.forEach((enemy) => {
        if (enemy.isDead || enemy.isStunned) return;
        const dist = Phaser.Math.Distance.Between(
          tagSprite.x, tagSprite.y,
          enemy.x, enemy.y
        );
        if (dist < 30) {
          enemy.hitByGraffiti();
          this.graft.onTagHit(tagSprite);
          this._showFloatText(enemy.x, enemy.y - 30, 'STUNNED!', '#aa44ff');
        }
      });
    });
  }

  _checkGraffitiPlatformCollisions() {
    const tagSprites = this.graft.getSprites();
    if (!tagSprites.length) return;

    tagSprites.forEach((tagSprite) => {
      if (!tagSprite?.active) return;

      const groups = [this.ground, this.platforms, this.walls];
      for (const group of groups) {
        const hit = this.scene.physics.overlap(tagSprite, group);
        if (hit) {
          this.graft.onTagHit(tagSprite);
          break;
        }
      }
    });
  }

  _enemyHitCooldown = 0;
  _checkEnemyPlayerContact(delta) {
    this._enemyHitCooldown = Math.max(0, this._enemyHitCooldown - delta);
    if (this._enemyHitCooldown > 0) return;
    if (this.player.isInvulnerable || this.player.isHurt) return;

    this.enemies.forEach((enemy) => {
      if (enemy.isDead || enemy.isStunned || enemy.state === 'DYING') return;

      const pBody = this.player.sprite.body;
      const eBody = enemy.sprite.body;

      const pLeft = pBody.x + 4;
      const pRight = pBody.x + pBody.width - 4;
      const pTop = pBody.y + 4;
      const pBottom = pBody.y + pBody.height - 4;

      const eLeft = eBody.x + 4;
      const eRight = eBody.x + eBody.width - 4;
      const eTop = eBody.y + 4;
      const eBottom = eBody.y + eBody.height - 4;

      const isOverlapping = !(
        pRight <= eLeft ||
        pLeft >= eRight ||
        pBottom <= eTop ||
        pTop >= eBottom
      );

      if (isOverlapping) {
        const hurt = this.player.takeDamage(enemy.sprite.x < this.player.x ? 1 : -1);
        if (hurt) {
          this.onPlayerHurt();
          this._enemyHitCooldown = 500;
          this.scene.cameras.main.shake(120, 0.012);
        }
      }
    });
  }

  checkCredPickups(credPickups) {
    credPickups.forEach((pickup) => {
      if (pickup.collected) return;
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y, pickup.x, pickup.y
      );
      if (dist < 40) {
        pickup.collected = true;
        this._collectPickup(pickup);
      }
    });
    return credPickups.filter((p) => !p.collected);
  }

  _collectPickup(pickup) {
    this.scene.tweens.add({
      targets: pickup.sprite,
      y: pickup.y - 40,
      alpha: 0,
      scale: 1.5,
      duration: 400,
      onComplete: () => pickup.sprite.destroy(),
    });
  }

  _onEnemyKilled(enemy) {
    const sprite = this.scene.physics.add.sprite(enemy.x, enemy.y - 10, 'cred_pickup');
    sprite.setDepth(9);
    sprite.body.setAllowGravity(true);
    sprite.body.setVelocity(
      Phaser.Math.Between(-60, 60),
      Phaser.Math.Between(-180, -100)
    );

    this.scene.tweens.add({
      targets: sprite,
      angle: 360,
      duration: 600,
      repeat: -1,
      ease: 'Linear',
    });

    this.scene.credPickups.push({
      sprite,
      x: sprite.x,
      y: sprite.y,
      credValue: enemy.credValue,
      collected: false,
    });

    // Sync pickup position with physics body each frame so proximity checks use real coords.
    const tick = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (!sprite?.active) { tick.remove(); return; }
        const pickup = this.scene.credPickups?.find((p) => p.sprite === sprite);
        if (pickup) { pickup.x = sprite.x; pickup.y = sprite.y; }
      },
    });

    this.scene.addKill?.();

    // Award cred + score immediately on kill (not deferred to pickup collection).
    this.scene.bridge?.onEnemyKilled?.(enemy.credValue);

    this._showFloatText(enemy.x, enemy.y - 10, 'KO!', '#ff4444');
    this._showFloatText(enemy.x, enemy.y - 30, `+${enemy.credValue} CRED`, '#ffcc00');
  }

  _showFloatText(x, y, text, color = '#ffffff') {
    const txt = this.scene.add.text(x, y, text, {
      fontFamily: 'monospace',
      fontSize: '13px',
      color,
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(50);

    this.scene.tweens.add({
      targets: txt,
      y: y - 50,
      alpha: 0,
      duration: 900,
      ease: 'Cubic.easeOut',
      onComplete: () => txt.destroy(),
    });
  }

  _clearAttackHitbox() {
    this._attackActive = false;
    this._attackHitbox?.destroy();
    this._attackHitbox = null;
  }
}
