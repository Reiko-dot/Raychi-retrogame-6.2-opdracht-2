import { k } from "./kaboomCtx";
import { makeMap } from "./utils";
import { makePlayer, setControls, makeFlameEnemy } from "./entities"

async function gameSetup() { // load assets
    await k.loadSprite("assets", "./kirby-like.png", {
        sliceX: 9,
        sliceY: 10,
        anims: { //animation frames
            kirbIdle: 0, //first frame. starts with 0.
            kirbInhaling: 1, //second frame where kirby opens mouth to inhale. which is in the png file.
            kirbFull: 2, //kirby frame after eating an enemy. after frame 1.
            kirbInhaleEffect: { from: 3, to: 8, speed: 15, loop: true }, //frames from 3 to 8 for the inhale. speed is 15 for the looping inhale effect.
            shootingStar: 9, //single frame shooting star.
            flame: { from: 36, to: 37, speed: 4, loop: true }, //flame enemy animation frames
            guyIdle: 38, //idle frame for guy npc
            guyWalk: { from: 18, to: 19, speed: 4, loop: true }, //walking animation frames for guy npc
            bird: { from: 27, to: 28, speed: 4, loop: true }, //bird flying animation frames
        }
    });

    k.loadSprite("level-1-renewed", "./level-1-renewed.png"); // load level 1 sprite

    const { map: level1Layout, spawnPoints: level1SpawnPoints } = await makeMap( 
        k, "level-1-renewed"); // load level 1 map and spawn points





    k.scene("level-1", () => { // define level-1 scene
        k.setGravity(2100); // set gravity for the scene
        k.add([ //create game objects
            k.rect(k.width(), k.height()), k.color(k.Color.fromHex("#ffffff")), k.fixed()]); // white background

        k.add(level1Layout); // add the level layout to the scene

        const kirb = makePlayer( // create the player
            k,
            level1SpawnPoints.player[0].x, // x position from spawn points
            level1SpawnPoints.player[0].y // y position from spawn points
        );

        setControls(k, kirb) // set player controls
        k.add(kirb); // add player to the scene
        k.camScale(k.vec2(0.7, 0.7)); // set camera scale
        kirb.onUpdate(() => { // update camera position based on player position
            if (kirb.pos.x < level1Layout.pos.x + 2000) // limit camera movement to level bounds
                k.camPos(kirb.pos.x + 500, 600); // center camera on player with offset
        }); 

        for (const flame of level1SpawnPoints.flame) { // create flame enemies at spawn points
            makeFlameEnemy(k, flame.x, flame.y); // create flame enemy
        }
    });
       


    k.go("level-1"); // start the game at level-1 scene

}


gameSetup();




