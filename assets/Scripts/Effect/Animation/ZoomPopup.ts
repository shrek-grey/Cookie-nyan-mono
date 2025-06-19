import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ZoomPopup')
export class ZoomPopup extends Component {
    private isVisible = false;

    show() {
        if (this.isVisible) return;
        this.isVisible = true;

        this.node.active = true;
        this.node.scale = new Vec3(0, 0, 1);
        tween(this.node)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }

    hide() {
        if (!this.isVisible) return;
        this.isVisible = false;

        tween(this.node)
            .to(0.2, { scale: new Vec3(0, 0, 1) }, {
                easing: 'backIn',
                onComplete: () => {
                    this.node.active = false;
                }
            })
            .start();
    }
}