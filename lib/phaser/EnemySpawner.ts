import Phaser from 'phaser';
/**
 * EnemySpawner — defines enemy spawn points throughout the level
 * and creates Enemy instances.
 *
 * Each entry: { x, y, patrolLeft, patrolRight }
 * y should be placed just above a platform/ground surface.
 */
import Enemy from '@/lib/phaser/Enemy';

// Enemy placements — tuned to match LevelBuilder platform positions
const SPAWN_DATA = [
  // Zone 1 — The Block (ground level)
  { x:  320, y: 395, left:  200, right:  450 },
  { x:  560, y: 395, left:  480, right:  650 },
  // Zone 1 — on platform
  { x:  360, y: 262, left:  300, right:  620 },
  { x:  750, y: 220, left:  700, right:  920 },

  // Zone 2 — Downtown
  { x:  940, y: 395, left:  890, right: 1050 },
  { x: 1080, y: 202, left: 1050, right: 1280 },
  { x: 1300, y: 280, left: 1250, right: 1420 },
  { x: 1480, y: 170, left: 1420, right: 1640 },
  { x: 1680, y: 395, left: 1600, right: 1830 },

  // Zone 3 — Rooftops
  { x: 1900, y: 180, left: 1850, right: 2040 },
  { x: 2100, y: 110, left: 2050, right: 2240 },
  { x: 2290, y: 180, left: 2250, right: 2490 },
  { x: 2520, y: 140, left: 2500, right: 2700 },

  // Zone 4 — Sprint section
  { x: 2760, y: 260, left: 2700, right: 2810 },
  { x: 2880, y: 200, left: 2820, right: 2930 },
  { x: 3000, y: 140, left: 2940, right: 3060 },

  // End zone
  { x: 3450, y: 180, left: 3400, right: 3580 },
  { x: 3530, y: 180, left: 3400, right: 3600 },
];

export default class EnemySpawner {
  /**
   * @param {Phaser.Scene} scene
   * @returns {Enemy[]}   Array of spawned enemy instances
   */
  static spawn(scene) {
    return SPAWN_DATA.map(({ x, y, left, right }) =>
      new Enemy(scene, x, y, left, right)
    );
  }
}
