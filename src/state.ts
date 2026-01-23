export const globalGameState: { // global game state object
  scenes: string[]; // list of scene names
  nextScene: string;        // name of the next scene to transition to
  currentScene: string; // name of the current active scene
  setNextScene: (sceneName: string) => void; // function to set the next scene
  setCurrentScene: (sceneName: string) => void; // function to set the current scene
} = {
  scenes: ["level-1", "level-2", "level-3", "end"], // predefined scenes
  nextScene: "",  // default next scene
  currentScene: "level-1", // default starting scene
  setCurrentScene(sceneName: string) {     // set the current scene if it exists
    if (this.scenes.includes(sceneName)) { //   check if scene exists
      this.currentScene = sceneName; //   set current scene
    }
  },
  setNextScene(sceneName: string) { // set the next scene if it exists
    if (this.scenes.includes(sceneName)) { //   check if scene exists
      this.nextScene = sceneName; //   set next scene
    }
  },
};