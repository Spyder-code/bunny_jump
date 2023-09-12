import Phaser from 'phaser'
import Carrot from "./game/Carrot";
var player
var platforms
var cursors //meeting 5
var carrots //meeting 6
var carrotsCollected = 0 //meeting 6

export default class BunnyJumpScene extends Phaser.Scene
{
    constructor(){
        super('bunny-jump-scene')
    }

    preload(){
        //untuk load gambar dari tempat(folder)
        this.load.image('background', 'assets/images/bg_layer1.png')
        this.load.image('platform', 'assets/images/ground_grass.png')
        this.load.image('carrot', 'assets/images/carrot.png')
        this.load.image('bunny_jump', 'assets/images/bunny1_jump.png')
        this.load.image('bunny_stand', 'assets/images/bunny1_stand.png')
    }

    create(){
        this.add.image(240, 320, 'background').setScrollFactor(1,0)
        // setScrollFactor untuk mengatur background agar bisa bergerak sesuai kamera.
        // hanya bisa diisi 0/1. 0 artinya (selalu ada) pada layout. 
        // Kita mengatur nilai Y = 0 sehingga background akan tetap menempel pada layout meskipun Player dan Kamera berjalan terus ke atas.
    
        //this.add.image(240, 320, 'platform')

        this.platforms = this.physics.add.staticGroup() //parent 

        //membuat 5 platforms
        for (let i = 0; i < 5; i++) { 
            // mengulangi 5 kali dlm membuat platform
            // x bernilai random dari 80-400 (pick.random)
            const x = Phaser.Math.Between(80, 400) 
            const y = 150 * i // platform akan berjarak 150 px dari platform sebelumnya 
    
            //mulai membuat/ create platform child
            const platformChild = this.platforms.create(x, y,'platform')
            platformChild.setScale(0.5) //mengecilkan platform dr ukuran asli
            platformChild.refreshBody() //merefresh platform agar sesuai dg ukuran yang diminta
            // const body adalah body dr platformchild
            const body = platformChild.body
            body.updateFromGameObject()
        }

        //mula-mula player stand/ berdiri
        this.player = this.physics.add.sprite(240,320,'bunny_stand').setScale(0.5)

        // agar player tidak menembus platforms
        this.physics.add.collider(this.player,this.platforms)

        //untuk setting player agar dia tidak bergerak dan tidak collision dengan apapun
        this.player.body.checkCollision.up = false
        this.player.body.checkCollision.left = false
        this.player.body.checkCollision.right = false

        //agar kamera mengikuti arah player
        this.cameras.main.startFollow(this.player)

        //variable untuk setting inputan keyboard ke variabel cursors
        this.cursors = this.input.keyboard.createCursorKeys()

        //agar game memiliki batas layout
        this.cameras.main.setDeadzone(this.scale.width * 1.5)

        //meeting6
        //memasukkan carrot ke group, carrot yang dimaksud didapatkan dari class carrot
        //import carrot harus di sertakan di awal agar carrot bisa diakses 
        this.carrots = this.physics.add.group({
            classType: Carrot
        })
            
        //agar carrot tidak menabrak platform
        this.physics.add.collider(this.platforms, this.carrots)

        /*membuat player dan carrot overlap, jd jika player bertemu carrot maka 
        salah satu hilang*/
        this.physics.add.overlap(this.player, this.carrots, this.handleCollectCarrot, undefined, this)

        //mula-mula carrots yang collected = 0
        this.carrotsCollected = 0

        //untuk style tulisan score
        const style = {
            color: '#808000', fontSize:24 
        }

        this.carrotsCollectedText =this.add.text(240, 10, 'Carrots: 0', style)
            .setScrollFactor(0) // agar tulisan score tidak tertinggal oleh layar
            .setOrigin(0.5,0)
    }

