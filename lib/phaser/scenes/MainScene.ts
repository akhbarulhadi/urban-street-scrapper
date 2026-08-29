import Phaser from 'phaser';
import Player from '@/lib/phaser/Player';
import LevelBuilder from '@/lib/phaser/LevelBuilder';
import EnemySpawner from '@/lib/phaser/EnemySpawner';
import GraffitiSystem from '@/lib/phaser/GraffitiSystem';
import CombatSystem from '@/lib/phaser/CombatSystem';

const ZONES = [
  { name: 'THE BLOCK', minX: 0, maxX: 880 },
  { name: 'DOWNTOWN', minX: 880, maxX: 1840 },
  { name: 'ROOFTOPS', minX: 1840, maxX: 2700 },
  { name: 'THE SPRINT', minX: 2700, maxX: 3150 },
  { name: 'END ZONE', minX: 3150, maxX: 9999 },
];

export default class MainScene extends Phaser.Scene {
  bridge: any;
  _dying!: boolean;
  credPickups!: any[];
  _currentZone!: string;
  _killStreak!: number;
  _streakTimer!: number;
  _health!: number;
  _maxHealth!: number;
  levelGroups: any;
  player!: Player;
  enemies!: any[];
  grafSystem: any;
  combat: any;
  _vignette!: Phaser.GameObjects.Rectangle;
  _zoneText!: Phaser.GameObjects.Text;
  _streakText!: Phaser.GameObjects.Text;
  _hasWon!: boolean;

  constructor() {
    super({ key: 'MainScene' });
  }

