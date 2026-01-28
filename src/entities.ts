import type {
    AreaComp,
    BodyComp,
    DoubleJumpComp,
    GameObj,
    HealthComp,
    KaboomCtx,
    OpacityComp,
    PosComp,
    ScaleComp,
    SpriteComp,
} from "kaboom";
import { scale } from "./constants";
import { globalGameState } from "./state";

type PlayerGameObj = GameObj<
    SpriteComp &
    AreaComp &
    BodyComp &
    PosComp &
    ScaleComp &
    DoubleJumpComp &
    HealthComp &
    OpacityComp & {
        speed: number;
        direction: string;
        isInhaling: boolean;
        isFull: boolean;
    }
>;

export function makePlayer(k: KaboomCtx, posX: number, posY: number) {
    const player = k.make([
        k.sprite("assets", { anim: "kirbIdle" }),
        k.area({ shape: new k.Rect(k.vec2(4, 5.9), 8, 10) }),
        k.body(), //player can collide with other objects
        k.pos(posX * scale, posY * scale), //placed at the right position
        k.scale(scale), //scales the sprite = character
        k.doubleJump(10), // how much jumps you can allow
        k.health(3), //health value
        k.opacity(1),
        {
            speed: 300,
            direction: "right",
            isInhaling: false,
            isFull: false,
        },
        "player",

    ]);

    player.onCollide("enemy", async (enemy: GameObj) => { //make enemy clash with the player
        if (player.isInhaling && enemy.isInhalable) {
            player.isInhaling = false;
            k.destroy(enemy); //inhaled the enemy which is destroyed
            player.isFull = true; //true because the player inhaled it. then it can shoot the star.
            return;
        }

        if (player.hp() === 0) { //if health reaches 0 
            k.destroy(player); // means the player died
            k.go("level-1"); //respawn
            return;
        }



        player.hurt(); // reduce 1 hp

        // gives the blinking effects when player gets hurt.
        await k.tween(
            player.opacity,
            0,
            0.05,
            (val) => (player.opacity = val),
            k.easings.linear
        );
        await k.tween(
            player.opacity,
            1,
            0.05,
            (val) => (player.opacity = val),
            k.easings.linear
        );

    });

    player.onCollide("exit", () => {
        k.go(globalGameState.nextScene); // go to the next scene from game state
    });

    const inhaleEffect = k.add([
        k.sprite("assets", { anim: "kirbInhaleEffect" }),
        k.pos(),
        k.scale(scale),
        k.opacity(0),
        "inhaleEffect",
    ]);

    const inhaleZone = player.add([
        k.area({ shape: new k.Rect(k.vec2(0), 20, 4) }),
        k.pos(),
        "inhaleZone",
    ]);

    inhaleZone.onUpdate(() => {
        if (player.direction === "left") {
            inhaleZone.pos = k.vec2(-14, 8);
            inhaleEffect.pos = k.vec2(player.pos.x - 60, player.pos.y + 0);
            inhaleEffect.flipX = true;
            return;
        }
        inhaleZone.pos = k.vec2(14, 8);
        inhaleEffect.pos = k.vec2(player.pos.x + 60, player.pos.y + 0);
        inhaleEffect.flipX = false;
    });

    player.onUpdate(() => {
        if (player.pos.y > 2000) { // if player exceeds the y position of 2000 when it falls
            k.go("level-1"); // player will respawn back to level-1
        }
    });

    return player;
}


