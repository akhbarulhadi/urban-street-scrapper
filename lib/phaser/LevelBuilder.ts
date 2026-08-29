import Phaser from 'phaser';

const PLATFORM_LAYOUT = [
  [80, 340, 8],
  [300, 280, 10],
  [550, 340, 6],
  [700, 240, 8],

  [900, 310, 5],
  [1050, 220, 7],
  [1250, 300, 6],
  [1420, 190, 9],
  [1650, 270, 5],

  [1850, 200, 7],
  [2050, 130, 6],
  [2250, 200, 8],
  [2500, 160, 5],

  [2700, 280, 4],
  [2820, 220, 4],
  [2940, 160, 4],
  [3060, 220, 4],
  [3180, 280, 6],

  [3400, 200, 12],
];

const WALL_LAYOUT = [
  [880, 340, 6],
  [1440, 190, 6],
  [2060, 130, 7],
  [2720, 160, 5],
];

const TILE_W = 32;
const TILE_H = 16;
const WALL_W = 16;
const WALL_H = 32;

export default class LevelBuilder {
  scene: any;
  worldWidth: number;
  worldHeight: number;

  constructor(scene, worldWidth, worldHeight) {
    this.scene = scene;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  build() {
    const ground = this._buildGround();
    const platforms = this._buildPlatforms();
    const walls = this._buildWalls();
    this._buildDecorations();
    return { ground, platforms, walls };
  }

  _buildGround() {
    const { scene, worldWidth, worldHeight } = this;
    const group = scene.physics.add.staticGroup();
    const groundY = worldHeight - 24;
    const tilesNeeded = Math.ceil(worldWidth / TILE_W) + 1;

    for (let i = 0; i < tilesNeeded; i++) {
      const tile = group.create(i * TILE_W, groundY, 'ground');
      tile.setOrigin(0, 0);
      tile.refreshBody();
    }
    return group;
  }

  _buildPlatforms() {
    const { scene } = this;
    const group = scene.physics.add.staticGroup();

    PLATFORM_LAYOUT.forEach(([x, y, tileCount]) => {
      for (let i = 0; i < tileCount; i++) {
        const tile = group.create(x + i * TILE_W, y, 'platform');
        tile.setOrigin(0, 0);
        tile.refreshBody();
      }
      this._addEdgeDots(x, y, tileCount);
    });

    return group;
  }

  _buildWalls() {
    const { scene } = this;
    const group = scene.physics.add.staticGroup();

    WALL_LAYOUT.forEach(([x, y, tileCount]) => {
      for (let i = 0; i < tileCount; i++) {
        const tile = group.create(x, y + i * WALL_H, 'wall');
        tile.setOrigin(0, 0);
        tile.refreshBody();
      }
    });

    return group;
  }

  _addEdgeDots(x, y, tileCount) {
    const { scene } = this;
    const rightEdge = x + tileCount * TILE_W;
    const dotL = scene.add.rectangle(x, y, 3, 8, 0xff6600, 0.8).setOrigin(0, 0);
    const dotR = scene.add.rectangle(rightEdge - 3, y, 3, 8, 0xff6600, 0.8).setOrigin(0, 0);
    [dotL, dotR].forEach((dot) => {
      scene.tweens.add({
        targets: dot,
        alpha: 0.3,
        duration: 800 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }

  _buildDecorations() {
    const { scene, worldWidth, worldHeight } = this;

    const lampPositions = [200, 600, 1000, 1400, 1800, 2200, 2600, 3000];
    lampPositions.forEach((lx) => {
      scene.add.rectangle(lx, worldHeight - 120, 4, 100, 0x333355).setOrigin(0.5, 1);
      const lamp = scene.add.rectangle(lx, worldHeight - 120, 20, 6, 0xffcc44).setOrigin(0.5, 1);
      scene.tweens.add({
        targets: lamp,
        alpha: 0.6,
        duration: 1200 + Math.random() * 600,
        yoyo: true,
        repeat: -1,
      });
    });

    const grafPositions = [350, 750, 1100, 1500, 1950, 2350, 2800];
    const grafColors = [0xff00ff, 0x00ffff, 0xff6600, 0xffcc00, 0x00ff88];
    grafPositions.forEach((gx, idx) => {
      const color = grafColors[idx % grafColors.length];
      const tag = scene.add.rectangle(gx, worldHeight - 30, 60, 20, color, 0.25).setOrigin(0, 1);
      scene.add.rectangle(gx + 5, worldHeight - 35, 10, 8, color, 0.4).setOrigin(0, 1);
    });

    scene.add.triangle(120, worldHeight - 60, 0, 20, 10, 0, 20, 20, 0xff6600, 0.5);
  }
}
