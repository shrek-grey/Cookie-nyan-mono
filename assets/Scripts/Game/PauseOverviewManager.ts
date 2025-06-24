import { _decorator, Component, Node } from 'cc';
import { ZoomPopup } from '../Effect/Animation/ZoomPopup';
const { ccclass, property } = _decorator;

@ccclass('PauseOverviewManager')
export class PauseOverviewManager extends Component {
    
    @property(Node) alertPanel: Node | null = null;
    @property(Node) heartAlertPanel: Node | null = null;
    @property(Node) musicOffNode: Node | null = null;
    @property(Node) soundOffNode: Node | null = null;
    
    
    start() {

    }

    update(deltaTime: number) {
        
    }

    onRestartButtonClicked() {
        const popup = this.alertPanel.getComponent(ZoomPopup);
        popup.show();
    }

    onQuitButtonClicked() {
        const popup = this.heartAlertPanel.getComponent(ZoomPopup);
        popup.show();
    }

    onAlertButtonClicked() {
        const popup = this.alertPanel.getComponent(ZoomPopup);
        popup.hide();
    }

    onHeartAlertButtonClicked() {
        const popup = this.heartAlertPanel.getComponent(ZoomPopup);
        popup.hide();
    }

    onMusicOnButtonClicked() {
        this.musicOffNode.active = true;
    }

    onMusicOffButtonClicked() {
        this.musicOffNode.active = false;
    }

    onSoundOnButtonClicked() {
        this.soundOffNode.active = true;
    }
    
    onSoundOffButtonClicked() {
        this.soundOffNode.active = false;
    }
}


