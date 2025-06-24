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

    private levelPopupClone: Node | null = null;
    private levelPopupUnder5Clone: Node | null = null;
    private levelViewClone: Node | null = null;

    showLevelViewPopup() {
        console.log("showLevelViewPopup called");
        if (this.levelView) {
            this.levelViewClone = instantiate(this.levelView);
            this.node.addChild(this.levelViewClone);
            const popup = this.levelViewClone.getComponent(ZoomPopup);
            popup.show();

        } else {
            console.warn('LevelView Popup prefab is not assigned.');
        }
        this.overlay.active = true;
    }


    showLevelPopup_open(_: Event, level: string) {
        console.log("showLevelPopup_open called with level:", level);
        let currentLevel: number;
        if(!level) {
            console.log("current level is last level:", JSON.parse(StorageManager.load<string>('lastLevel')));
            currentLevel = parseInt(JSON.parse(StorageManager.load<string>('lastLevel')));
            StorageManager.save('currentLevel', currentLevel);
        }
        if (level) {
            console.log("current level is:", parseInt(level));
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
            this.levelPopupClone = instantiate(this.levelPopup);
            this.node.addChild(this.levelPopupClone);
            const popup = this.levelPopupClone.getComponent(ZoomPopup);
            popup.show();
        } else {
            console.warn('Level popup prefab is not assigned.');
        }
    }
    showLevelPopup_under_5() {
        if (this.levelPopup_under_5) { 
            this.levelPopupUnder5Clone = instantiate(this.levelPopup_under_5);
            this.node.addChild(this.levelPopupUnder5Clone);
            const popup = this.levelPopupUnder5Clone.getComponent(ZoomPopup);
            popup.show();
        } else {
            console.warn('Level popup prefab is not assigned.');
        }
    }

    closePopup() {
        if (this.levelViewClone && this.levelViewClone.isValid) {
            const popup = this.levelViewClone.getComponent(ZoomPopup);
            popup?.hide();
            this.levelViewClone.destroy();
            this.levelViewClone = null;
        }
    
        if (this.levelPopupClone && this.levelPopupClone.isValid) {
            const popup = this.levelPopupClone.getComponent(ZoomPopup);
            popup?.hide();
            this.levelPopupClone.destroy();
            this.levelPopupClone = null;
        }
    
        if (this.levelPopupUnder5Clone && this.levelPopupUnder5Clone.isValid) {
            const popup = this.levelPopupUnder5Clone.getComponent(ZoomPopup);
            popup?.hide();
            this.levelPopupUnder5Clone.destroy();
            this.levelPopupUnder5Clone = null;
        }
    
        if (this.overlay) {
            this.overlay.active = false;
        }
    }
}