  create() {
    const { width, height } = this.scale;
    const WORLD_W = 3200;

    this.bridge = this.registry.get('bridge');
    this._dying = false;
    this.credPickups = [];
    this._currentZone = '';
    this._killStreak = 0;
    this._streakTimer = 0;

    this._health = this.bridge?.playerStats?.maxHealth ?? 3;
    this._maxHealth = this._health;
    this.bridge?.onPlayerHit?.(this._health);

    this.physics.world.setBounds(0, 0, WORLD_W, height);
    this._createBackground(WORLD_W, height);

    const builder = new LevelBuilder(this, WORLD_W, height);
    this.levelGroups = builder.build();
    const { ground, platforms, walls } = this.levelGroups;

    this.player = new Player(this, 120, height - 80, this.bridge);
    this.physics.add.collider(this.player.sprite, ground);
    this.physics.add.collider(this.player.sprite, platforms);
    this.physics.add.collider(this.player.sprite, walls);

    this.enemies = EnemySpawner.spawn(this);
    this.enemies.forEach((enemy) => {
      this.physics.add.collider(enemy.sprite, ground);
      this.physics.add.collider(enemy.sprite, platforms);
    });

    this.grafSystem = new GraffitiSystem(this, this.bridge);
    this.combat = new CombatSystem(
      this,
      this.player,
      this.enemies,
      this.grafSystem,
      this.levelGroups,
      () => this._onPlayerHurt(),
    );

    this._vignette = this.add
      .rectangle(0, 0, width, height, 0xff0000, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(90)
      .setAlpha(0);

    this._zoneText = this.add.text(width / 2, height - 30, '', {
      fontFamily: 'monospace',
      fontSize: '11px',
      color: '#ff6600',
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5, 1).setScrollFactor(0).setDepth(91).setAlpha(0.7);

    this._streakText = this.add.text(width / 2, 70, '', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(92).setAlpha(0);

    this.cameras.main.fadeEffect?.reset();
    this.cameras.main.resetFX();
    this.cameras.main.setAlpha(1);
    this.cameras.main.setBounds(0, 0, WORLD_W, height);
    this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(width * 0.15, height * 0.2);
    this.cameras.main.fadeIn(500, 0, 0, 0);

    this._addZoneLabels(height);

    this.game.events.on('playerStatsUpdated', this._onStatsUpdated, this);

    this._checkZone();

    this._hasWon = false;
  }

  update(_, delta) {
    if (!this.player || this._dying) return;

    this.player.update(delta, this._getWallContacts());

    if (this.player.consumeAttack()) this.combat.triggerMeleeAttack();
    if (this.player.consumeGraffiti()) this.combat.triggerGraffiti();

    this.combat.update(delta);
    this.combat.checkGraffitiEnemyOverlaps();
    this.credPickups = this.combat.checkCredPickups(this.credPickups);

    this.enemies.forEach((e) => e.update(delta, this.player.x, this.player.y));
    this.enemies = this.enemies.filter((e) => !e.isDead);

    if (this.enemies.length === 0 && !this._hasWon && !this._dying) {
      this._hasWon = true;
      this._forceVictory();
    }

    if (this._streakTimer > 0) {
      this._streakTimer -= delta;
      if (this._streakTimer <= 0) this._resetStreak();
    }

    this._checkZone();

    if (this.player.y > this.scale.height + 100) this._forceGameOver();
  }

  _onPlayerHurt() {
    this._health = Math.max(0, this._health - 0.5);
    this.bridge?.onPlayerHit?.(this._health);
    this._flashVignette();
    if (this._health <= 0) this._forceGameOver();
  }

  _forceGameOver() {
    if (this._dying) return;
    this._dying = true;
    this._health = 0;
    this.bridge?.onPlayerHit?.(0);
    this.cameras.main.shake(400, 0.025);
    this.cameras.main.fadeOut(700, 100, 0, 0);
    this.time.delayedCall(800, () => this.bridge?.onGameOver?.());
  }

  _forceVictory() {
    if (this._dying) return;
    this.cameras.main.fadeOut(1500, 255, 255, 255);
    this.time.delayedCall(1600, () => this.bridge?.onVictory?.());
  }

  _flashVignette() {
    this._vignette.setAlpha(0.45);
    this.tweens.add({
      targets: this._vignette,
      alpha: 0,
      duration: 500,
      ease: 'Cubic.easeOut',
    });
  }

  addKill() {
    this._killStreak++;
    this._streakTimer = 3000; // 3s window to chain kills

    if (this._killStreak >= 3) {
      const bonus = this._killStreak * 5;
      this.bridge?.onEnemyKilled?.(bonus);
      this._showStreakText(this._killStreak);
    }
  }

  _showStreakText(streak) {
    const msgs = { 3: '🔥 TRIPLE!', 4: '💥 QUAD KILL!', 5: '⚡ RAMPAGE!!' };
    const msg = msgs[streak] ?? `☠️ ${streak}x COMBO!!`;
    this._streakText.setText(msg).setAlpha(1).setScale(0.5);
    this.tweens.add({
      targets: this._streakText,
      scaleX: 1.1, scaleY: 1.1,
      alpha: 0,
      duration: 1400,
      ease: 'Cubic.easeOut',
    });
  }

  _resetStreak() {
    this._killStreak = 0;
    this._streakTimer = 0;
  }

  _checkZone() {
    const px = this.player.x;
    const zone = ZONES.find((z) => px >= z.minX && px < z.maxX);
    if (!zone || zone.name === this._currentZone) return;
    this._currentZone = zone.name;

    const txt = `>> ENTERING: ${zone.name} <<`;
    this._zoneText.setText(txt).setAlpha(0.9);
    this.tweens.add({
      targets: this._zoneText,
      alpha: 0,
      duration: 3000,
      delay: 1500,
      ease: 'Cubic.easeIn',
    });
  }

  _onStatsUpdated(stats) {
    if (this.bridge) this.bridge.playerStats = stats;
    this.grafSystem?.syncStats(stats);
    const newMax = stats?.maxHealth ?? this._maxHealth;
    if (newMax > this._maxHealth) {
      this._health += newMax - this._maxHealth;
      this._maxHealth = newMax;
      this.bridge?.onPlayerHit?.(this._health);
    }
  }

  _getWallContacts() {
    let left = false, right = false;
    const px = this.player.sprite.x;
    const py = this.player.sprite.y;
    const tol = 8;

    const check = (group) => {
      group.getChildren().forEach((tile) => {
        if (!tile.active) return;
        const vertOk = py > tile.y - 10 && py < tile.y + tile.height + 10;
        if (!vertOk) return;
        if (Math.abs((px - 9) - (tile.x + tile.width)) < tol) left = true;
        if (Math.abs((px + 9) - tile.x) < tol) right = true;
      });
    };

    check(this.levelGroups.walls);
    check(this.levelGroups.platforms);
    return { left, right };
  }

  _createBackground(worldW, height) {
    this.add.rectangle(0, 0, worldW, height, 0x0a0010).setOrigin(0, 0).setScrollFactor(0.05);

    for (let i = 0; i < 4; i++) {
      this.add.rectangle(0, (height / 4) * i, 800, height / 4, 0x3d0066, 0.06 - i * 0.01)
        .setOrigin(0, 0).setScrollFactor(0);
    }

    [
      { key: 'bg_building_c', yOff: 150, sx: 0.08, alpha: 0.45, count: 42, gap: 85 },
      { key: 'bg_building_a', yOff: 120, sx: 0.18, alpha: 0.55, count: 52, gap: 68 },
      { key: 'bg_building_b', yOff: 90, sx: 0.30, alpha: 0.65, count: 64, gap: 55 },
    ].forEach(({ key, yOff, sx, alpha, count, gap }) => {
      for (let i = 0; i < count; i++) {
        this.add.image(i * gap, height - yOff, key)
          .setOrigin(0, 1).setScrollFactor(sx).setAlpha(alpha);
      }
    });

    for (let i = 0; i < 16; i++) {
      this.add.image(120 + i * 220, height - 105, 'neon_sign')
        .setOrigin(0.5, 1).setScrollFactor(0.22).setAlpha(0.45);
    }

    this.add.rectangle(0, height - 2, worldW, 2, 0xff6600, 0.4).setOrigin(0, 1);
  }

  _addZoneLabels(height) {
    ZONES.forEach(({ name, minX }) => {
      this.add.text(minX + 40, height - 50, `[ ${name} ]`, {
        fontFamily: 'monospace', fontSize: '9px',
        color: '#ff6600'
      }).setOrigin(0, 1).setAlpha(0.35);
    });
  }

  shutdown() {
    this.game.events.off('playerStatsUpdated', this._onStatsUpdated, this);
    try { this.player?.destroy(); } catch (_) { }
    try { this.grafSystem?.destroy(); } catch (_) { }
    try { this.enemies?.forEach((e) => e.destroy()); } catch (_) { }
    this.credPickups = [];
    this.enemies = [];
    this._dying = false;
  }
}