    update(){
        // membuat bunny melompat ketika terkena platforms
        // variable lokal untuk memastikan player menyentuh bawah
        const touchingDown = this.player.body.touching.down
        //kondisi jika player menyentuh bawah
        if(touchingDown){
            //maka player akan meloncat dengan percepatan -300
            this.player.setVelocityY(-300) // -300 karena keatas
            //dan berubah animasi menjadi melompat
            this.player.setTexture('bunny_jump')
        }

        //mencari percepatan/ kecepatan player
        const vy = this.player.body.velocity.y
        //jika percepatan lebih dari 0 (sudah tidak melompat) dan animasi player bukan stand/berdiri
        if (vy > 0 && this.player.texture.key !== 'bunny_stand'){
            // buat animasi player berdiri/stand
            this.player.setTexture('bunny_stand')
        }

        //meeting 5
        //untuk mengatur arah player dengan arrow keyboard 
        //jika kursor kiri ditekan dan player tidak dalam kondisi turun maka player akan geser -200
        if (this.cursors.left.isDown && !touchingDown) {
            this.player.setVelocityX(-200)
        } else if (this.cursors.right.isDown && !touchingDown) { 
            //jika kursor kanan ditekan dan player tidak dalam kondisi turun maka player akan geser -200
            this.player.setVelocityX(200)
        } else {
            //selain kanan kiri, maka X nya tetap
            this.player.setVelocityX(0)
        }

        //mengatur setiap child platform
        this.platforms.children.iterate(child => {
            const platformChild = child //child platform sudah disimpan ke dalam var platform child
            const scrollY = this.cameras.main.scrollY //scroll camera akan disimpan ke var scrollY
            // ScrollY adalah posisi vertical kamera saat di scroll.
            if (platformChild.y >= scrollY + 700) { 
                //jika sumbu y dari platform child >= scrollY + 700 (ada di bawah kamera)
                // maka ubah letak platform child ke atas dengan jarak scrollY-(50 sampai 100)
                platformChild.y = scrollY - Phaser.Math.Between(50, 100)
                platformChild.body.updateFromGameObject() 
                //carrot akan terus di buat selama platform dibuat dan game masih berjalan
                //karna ada di daalam method update()
                //jadi carrot akan di buat sesuai dengan posisi platformchild 
                this.addCarrotAbove(platformChild)
            }
        })

        this.horizontalWrap(this.player)
    }

    //untuk mengatur agar player tidak hilang saat keluar layar
    horizontalWrap(sprite) {
        const halfWidth = sprite.displayWidth * 0.5 // halfwidth adalah setengah dari displaywidth
        const gameWidth = this.scale.width // ukuran lebar yang sesunagguhnya
        if (sprite.x < -halfWidth) {//jika player berada diluar layar (kiri)
            sprite.x = gameWidth + halfWidth//maka akan dipindah ke sebelah kanan
        } else if(sprite.x > gameWidth + halfWidth){//jika player berada diluar layar (kanan)
            sprite.x = -halfWidth//maka akan dipindah ke sebelah kiri
        }
    }

    //untuk mengatur posisi carrot yang di sesuaikan dengan posisi platform
    addCarrotAbove(sprite) {//sprite nya ini platform
        const y = sprite.y - sprite.displayHeight//untuk menentukan y carrot
        const carrot = this.carrots.get(sprite.x, y, 'carrot')//mengatur posisi carrot agar sesuai dg platform
        carrot.setActive(true) //mengaktifkan carrot
        carrot.setVisible(true) //menampilkan carrot
        // menambahkan fisik dari carrot.
        this.add.existing(carrot)
        carrot.body.setSize(carrot.width, carrot.height)
        this.physics.world.enable(carrot)
        return carrot
    }

    handleCollectCarrot(player, carrot) {
        this.carrots.killAndHide(carrot)//saat method dipanggil, carrot akan dihilangkan
        this.physics.world.disableBody(carrot.body)//disable untuk menghilangkan carrot
        this.carrotsCollected++//menambahkan score 
        const value = `Carrots: ${this.carrotsCollected}`//menampilkan value score
        this.carrotsCollectedText.text = value
    }
}