export function setControls(k: KaboomCtx, player: PlayerGameObj) {
    const inhaleEffectRef = k.get("inhaleEffect")[0]; 

    k.onKeyDown((key) => {
        switch (key) {
            case "left":
                player.direction = "left";
                player.flipX = true;
                player.move(-player.speed, 0);
                break;
            case "right":
                player.direction = "right";
                player.flipX = false;
                player.move(player.speed, 0);
                break;
            case "z": 
                if (player.isFull) { // if player is full
                    player.play("kirbFull"); // it plays the full animation of player getting full
                    inhaleEffectRef.opacity = 0;
                    break;
                }

                player.isInhaling = true;
                player.play("kirbInhaling"); // plays the inhale animation
                inhaleEffectRef.opacity = 1; // shows the inhale effect
                break;
            default:
        }
    });
    k.onKeyPress((key) => {
        switch (key) {
            case "x": // if you press x then the player will jump
                player.doubleJump(); // allows the player to jump
                break;
            default:
        }
    });
    k.onKeyRelease((key) => {
        switch (key) {
            case "z":
                if (player.isFull) {
                    player.play("kirbInhaling");
                    const shootingStar = k.add([
                        k.sprite("assets", {
                            anim: "shootingStar",
                            flipX: player.direction === "right",
                        }),
                        k.area({ shape: new k.Rect(k.vec2(5, 4), 6, 6) }),
                        k.pos(
                            player.direction === "left"
                                ? player.pos.x - 80
                                : player.pos.x + 80,
                            player.pos.y + 5
                        ),
                        k.scale(scale),
                        player.direction === "left"
                            ? k.move(k.LEFT, 800)
                            : k.move(k.RIGHT, 800),
                        "shootingStar",
                    ]);
                    shootingStar.onCollide("platform", () => k.destroy(shootingStar));

                    player.isFull = false;
                    k.wait(1, () => player.play("kirbIdle"));
                    break;
                }

                inhaleEffectRef.opacity = 0;
                player.isInhaling = false;
                player.play("kirbIdle");
                break;
            default:
        }
    });
}

export function makeInhalable(k: KaboomCtx, enemy: GameObj) {
  enemy.onCollide("inhaleZone", () => {
    enemy.isInhalable = true;
  });

  enemy.onCollideEnd("inhaleZone", () => {
    enemy.isInhalable = false; 
  });

  //if shootingstar collides with enemy. it destroys the enemy as well as the star itself
  enemy.onCollide("shootingStar", (shootingStar: GameObj) => {
    k.destroy(enemy); 
    k.destroy(shootingStar);
  });

  const playerRef = k.get("player")[0];
  enemy.onUpdate(() => {
    if (playerRef.isInhaling && enemy.isInhalable) {
      if (playerRef.direction === "right") {
        enemy.move(-800, 0);
        return;
      }
      enemy.move(800, 0);
    }
  });
}


export function makeFlameEnemy(k: KaboomCtx, posX: number, posY: number) {
  const flame = k.add([
    k.sprite("assets", { anim: "flame" }),
    k.scale(scale),
    k.pos(posX * scale, posY * scale),
    k.area({
      shape: new k.Rect(k.vec2(4, 6), 8, 10),
      collisionIgnore: ["enemy"],
    }),
    k.body(),
    k.state("idle", ["idle", "jump"]),
    "enemy",
  ]);

  makeInhalable(k, flame);

  flame.onStateEnter("idle", async () => {
    await k.wait(1);
    flame.enterState("jump");
  });

  flame.onStateEnter("jump", async () => {
    flame.jump(1000);
  });

  flame.onStateUpdate("jump", async () => {
    if (flame.isGrounded()) {
      flame.enterState("idle");
    }
  });

  return flame;
}

export function makeGuyEnemy(k: KaboomCtx, posX: number, posY: number) { // npc that walks left and right
  const guy = k.add([
    k.sprite("assets", { anim: "guyWalk" }), // walking animation
    k.scale(scale), // scale it properly
    k.pos(posX * scale, posY * scale),  // position it correctly
    k.area({ // collision area
      shape: new k.Rect(k.vec2(2, 3.9), 12, 12), // size of the collision box
      collisionIgnore: ["enemy"], // ignore collisions with other enemies
    }),
    k.body(), // physics body
    k.state("idle", ["idle", "left", "right", "jump"]), // states for the guy npc
    { isInhalable: false, speed: 100 }, // custom properties
    "enemy",
  ]);

  makeInhalable(k, guy); // make the guy inhalable

  guy.onStateEnter("idle", async () => { // initial state
    await k.wait(1); // wait for 1 second
    guy.enterState("left"); // then start walking left
  });

  guy.onStateEnter("left", async () => { // when entering left state
    guy.flipX = false; // face left
    await k.wait(2); // walk for 2 seconds
    guy.enterState("right"); // then switch to walking right
  });

  guy.onStateUpdate("left", () => { // while in left state
    guy.move(-guy.speed, 0); // move left at defined speed
  });

  guy.onStateEnter("right", async () => { // when entering right state
    guy.flipX = true; // face right
    await k.wait(2); // walk for 2 seconds
    guy.enterState("left"); // then switch to walking left
  });

  guy.onStateUpdate("right", () => { // while in right state
    guy.move(guy.speed, 0); // move right at defined speed
  });

  return guy; // return the created guy enemy
}