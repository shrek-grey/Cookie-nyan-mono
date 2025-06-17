import { _decorator, Component, Prefab, Node, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PopupManager')
export class PopupManager extends Component {
    @property(Prefab)
    levelPopupPrefab: Prefab | null = null;

    public currentPopup: Node | null = null;

    start() {
    }

    update(deltaTime: number) {
        
    }
    showPopup() {
        if (this.levelPopupPrefab) {
            this.currentPopup = instantiate(this.levelPopupPrefab);
            this.node.addChild(this.currentPopup);
            this.currentPopup.setPosition(0, 0, 0); // Center the popup
        } else {
            console.warn('Popup prefab is not assigned.');
        }
    }
    closePopup() {
        if (this.currentPopup) {
            this.currentPopup.destroy();
            this.currentPopup = null;
        } else {
            console.warn('No popup to close.');
        }
    }
}

