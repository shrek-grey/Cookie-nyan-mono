import { _decorator, Component, Prefab, Node, instantiate } from 'cc';
import StorageManager from '../StorageManager';
import { ZoomPopup } from '../Effect/Animation/ZoomPopup';
const { ccclass, property } = _decorator;

@ccclass('PopupManager')
export class PopupManager extends Component {
    @property(Node)
    overlay: Node | null = null;

    @property(Node)
    levelView: Node | null = null;

    @property(Node)
    levelPopup: Node | null = null;

    @property(Node)
    levelPopup_under_5: Node | null = null;

    public currentPopup: Node | null = null;

    showLevelViewPopup() {
        console.log("showLevelViewPopup called");
        if (this.levelView) {
            const popup = this.levelView.getComponent(ZoomPopup);
            popup.show();

        } else {
            console.warn('LevelView Popup prefab is not assigned.');
        }
        this.overlay.active = true;
    }


    showLevelPopup_open(_: Event, level: string) {
        console.log("showLevelPopup_open called with level:", level);
        let currentLevel = StorageManager.load<number>('currentLevel') ? StorageManager.load<number>('currentLevel') : StorageManager.load<number>('lastLevel');
        if (level) {
            StorageManager.save('currentLevel', parseInt(level));
            currentLevel = parseInt(level);
            const popup = this.levelView.getComponent(ZoomPopup);
            popup.hide();
        }
        if (currentLevel < 5) {
            this.showLevelPopup_under_5();
        }
        else if (currentLevel >= 5) {
            this.showLevelPopup();
        }
        this.overlay.active = true;
    }
    showLevelPopup() {
        if (this.levelPopup) {
            const popup = this.levelPopup.getComponent(ZoomPopup);
            popup.show();
        } else {
            console.warn('Level popup prefab is not assigned.');
        }
    }
    showLevelPopup_under_5() {
        if (this.levelPopup_under_5) { 
            const popup = this.levelPopup_under_5.getComponent(ZoomPopup);
            popup.show();
        } else {
            console.warn('Level popup prefab is not assigned.');
        }
    }

    closePopup() {
        if (this.levelView) {
            const popup = this.levelView.getComponent(ZoomPopup);
            popup.hide();
        }
        if (this.levelPopup) {
            const popup = this.levelPopup.getComponent(ZoomPopup);
            popup.hide();
        }
        if (this.levelPopup_under_5) {
            const popup = this.levelPopup_under_5.getComponent(ZoomPopup);
            popup.hide();
        }
        this.overlay.active = false;
    }
}

