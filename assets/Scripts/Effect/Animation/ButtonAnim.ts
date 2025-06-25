import { _decorator, Component, Node, tween, Vec3, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonAnimator')
export class ButtonAnimator extends Component {
    @property([Node])
    buttonList: Node[] = [];

    onLoad() {
        this.buttonList.forEach(button => {
            // Optional: make sure each button has UIOpacity
            // if (!button.getComponent(UIOpacity)) {
            //     button.addComponent(UIOpacity);
            // }

            button.on(Node.EventType.MOUSE_DOWN, () => {
                this.animateButton(button);
            });
        });
    }

    animateButton(button: Node) {
        // const opacity = button.getComponent(UIOpacity);

        tween(button)
            .parallel(
                tween().to(0.05, { scale: new Vec3(0.9, 0.9, 1) }),
                // tween(opacity).to(0.05, { opacity: 180 })
            )
            .parallel(
                tween().to(0.05, { scale: new Vec3(1.0, 1.0, 1) }),
                // tween(opacity).to(0.05, { opacity: 255 })
            )
            .start();
    }
}