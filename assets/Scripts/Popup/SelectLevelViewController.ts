import { _decorator, Component, Node, instantiate, CCInteger, Label, ScrollView } from 'cc';
import { PopupManager } from '../Main/PopupManager';
const { ccclass, property } = _decorator;

@ccclass('SelectLevelViewController')
export class SelectLevelViewController extends Component {
    @property(Node)
    contentNode: Node | null = null;

    @property(Node)
    levelNode: Node | null = null;

    @property(ScrollView)
    scrollView: ScrollView | null = null;

    @property(CCInteger)
    totalLevels: number = 400; 

    start() {
        if(this.scrollView) {
            this.scrollView.scrollToTop(0);
        }
    }

    update(deltaTime: number) {
        
    }

    onLoad() {
        this.populateLevels();
        console.log("onLoad called")
    }

    populateLevels() {
        const currentLevel = JSON.parse(localStorage.getItem('currentLevel'));
        for(let i = 1; i <= this.totalLevels; i++) {
            const levelNodeClone = instantiate(this.levelNode);
            levelNodeClone.active = true;
           
            if (i <= currentLevel) {
                const enabledNode = levelNodeClone.getChildByName('Enabled');
                enabledNode.active = true;
                const levelLabel = enabledNode.getChildByName('LevelNumber');
                if (levelLabel) {
                    const labelComponent = levelLabel.getComponent(Label);
                    if (labelComponent) {
                        labelComponent.string = `${i}`;
                    }
                }
                const disabledNode = levelNodeClone.getChildByName('Disabled');
                disabledNode.active = false;
                this.contentNode.addChild(levelNodeClone);
                 // Clone the locked level node
            }
            else {
                const disabledNode = levelNodeClone.getChildByName('Disabled');
                disabledNode.active = true;
                const enabledNode = levelNodeClone.getChildByName('Enabled');
                enabledNode.active = false;
                this.contentNode.addChild(levelNodeClone);
                 // Clone the locked level node
            }
          
        }   
    }

    onCloseButtonClicked() {
        const currentPopup = this.node.getComponent(PopupManager);
        if(currentPopup) currentPopup.closePopup();
        this.node.destroy(); // Close the popup by destroying the node
    }
}


