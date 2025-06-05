import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SelectLevelViewController')
export class SelectLevelViewController extends Component {
    start() {

    }

    update(deltaTime: number) {
        
    }
    onCloseButtonClicked() {
        this.node.destroy(); // Close the popup by destroying the node
    }
}


