import { _decorator, Component, Label, director, CCString } from 'cc';
import StorageManager from '../StorageManager';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Label)
    lastLevelLabel: Label | null = null;
    @property(CCString)
    sceneToLoad: string = 'Game'; 

    start() {
        // if(StorageManager.load<string>('lastLevel') === null) {
        //     StorageManager.save('lastLevel', 10); // Initialize currentLevel if not set
        // }
        StorageManager.save('lastLevel', 10);
        const lastLevel = StorageManager.load<string>('lastLevel');
        if (this.lastLevelLabel) {
            this.lastLevelLabel.string = `Level ${lastLevel}`;
        }
    }

    loadGameScene() {
        const currentLevel = StorageManager.load<string>('currentLevel');
        if (currentLevel) {
            director.loadScene(this.sceneToLoad, () => {
                console.log(`Loaded scene: ${this.sceneToLoad} for level ${currentLevel}`);
            });
        } else {
            console.error('Current level is not set. Cannot load game scene.');
        }
    }
}