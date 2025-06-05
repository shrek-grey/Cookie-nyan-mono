import { _decorator, Component, Label } from 'cc';
import StorageManager from './StorageManager';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property(Label)
    currentLevelLabel: Label | null = null;

    start() {
        if(StorageManager.load<string>('currentLevel') === null) {
            StorageManager.save('currentLevel', '1'); // Initialize currentLevel if not set
        }
        const currentLevel = StorageManager.load<string>('currentLevel');
        if (this.currentLevelLabel) {
            this.currentLevelLabel.string = `Level ${currentLevel}`;
        }
    }
}