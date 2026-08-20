import Phaser from 'phaser';
/**
 * Phaser game configuration factory.
 * Scenes are passed in to keep config decoupled from scene implementations.
 *
 * @param {HTMLElement} parent  - DOM element to mount the canvas into
 * @param {object}      bridge  - Shared bridge object for React↔Phaser communication
 * @returns {Phaser.Types.Core.GameConfig}
 */
export const createPhaserConfig = (parent, bridge) => ({
  type: Phaser.AUTO,
  parent,
  width: 800,
  height: 450,
  backgroundColor: '#0a0010',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 600 },
      debug: false,
    },
  },
  // Scenes are registered dynamically by GameCanvas.js
  scene: [],
  // Store bridge on game registry so scenes can access it
  callbacks: {
    preBoot: (game) => {
      game.registry.set('bridge', bridge);
    },
  },
});
