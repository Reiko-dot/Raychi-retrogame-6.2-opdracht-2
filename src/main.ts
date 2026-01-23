import { k } from "./kaboomCtx"; // import kaboom context
import { makeMap } from "./utils"; // import makeMap utility
import { makePlayer, setControls, makeFlameEnemy, makeGuyEnemy } from "./entities" // import entity creation functions
import { globalGameState } from "./state"; // import global game state

async function gameSetup() { // load assets
    await k.loadSprite("assets", "./kirby-like.png", {
        sliceX: 9, // horizontal slices
        sliceY: 10, // vertical slices
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
    k.loadSprite("level-2", "./level-2.png"); // load level 2 sprite

    const { map: level1Layout, spawnPoints: level1SpawnPoints } = await makeMap( // load level 1 map and spawn points
        k, "level-1-renewed"); // load level 1 map and spawn points

    const { map: level2Layout, spawnPoints: level2SpawnPoints } = await makeMap( // load level 2 map and spawn points
        k,
        "level-2" // load level 2 map and spawn points
    );





    k.scene("level-1", async () => {
        globalGameState.setCurrentScene("level-1"); // set current scene to level-1
        globalGameState.setNextScene("level-2"); // set next scene to level-2
        k.setGravity(2100); // set gravity for the level
        k.add([
            k.rect(k.width(), k.height()), // background rectangle
            k.color(k.Color.fromHex("#ffffff")), // white color
            k.fixed(), // fixed to the camera
        ]);

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

        for (const guy of level1SpawnPoints.guy) { // create guy enemies at spawn points
            makeGuyEnemy(k, guy.x, guy.y); // create guy enemy
        }
    });



    k.scene("level-2", () => {
        globalGameState.setCurrentScene("level-2"); // set current scene to level-2
        globalGameState.setNextScene("level-3"); // set next scene to level-3
        k.setGravity(2100); // set gravity for the level
        k.add([ // background
            k.rect(k.width(), k.height()), // full screen rectangle
            k.color(k.Color.fromHex("#ffffff")), // white color
            k.fixed(), // fixed to camera
        ]);

        k.add(level2Layout); // add level layout to the scene
        const kirb = makePlayer( // create the player
            k,
            level2SpawnPoints.player[0].x, // x position from spawn points
            level2SpawnPoints.player[0].y // y position from spawn points
        );

        setControls(k, kirb); // set player controls
        k.add(kirb); // add player to the scene
        k.camScale(k.vec2(0.7, 0.7)); // set camera scale
        k.onUpdate(() => { // update camera position based on player position
            if (kirb.pos.x < level2Layout.pos.x + 2100) // limit camera movement to level bounds
                k.camPos(kirb.pos.x + 500, 700); // center camera on player with offset
        });

        for (const flame of level2SpawnPoints.flame) { // create flame enemies at spawn points
            makeFlameEnemy(k, flame.x, flame.y); // create flame enemy
        }

        if (level2SpawnPoints.guy) { // check if there are guy spawn points
            for (const guy of level2SpawnPoints.guy) { // create guy enemies at spawn points
                makeGuyEnemy(k, guy.x, guy.y); // create guy enemy
            }
        }

    });

    k.scene("start", () => { // start scene
        k.add([ // background
            k.rect(k.width(), k.height()), // full screen rectangle
            k.color(k.Color.fromHex("#cccccc")), // light gray color
            k.fixed(), // fixed to camera
        ]);

        k.add([
            k.text("KIRBY'S ADVENTURE", { size: 80, font: "sink" }), // title text
            k.pos(k.width() / 2, k.height() / 2 - 150), // center near top
            k.anchor("center"), // anchor to center
        ]);

        const btnRect = k.add([ // button rectangle
            k.rect(200, 60), // width and height
            k.color(k.Color.fromHex("#fb7d7d")), // red color
            k.pos(k.width() / 2, k.height() / 2 + 130), // center under text 
            k.anchor("center"), // anchor to center
        ]);

        const playText = k.add([ // play button text
            k.text("PLAY", { size: 32 }), // play text
            k.pos(k.width() / 2, k.height() / 2 + 130), // position on button
            k.anchor("center"), // anchor to center
            k.area(), // make it clickable
            "play-btn", // tag for click detection
        ]);

        btnRect.width = playText.width + 100; // adjust button size based on text
        btnRect.height = playText.height + 20; // adjust button size based on text

        k.onClick("play-btn", () => { // on play button click
            k.go("level-1"); // go to level 1
        });
    });

     k.scene("end", () => {});

    k.go("start"); // start the game at start scene

}


gameSetup(); 




