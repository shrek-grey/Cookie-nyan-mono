import { _decorator, Button, Component, Node, instantiate, CCInteger, Label, ScrollView, EventHandler, Prefab } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('currentLevelManager')
export class currentLevelManager extends Component {

    @property(Node)
    levelSelectView: Node | null = null;

    @property(Node)
    levelPopup: Node | null = null;

    @property(Node)
    levelPopupUnder5: Node | null = null;


    showLevelSelect() {
        this.levelSelectView.active = true;
        this.levelPopup.active = false;
    }

    showLevelPopup(level: string) {
        this.levelSelectView.active = false;
        this.levelPopup.active = true;
        // this.levelInfoLabel.string = `Level ${level}`;
    }

}


