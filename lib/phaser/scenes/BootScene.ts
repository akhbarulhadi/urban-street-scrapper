import Phaser from 'phaser';
/**
 * BootScene — first scene that runs.
 * Minimal setup: just transition to PreloadScene.
 */
export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // Nothing heavy to load — all assets are generated procedurally in PreloadScene
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
