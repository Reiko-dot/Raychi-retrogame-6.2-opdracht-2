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
            flame: { from: 36, to: 37, speed: 4, loop: true },
            guyIdle: 38,
            guyWalk: { from: 18, to: 19, speed: 4, loop: true },
            bird: { from: 27, to: 28, speed: 4, loop: true },
        }
    });

    k.loadSprite("level-1-renewed", "./level-1-renewed.png");

    const { map: level1Layout, spawnPoints: level1SpawnPoints } = await makeMap(
        k, "level-1-renewed");





    k.scene("level-1", () => {
        k.setGravity(2100);
        k.add([ //create game objects
            k.rect(k.width(), k.height()), k.color(k.Color.fromHex("#f7d7db")), k.fixed()]);

        k.add(level1Layout);





        const kirb = makePlayer(
            k,
            level1SpawnPoints.player[0].x,
            level1SpawnPoints.player[0].y
        );

        setControls(k, kirb)
        k.add(kirb);
        k.camScale(k.vec2(0.6, 0.6));
        k.onUpdate(() => {
            if (kirb.pos.x < level1Layout.pos.x + 400)
                k.camPos(kirb.pos.x + 800, 500);
        });

        for (const flame of level1SpawnPoints.flame) {
            makeFlameEnemy(k, flame.x, flame.y);
        }
    });

    k.go("level-1");


}

gameSetup();




