import Phaser from 'phaser'

import BunnyJumpScene from './BunnyJumpScene'
import GameOverScene from './GameOverScene'

const config = {
	type: Phaser.AUTO,
	parent: 'app',
	width: 480,
	height: 600,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: { y: 200 },
		},
	},
	scene: [BunnyJumpScene, GameOverScene],
}

export default new Phaser.Game(config)
