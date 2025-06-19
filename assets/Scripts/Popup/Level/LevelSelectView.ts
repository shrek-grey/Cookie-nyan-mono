import { _decorator, Component, Node, Label, Button, instantiate, ScrollView } from 'cc';
import { PopupManager } from '../../Main/PopupManager'; // adjust path
const { ccclass, property } = _decorator;

@ccclass('LevelSelectView')
export class LevelSelectView extends Component {

    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Node)
    contentNode: Node = null;

    @property(Node)
    levelNode: Node = null;

    @property(PopupManager)
    manager: PopupManager = null;

    totalLevels: number = 400;

    start() {
        if (this.scrollView) { 
            this.scrollView.scrollToTop(0.1);
        }
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
                const levelButton = enabledNode.getComponent(Button);
                if (levelButton) {
                    const eventHandler = levelButton.clickEvents[0];
                    if (eventHandler) {
                        eventHandler.target = this.node;
                        eventHandler.component = 'LevelSelectView';
                        eventHandler.handler = 'onLevelButtonClicked';
                        eventHandler.customEventData = `${i}`;
                    }
                }
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
    onLevelButtonClicked(event: Event, customEventData: string) {
        this.manager.showLevelPopup_open(event, customEventData);
    }
}