// import { _decorator, Component, Node, Label, Button, instantiate, ScrollView } from 'cc';
// import { PopupManager } from '../../Main/PopupManager'; // adjust path
// const { ccclass, property } = _decorator;

// @ccclass('LevelSelectView')
// export class LevelSelectView extends Component {

//     @property(ScrollView)
//     scrollView: ScrollView = null;

//     @property(Node)
//     contentNode: Node = null;

//     @property(Node)
//     levelNode: Node = null;

//     @property(PopupManager)
//     manager: PopupManager = null;

//     totalLevels: number = 400;

//     start() {
//         if (this.scrollView) { 
//             this.scrollView.scrollToTop(0.1);
//         }
//     }

//     onLoad() {
//         this.populateLevels();
//         console.log("onLoad called")
//     }

//     populateLevels() {
//         const lastLevel = JSON.parse(localStorage.getItem('lastLevel'));
//         for(let i = 1; i <= this.totalLevels; i++) {
//             const levelNodeClone = instantiate(this.levelNode);
//             levelNodeClone.active = true;
           
//             if (i <= lastLevel) {
//                 const enabledNode = levelNodeClone.getChildByName('Enabled');
//                 enabledNode.active = true;
//                 const levelLabel = enabledNode.getChildByName('LevelNumber');
//                 if (levelLabel) {
//                     const labelComponent = levelLabel.getComponent(Label);
//                     if (labelComponent) {
//                         labelComponent.string = `${i}`;
//                     }
//                 }
//                 const disabledNode = levelNodeClone.getChildByName('Disabled');
//                 disabledNode.active = false;
//                 const levelButton = enabledNode.getComponent(Button);
//                 if (levelButton) {
//                     const eventHandler = levelButton.clickEvents[0];
//                     if (eventHandler) {
//                         eventHandler.target = this.node;
//                         eventHandler.component = 'LevelSelectView';
//                         eventHandler.handler = 'onLevelButtonClicked';
//                         eventHandler.customEventData = `${i}`;
//                     }
//                 }
//                 this.contentNode.addChild(levelNodeClone);
//                  // Clone the locked level node
//             }
//             else {
//                 const disabledNode = levelNodeClone.getChildByName('Disabled');
//                 disabledNode.active = true;
//                 const enabledNode = levelNodeClone.getChildByName('Enabled');
//                 enabledNode.active = false;
//                 this.contentNode.addChild(levelNodeClone);
//                  // Clone the locked level node
//             }
          
//         }   
//     }
//     onLevelButtonClicked(event: Event, customEventData: string) {
//         this.manager.showLevelPopup_open(event, customEventData);
//     }
// }
import { _decorator, Component, Node, Label, Button, instantiate, ScrollView, Event, UITransform, EventHandler } from 'cc';
import { PopupManager } from '../../Main/PopupManager';
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
    batchSize: number = 50;

    lastLevel: number = 0;
    loadedCount: number = 0;

    onLoad() {
        this.lastLevel = Number(localStorage.getItem('lastLevel')) || 0;

        this.loadNextBatch();

        // Listen scroll event
        this.scrollView.node.on('scrolling', this.onScroll, this);
        this.scrollView.scrollToTop(0.1);
    }

    loadNextBatch() {
        const end = Math.min(this.loadedCount + this.batchSize, this.totalLevels);
        for(let i = this.loadedCount + 1; i <= end; i++) {
            const levelNodeClone = instantiate(this.levelNode);
            levelNodeClone.active = true;

            const enabledNode = levelNodeClone.getChildByName('Enabled');
            const disabledNode = levelNodeClone.getChildByName('Disabled');

            if (i <= this.lastLevel) {
                if (enabledNode) {
                    enabledNode.active = true;
                    const levelLabel = enabledNode.getChildByName('LevelNumber');
                    if (levelLabel) {
                        const labelComp = levelLabel.getComponent(Label);
                        if (labelComp) labelComp.string = i.toString();
                    }
                    const btn = enabledNode.getComponent(Button);
                    if (btn) {
                        btn.clickEvents.length = 0;
                        const evt = new EventHandler();
                        evt.target = this.node;
                        evt.component = 'LevelSelectView';
                        evt.handler = 'onLevelButtonClicked';
                        evt.customEventData = i.toString();
                        btn.clickEvents.push(evt);
                    }
                }
                if (disabledNode) disabledNode.active = false;
            } else {
                if (enabledNode) enabledNode.active = false;
                if (disabledNode) disabledNode.active = true;
            }

            this.contentNode.addChild(levelNodeClone);
        }

        this.loadedCount = end;

        // Update content height for ScrollView
        const itemHeight = this.levelNode.getComponent(UITransform)?.height || 100;
        const uiTransform = this.contentNode.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.setContentSize(uiTransform.width, itemHeight * this.loadedCount);
        }
    }

    onScroll() {
        const scrollOffsetY = this.scrollView.getScrollOffset().y;
        const contentHeight = this.contentNode.getComponent(UITransform)?.height || 0;
        const viewHeight = this.scrollView.node.getComponent(UITransform)?.height || 0;

        // When user scrolls near bottom (threshold 100 pixels)
        if (scrollOffsetY + viewHeight + 100 >= contentHeight) {
            if (this.loadedCount < this.totalLevels) {
                this.loadNextBatch();
            }
        }
    }

    onLevelButtonClicked(event: Event, customEventData: string) {
        this.manager.showLevelPopup_open(event as any, customEventData);
    }
}
