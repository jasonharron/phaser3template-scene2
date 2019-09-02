/*global Phaser*/
import * as ChangeScene from "./changeScene.js";
export default class Scene2 extends Phaser.Scene {
  constructor () {
    super('Scene2');
  }

  init (data) {
    // Initialization code goes here
  }

  preload () {
    // Preload assets
    //Tank sprites from https://opengameart.org/content/tank-sprite
    this.load.image("base", "./assets/sprites/tankBase.png");
    this.load.image("barrel", "./assets/sprites/tankTurret.png");
    this.load.image("bullet", "./assets/sprites/bullet.png");
    this.load.image("soda", "./assets/sprites/soda.png");

    // Declare variables for center of the scene
    this.centerX = this.cameras.main.width / 2;
    this.centerY = this.cameras.main.height / 2;
  }

  create (data) {
    // Event listener to change scenes
    ChangeScene.addChangeSceneEventListeners(this);

    //Set background color
    this.cameras.main.setBackgroundColor(0x008080);

    //Declare variables
    var barrel, bullets, enemy, bullet, enemyGroup;
    this.nextFire = 0;
    this.fireRate = 200;
    this.speed = 1000;

    //Add the base of the tank
    var base = this.add.sprite(this.centerX, this.centerY, "base");
    base.setScale(3);

    //Add the turret barrel to the tank
    this.barrel = this.add.sprite(this.centerX, this.centerY, "barrel");
    this.barrel = this.barrel.setScale(3);

    //Add bullet group with a maximum of 10 bullets at once
    this.bullets = this.physics.add.group({
      defaultKey: "bullet",
      maxSize: 10
    });

    //Automate adding of multiple enemies to a group
    this.enemyGroup = this.physics.add.group({
       key: "soda",
       repeat: 2,
       setXY: {
         x: 100,
         y: 100,
         stepX: 0,
         stepY: 200
       }
     });

     //Go through each child of the enemyGroup and scale to 0.1
     this.enemyGroup.children.iterate(function(child) {
       child.setScale(0.1);
     });

     //Create a larger enemy
    this.bigOne = this.physics.add.sprite(700, 300, "soda");
    this.bigOne.flipX = true;
    this.bigOne.setScale(0.5);

    //Add the larger enemy to the enemyGroup
    this.enemyGroup.add(this.bigOne);

    //Add event listener for movement of the mouse pointer
    this.input.on(
     "pointermove",
     function(pointer) {
       var BetweenPoints = Phaser.Math.Angle.BetweenPoints;
       var angle =
         Phaser.Math.RAD_TO_DEG * BetweenPoints(this.barrel, pointer);
         this.barrel.setAngle(angle);
       }, this
    );

    //When pointer is down, run function shoot
    this.input.on("pointerdown", this.shoot, this);
  }

  update() {
    this.bullets.children.each(
      function(b) {
        if (b.active) {
          this.physics.add.overlap(
             b,
             this.enemyGroup,
             this.hitEnemy,
             null,
             this
         );
         if (b.y < 0) {
           b.setActive(false);
         } else if (b.y > this.height) {
           b.setActive(false);
         } else if (b.x < 0) {
           b.setActive(false);
         } else if (b.x > this.width) {
           b.setActive(false);
         }
       }
      }.bind(this)
    );
  }

  shoot(pointer) {
    //Create a class called BetweenPoints
   var BetweenPoints = Phaser.Math.Angle.BetweenPoints;
   //Use BetweenPoints to calculate the angle between the tank barrel
   //and the pointer. This is returned in radians.
   var angle = BetweenPoints(this.barrel, pointer);
   //Create the variable velocity from rotation
   var velocityFromRotation = this.physics.velocityFromRotation;
   //Create a Vector2 called velocity
   //Vector2 has an x vector and y vector (velocity.x, velocity.y)
   var velocity = new Phaser.Math.Vector2();
   //Set the x and y velocity based on the radian angle and speed of bullet
   velocityFromRotation(angle, this.speed, velocity);
   //Get the next bullet from the bullets group
   var bullet = this.bullets.get();
   //Set the angle of the bullet in degrees
   bullet.setAngle(Phaser.Math.RAD_TO_DEG * angle);
   //Enable the body of the bullet and set its velocity
   bullet
     .enableBody(true, this.barrel.x, this.barrel.y, true, true)
     .setVelocity(velocity.x, velocity.y);
  }

  hitEnemy(bullet, enemy) {
       console.log("hit");
       enemy.disableBody(true, true);
       bullet.disableBody(true, true);
  }
}
