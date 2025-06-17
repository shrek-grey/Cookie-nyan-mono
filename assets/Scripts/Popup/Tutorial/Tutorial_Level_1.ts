import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TutorialManager')
export class TutorialManager extends Component {
    @property(Node)
    boardNode: Node = null!;  // Assign: AnimationPanel/Board

    @property(Node)
    fingerPointer: Node = null!;  // Optional: assign a pointer/hand graphic

    private cookies: Node[] = [];

    start() {
        this.cookies = this.boardNode.children;  // All 25 cookies
        this.scheduleOnce(this.playTutorialMove, 0.5);
    }

    playTutorialMove() {
        // Example move: swap index 11 <-> 12 (row 2, col 1 <-> col 2)
        const fromIndex = 11; // row 2 col 1
        const toIndex = 12;   // row 2 col 2
        const matchIndex = 13; // 2,3 — to complete a match of 3

        const cookieA = this.cookies[fromIndex];
        const cookieB = this.cookies[toIndex];
        const cookieC = this.cookies[matchIndex];

        this.animateFingerMove(cookieA, cookieB, () => {
            this.swapCookies(cookieA, cookieB);

            this.scheduleOnce(() => {
                this.breakMatchedCookies([cookieA, cookieB, cookieC]);
            }, 0.4);
        });
    }

    animateFingerMove(from: Node, to: Node, onComplete: () => void) {
        if (!this.fingerPointer) {
            onComplete();
            return;
        }

        this.fingerPointer.setWorldPosition(from.worldPosition);
        this.fingerPointer.active = true;

        tween(this.fingerPointer)
            .to(0.5, { worldPosition: to.worldPosition })
            .call(() => {
                this.fingerPointer.active = false;
                onComplete();
            })
            .start();
    }

    swapCookies(a: Node, b: Node) {
        const posA = a.position.clone();
        const posB = b.position.clone();

        tween(a).to(0.2, { position: posB }).start();
        tween(b).to(0.2, { position: posA }).start();

        // Optional: update internal logic if needed
    }

    breakMatchedCookies(cookies: Node[]) {
        for (const cookie of cookies) {
            tween(cookie)
                .to(0.2, { scale: new Vec3(0, 0, 0) })
                .call(() => cookie.destroy())
                .start();
        }

        this.scheduleOnce(() => {
            this.node.destroy(); // End tutorial
        }, 1);
    }
}