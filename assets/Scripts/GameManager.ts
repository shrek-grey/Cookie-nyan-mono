import { _decorator, Component, Label } from 'cc';
import StorageManager from './StorageManager';

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
  @property(Label)
  currentLevelLabel: Label | null = null;

  start() {
    const currentLevel = StorageManager.load<string>('currentLevel') || '1';
    if (this.currentLevelLabel) {
      this.currentLevelLabel.string = `Level ${currentLevel}`;
    }
  }
}