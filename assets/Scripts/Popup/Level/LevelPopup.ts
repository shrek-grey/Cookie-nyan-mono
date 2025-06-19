// This script is part of a game that manages the level selection and rendering of level data.
// It handles loading level data, rendering the level items, and displaying the level popup UI.

import { _decorator, Component, Node, instantiate, Label, Prefab, Sprite, SpriteFrame } from 'cc';
import { PopupManager } from '../../Main/PopupManager';
import { loadLevelFile, LevelData } from '../../Utils/LevelUtils';
const { ccclass, property } = _decorator;

@ccclass('LevelPopup')
export class LevelPopup extends Component {
    @property(Label)
    currentLevelLabel: Label | null = null;

    @property(Node)
    items: Node | null = null;

    @property(Prefab)
    item: Prefab | null = null;

    @property([SpriteFrame])
    spriteFrames: SpriteFrame[] = [];

    private currentLevelData: LevelData | null = null;

    private createGoalItem(goalValue: number, spriteFrameIndex: number): void {
        if (!goalValue) return;

        const itemNode = instantiate(this.item);

        // Set sprite
        const cookieNode = itemNode.getChildByName('Cookie');
        const cookieSprite = cookieNode?.getComponent(Sprite);
        if (cookieSprite) {
            cookieSprite.spriteFrame = this.spriteFrames[spriteFrameIndex];
        } else {
            console.warn('Sprite component not found on Cookie node.');
        }

        // Set label
        const textNode = itemNode.getChildByName('Text');
        const labelComponent = textNode?.getComponent(Label);
        if (labelComponent) {
            labelComponent.string = `${goalValue}`;
        } else {
            console.warn('Label component not found on Text node.');
        }

        this.items.addChild(itemNode);
    }

    startLevel(levelNumber: number) {
        console.log("Starting level:", levelNumber);
        loadLevelFile(levelNumber)
            .then((data) => {
                this.currentLevelData = data;
                this.renderLevel();
            })
            .catch((err) => {
                console.error("Failed to load level:", err);
            });
    }

    // This method is responsible for rendering the level based on the loaded data.
    renderLevel() {
        if (!this.currentLevelData) return;

        const { grid, moves, score, goals } = this.currentLevelData;

        console.log("goals:", goals);
        // Generate the items for the level based on the goals.
        // This assumes that goals.GOAL_BLOCK is an array of arrays, where each sub-array contains a sprite index and a count.
        if (goals.GOAL_BLOCK.length != 1 && goals.GOAL_BLOCK[0].length != 1) {
            goals.GOAL_BLOCK.forEach((goal: number[]) => {
                const itemNode = instantiate(this.item);
                const cookieNode = itemNode.getChildByName('Cookie');
                if (cookieNode) {
                    const cookieSprite = cookieNode.getComponent(Sprite);
                    if (cookieSprite) {
                        console.log('Setting sprite for goal:', this.spriteFrames[goal[0]]);
                        cookieSprite.spriteFrame = this.spriteFrames[goal[0]];
                    } else {
                        console.warn('Sprite component not found on Cookie node.');
                    }
                }
                const textNode = itemNode.getChildByName('Text');
                if (textNode) {
                    const labelComponent = textNode.getComponent(Label);
                    if (labelComponent) {
                        labelComponent.string = `${goal[1]}`;
                    } else {
                        console.warn('Label component not found on Text node.');
                    }
                }
                this.items.addChild(itemNode);
            });
        }
        const goalConfigs = [
            { value: goals.GOAL_BISCUIT, spriteIndex: 5 },
            { value: goals.GOAL_OBSTACLE, spriteIndex: 6 },
            { value: goals.GOAL_DOWN, spriteIndex: 7 },
            { value: goals.GOAL_CREAM, spriteIndex: 8 },
        ];

        for (const config of goalConfigs) {
            // console.log("Creating goal item with value:", config.value[0][0]);
            this.createGoalItem(config.value, config.spriteIndex);
        }
    }

    start() {
        const currentLevel = JSON.parse(localStorage.getItem('currentLevel')) ? JSON.parse(localStorage.getItem('currentLevel')) : JSON.parse(localStorage.getItem('lastLevel'));
        if (this.currentLevelLabel) {
            this.currentLevelLabel.string = `Level ${currentLevel}`;
            this.startLevel(10);
        }
    }

    onCloseButtonClicked() {
        // const currentPopup = this.node.getComponent(PopupManager);
        this.node.destroy(); // Close the popup by destroying the node
    }
}


