import Phaser from 'phaser';

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
  // Scenes are registered dynamically by GameCanvas
  scene: [],
  // Store bridge on registry so all scenes can access it without direct coupling
  callbacks: {
    preBoot: (game) => {
      game.registry.set('bridge', bridge);
    },
  },
});
