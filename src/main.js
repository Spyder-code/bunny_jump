import Phaser from 'phaser'

import BunnyJumpScene from './BunnyJumpScene'

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
	scene: [BunnyJumpScene],
}

export default new Phaser.Game(config)
