import { _decorator, Component, Label, Node } from 'cc';
import StorageManager from '../StorageManager';
const { ccclass, property } = _decorator;

@ccclass('MainScript')
export class MainScript extends Component {
    @property(Label)
    currentLevelLabel: Label | null = null;

    start() {
        const currentLevel = StorageManager.load<string>('currentLevel') || '2';
        if (this.currentLevelLabel) {
            this.currentLevelLabel.string = `Level ${currentLevel}`;
        }
    }
}


