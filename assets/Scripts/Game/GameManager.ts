import {
    _decorator, Color, Component, director, EventTouch, instantiate, Label, Layout, Node, Prefab,
    Sprite, SpriteFrame, tween, UIOpacity, UITransform, Vec3
} from 'cc';
import { LevelData, loadLevelFile } from '../Utils/LevelUtils';
// import { drawGridTilesWithRoundedEdges } from './GamePanelManager'

const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    // --- Nodes and Prefabs ---
    @property(Node) startPanel: Node | null = null; // Main panel shown at start
    @property(Node) startPopup: Node | null = null;       // Initial panel shown at start
    @property(Node) goalBlock: Node = null;                // Panel that shows goals
    @property(Node) movesAmount: Node = null;              // Label node for displaying remaining moves
    @property(Node) items: Node = null;                     // Parent node to add general goal items
    @property(Node) blockItems: Node = null;                // Parent node to add block goal items
    @property(Prefab) item: Prefab | null = null;           // Prefab for a goal item UI element
    @property([SpriteFrame]) spriteFrames: SpriteFrame[] = []; // SpriteFrames for different goal icons
    @property([SpriteFrame]) cubeBackgroundFrames: SpriteFrame[] = []; // Background sprites for grid tiles
    @property([SpriteFrame]) cubeCookieFrames: SpriteFrame[] = []; // Sprites for grid tiles with rounded edges
    @property(Node) blackPanel: Node = null;
    @property(Node) gamePanel: Node = null;
    @property(Node) cubeItem: Node | null = null; // Prefab for cube item in the game panel
    @property(Prefab) tutorialLevel1Prefab: Prefab | null = null; // Prefab for tutorial level 1
    @property(Prefab) tutorialLevel2Prefab: Prefab | null = null; // Prefab for tutorial level 2
    @property(Prefab) tutorialLevel3Prefab: Prefab | null = null; // Prefab for tutorial level 3
    @property(Prefab) tutorialLevel4Prefab: Prefab | null = null; // Prefab for tutorial level 4
    @property(Prefab) tutorialLevel5Prefab: Prefab | null = null; // Prefab for tutorial level 5
    @property(Prefab) tutorialLevel6Prefab: Prefab | null = null; // Prefab for tutorial level 6
    @property(Prefab) tutorialLevel7Prefab: Prefab | null = null; // Prefab for tutorial level 7
    @property(Prefab) tutorialLevel8Prefab: Prefab | null = null; // Prefab for tutorial level 8

    @property(Node) pauseOverView: Node | null = null;

    @property(Node) pauseButton: Node | null = null;
    @property(Node) resumeButton: Node | null = null;
    @property(Node) restartButton: Node | null = null;
    @property(Node) quitButton: Node | null = null;

    private currentLevelData: LevelData | null = null;      // Loaded data for the current level
    private currentGameState: number[][] = []; // 2D array representing the current game state (grid)
    private currentMapState: number[][] = []; // 2D array representing the current map state (grid)


    // Called when component starts
    start() {
        // Get current level number from localStorage or default to 1
        const currentLevel = JSON.parse(localStorage.getItem('currentLevel') || '1');
        console.log("Current Level:", currentLevel);
        this.startLevel(currentLevel);
        this.blackPanel?.on(Node.EventType.TOUCH_END, this.onBlackPanelClick, this);
        this.blackPanel?.on(Node.EventType.TOUCH_END, this.onBlackPanelClick, this);
    }

    /**
     * Load level data and initiate UI transitions + rendering.
     * @param levelNumber Number of the level to load
     */
    startLevel(levelNumber: number) {
        console.log("Starting level:", levelNumber);

        loadLevelFile(levelNumber)
            .then(data => {
                this.currentLevelData = data;

                // Delay slightly to allow UI setup
                this.scheduleOnce(() => {
                    // Fade out the start popup, then fade in the goal block,
                    // then set UI data and render goals.
                    this.fadeOutstartPopup(() => {
                        this.scheduleOnce(() => {
                            this.fadeInGoalBlock(() => {
                                this.setLevelData(data);
                                this.renderLevel();
                            });
                        }, 0.1);
                    });
                }, 0.5);
            })
            .catch(err => console.error("Failed to load level:", err));
    }

    /**
     * Update the moves label to display remaining moves.
     * @param data Level data containing moves count
     */
    setLevelData(data: LevelData) {
        const movesLabel = this.movesAmount?.getComponent(Label);
        if (movesLabel) {
            movesLabel.string = `${data.moves}`;
        }
    }

    /**
     * Instantiate a goal UI item and add it to the specified parent node.
     * @param goalValue Number representing the goal count
     * @param spriteFrameIndex Index of the spriteFrame to display
     * @param parentNode Node to add the created item to
     */
    private createGoalItem(goalValue: number, spriteFrameIndex: number, parentNode: Node, scale: number = 1) {
        if (!goalValue || !parentNode || !this.item) return;

        const itemNode = instantiate(this.item);

        // Set the goal icon sprite
        const cookieSprite = itemNode.getChildByName('Cookie')?.getComponent(Sprite);
        if (cookieSprite) cookieSprite.spriteFrame = this.spriteFrames[spriteFrameIndex];

        // Set the goal count label
        const label = itemNode.getChildByName('Text')?.getComponent(Label);
        if (label) label.string = `${goalValue}`;

        itemNode.setScale(scale, scale);

        parentNode.addChild(itemNode);
    }


    setCookieInit() {
        for (let row = 0; row < 16; row++) {
            for (let col = 0; col < 8; col++) {
                const nodeName = `CubeItem_${row}_${col}`;
                const itemNode = this.gamePanel.getChildByName(nodeName);
                const cookieNode = itemNode.getChildByName('Cookie');
                const sprite = cookieNode.getComponent(Sprite)
                if (row >= 8 && this.currentMapState[row - 8][col] == 8) {
                    const lockNode = itemNode.getChildByName('Lock')
                    lockNode.active = true;
                    if (sprite) sprite.spriteFrame = this.spriteFrames[this.currentGameState[row][col] - 10];
                    if (row > 7) cookieNode.active = true;
                }
                if (row >= 8 && this.currentMapState[row - 8][col] == 3) {
                    const chocoNode = itemNode.getChildByName('ChocoBiscuit')
                    chocoNode.active = true;
                }
                if (row >= 8 && this.currentMapState[row - 8][col] == 2) {
                    const biscuitNode = itemNode.getChildByName('Biscuit')
                    biscuitNode.active = true;
                }
                if (row >= 8 && this.currentMapState[row - 8][col] == 5) {
                    const downNode = itemNode.getChildByName('Down')
                    downNode.active = true;
                }
                if (row >= 8 && this.currentMapState[row - 8][col] == 6) {
                    const obstacleNode = itemNode.getChildByName('Obstacle')
                    obstacleNode.active = true;
                }

                if (this.currentGameState[row][col] >= 10 && this.currentGameState[row][col] < 24) {
                    if (sprite) sprite.spriteFrame = this.spriteFrames[this.currentGameState[row][col] - 10];
                    if (row > 7) cookieNode.active = true;
                }
                if (this.currentGameState[row][col] >= 30 && this.currentGameState[row][col] < 44) {
                    if (sprite) sprite.spriteFrame = this.spriteFrames[this.currentGameState[row][col] - 30];
                    if (row > 7) cookieNode.active = true;
                }
            }
        }
    }

    fillRandomCookiesWithoutMatch3(
        grid: number[][],
        level: number
    ) {
        const pool = this.getPossibleCookiesForLevel(level);

        for (let row = 0; row < 16; row++) {
            for (let col = 0; col < 8; col++) {
                if (grid[row][col] !== 0 && grid[row][col] !== 8 && grid[row][col] !== 2 && grid[row][col] !== 3 && (grid[row][col] >= 30 || grid[row][col] <= 23)) {
                    continue;
                }
                const avoidValues = new Set<number>();

                // Check left and left-left
                if (col >= 2 && grid[row][col - 1] === grid[row][col - 2]) {
                    avoidValues.add(grid[row][col - 1]);
                }

                // Check top and top-top
                if (row >= 2 && grid[row - 1][col] === grid[row - 2][col]) {
                    avoidValues.add(grid[row - 1][col]);
                }

                // Check 2x2 square top-left
                if (
                    row >= 1 && col >= 1 &&
                    grid[row - 1][col - 1] === grid[row - 1][col] &&
                    grid[row - 1][col] === grid[row][col - 1]
                ) {
                    avoidValues.add(grid[row - 1][col]);
                }

                // Choose a safe random cookie
                const candidates = pool.filter(v => !avoidValues.has(v));
                const chosen = candidates.length > 0
                    ? candidates[Math.floor(Math.random() * candidates.length)]
                    : pool[Math.floor(Math.random() * pool.length)];
                grid[row][col] = chosen;
            }
        }
    }

    /**
     * Render all goals in the UI based on loaded level data.
     * Clears previous goal items before rendering new ones.
     */
    renderLevel() {
        if (!this.currentLevelData) return;

        const { goals, grid } = this.currentLevelData;
        for (let row = 0; row < 16; row++) {
            for (let col = 0; col < 8; col++) {
                if (row < 8) {
                    this.currentGameState[row] = this.currentGameState[row] || [];
                    this.currentGameState[row][col] = 0; // random tile
                    continue; // skip random tiles in the top 8 rows
                }
                else {
                    this.currentGameState[row] = this.currentGameState[row] || [];
                    this.currentGameState[row][col] = grid[row - 8][col];
                    if (this.currentGameState[row][col] == 2 || this.currentGameState[row][col] == 3 || this.currentGameState[row][col] == 5 || this.currentGameState[row][col] == 6 || this.currentGameState[row][col] == 8) {
                        this.currentMapState[row - 8] = this.currentMapState[row - 8] || [];
                        this.currentMapState[row - 8][col] = this.currentGameState[row][col];
                    } else {
                        if (this.currentGameState[row][col] >= 30) {
                            this.currentMapState[row - 8] = this.currentMapState[row - 8] || [];
                            this.currentMapState[row - 8][col] = 8;
                        }
                        else {
                            this.currentMapState[row - 8] = this.currentMapState[row - 8] || [];
                            this.currentMapState[row - 8][col] = 0;
                        }
                    }
                }
            }
        }
        const currentLevel = JSON.parse(localStorage.getItem('currentLevel') || '1');
        this.fillRandomCookiesWithoutMatch3(this.currentGameState, currentLevel);
        console.log(this.currentGameState)



        // Clear previous goal items to avoid duplicates
        this.items?.removeAllChildren();
        this.blockItems?.removeAllChildren();

        // GOAL_BLOCK is a 2D array where each sub-array has [spriteIndex, count]
        // Add goal block items to both 'items' and 'blockItems' nodes
        if (Array.isArray(goals.GOAL_BLOCK)) {
            for (const goal of goals.GOAL_BLOCK) {
                if (goal.length >= 2) {
                    console.log('goal', goal)
                    const [spriteIndex, count] = goal;
                    this.createGoalItem(count, spriteIndex, this.items, 1);
                    this.createGoalItem(count, spriteIndex, this.blockItems, 1.6);
                }
            }
        }

        // Other goals added only to 'items' node with their specific sprite indexes
        const otherGoals = [
            { value: goals.GOAL_BISCUIT, spriteIndex: 9 },
            { value: goals.GOAL_OBSTACLE, spriteIndex: 11 },
            { value: goals.GOAL_DOWN, spriteIndex: 10 },
            { value: goals.GOAL_CREAM, spriteIndex: 12 },
        ];

        for (const { value, spriteIndex } of otherGoals) {
            this.createGoalItem(value, spriteIndex, this.items, 1);
            this.createGoalItem(value, spriteIndex, this.blockItems, 1.6);
        }
        this.updateLayoutCenter(this.items);
    }

    updateLayoutCenter(container: Node | null) {
        if (!container) return;

        const layout = container.getComponent(Layout);
        const uiTransform = container.getComponent(UITransform);
        if (!layout || !uiTransform || layout.type !== Layout.Type.GRID) return;

        const count = container.children.length;
        if (count === 0) return;

        const cols = Math.min(2, count); // Max 2 columns
        const rows = Math.ceil(count / cols);

        // Total size of the layout based on items, spacing, and cell size
        const totalWidth = cols * layout.cellSize.width + layout.spacingX * (cols - 1);
        const totalHeight = rows * layout.cellSize.height + layout.spacingY * (rows - 1);

        // Update container size
        uiTransform.setContentSize(totalWidth, totalHeight);

        // Reposition to center (assuming anchor is middle: (0.5, 0.5))
        container.setPosition(new Vec3(0, 0, 0));
    }
    /**
     * Fade out the start popup panel with upward movement.
     * Calls onComplete callback when finished.
     */
    fadeOutstartPopup(onComplete: () => void) {
        if (!this.startPopup) return;

        const opacity = this.startPopup.getComponent(UIOpacity) || this.startPopup.addComponent(UIOpacity);
        const startPos = this.startPopup.position.clone();

        tween(this.startPopup)
            .parallel(
                tween().to(0.1, { position: startPos.add(new Vec3(0, 30, 0)) }, { easing: 'quadOut' }),
                tween(opacity).to(0.1, { opacity: 0 }, { easing: 'fade' })
            )
            .call(() => {
                this.startPopup!.active = false;
                onComplete();
            })
            .start();
    }

    /**
     * Fade in the goal block panel with downward movement.
     * Calls onComplete callback when finished.
     * @param onComplete Optional callback function after fade-in completes
     */
    fadeInGoalBlock(onComplete?: () => void) {
        if (!this.goalBlock) return;

        const opacity = this.goalBlock.getComponent(UIOpacity) || this.goalBlock.addComponent(UIOpacity);
        const startPos = this.goalBlock.position.clone();

        this.goalBlock.active = true;
        opacity.opacity = 0;

        tween(this.goalBlock)
            .parallel(
                tween().to(0.2, { position: startPos.add(new Vec3(0, 500, 0)) }, { easing: 'quadOut' }),
                tween(opacity).to(0.2, { opacity: 255 }, { easing: 'fade' })
            )
            .call(() => {
                if (onComplete) onComplete();
            })
            .start();
    }

    onBlackPanelClick() {
        this.fadeOutGoalBlock(() => {
            this.fadeInGamePanel(() => {
                this.startPanel.active = false;
                this.drawGridTilesWithRoundedEdges();
                this.setCookieInit();
                this.initCookieDrag();
            });
        });
    }



    drawGridTilesWithRoundedEdges() {
        if (!this.currentLevelData || !this.cubeBackgroundFrames || !this.gamePanel) return;

        const grid = this.currentLevelData.grid;

        // Loop over visible part: rows 8~15 (realRow = row - 8)
        for (let row = 8; row < 16; row++) {
            for (let col = 0; col < 8; col++) {
                const tileValue = grid[row - 8][col];
                if (tileValue === 1) continue; // unused tile

                const nodeName = `CubeItem_${row}_${col}`;
                const cubeItem = this.gamePanel.getChildByName(nodeName);
                if (!cubeItem) continue;

                const background = cubeItem.getChildByName('Background');
                if (!background) continue;

                // Neighbor presence (false means open side)
                const gridRow = row - 8;

                const top = gridRow > 0 && Array.isArray(grid[gridRow - 1]) && grid[gridRow - 1][col] !== 1;
                const bottom = gridRow < 7 && Array.isArray(grid[gridRow + 1]) && grid[gridRow + 1][col] !== 1;
                const left = col > 0 && grid[gridRow]?.[col - 1] !== 1;
                const right = col < 7 && grid[gridRow]?.[col + 1] !== 1;
                let index = 0; // default = middle

                // Check corners first
                if (!top && !left) index = 5;         // left_top
                else if (!bottom && !left) index = 6; // left_bot
                else if (!top && !right) index = 7;   // right_top
                else if (!bottom && !right) index = 8; // right_bot
                else if (!top) index = 3;             // top
                else if (!bottom) index = 4;          // bottom
                else if (!left) index = 1;            // left
                else if (!right) index = 2;           // right

                const sprite = background.getComponent(Sprite);
                // console.log('sprite', sprite, 'index', index, 'cubeBackgroundFrames', this.cubeBackgroundFrames);
                if (sprite) {
                    sprite.spriteFrame = this.cubeBackgroundFrames[index];
                    const gridNode = cubeItem.getChildByName('Grid');
                    const gridSprite = gridNode?.getComponent(Sprite);
                    if (gridSprite) {
                        gridSprite.color = (row + col) % 2 === 0 ? new Color(255, 255, 255) : new Color(200, 200, 200);
                    }
                    gridNode.active = true;
                    background.active = true;
                }
            }
        }
    }
    getPossibleCookiesForLevel(level: number): number[] {
        if (level >= 300 && level <= 400) return [10, 12, 15, 16, 17, 18];
        if (level >= 200) return [13, 14, 15, 16, 17, 18];
        if (level >= 150) return [13, 14, 15, 16, 17, 18];
        if (level >= 100) return [12, 13, 14, 15, 16, 17];
        if (level >= 50) return [11, 12, 13, 14, 15, 16];
        if (level >= 30) return [10, 11, 12, 13, 14, 15];
        if (level >= 5) return [10, 11, 12, 13, 14];
        return [10, 11, 12, 13];
    }

    fadeOutGoalBlock(onComplete?: () => void) {
        const goalOpacity = this.goalBlock.getComponent(UIOpacity) || this.goalBlock.addComponent(UIOpacity);
        const goalPos = this.goalBlock.position.clone();

        tween(this.goalBlock)
            .parallel(
                tween().to(0.3, { position: goalPos.add(new Vec3(0, 30, 0)) }, { easing: 'quadOut' }),
                tween(goalOpacity).to(0.3, { opacity: 0 }, { easing: 'fade' })
            )
            .call(() => {
                this.goalBlock.active = false;
                if (onComplete) onComplete();
            })
            .start();
    }

    fadeInGamePanel(onComplete?: () => void) {
        console.log("levelData Grid:", this.currentLevelData?.grid);
        const gameOpacity = this.gamePanel.getComponent(UIOpacity) || this.gamePanel.addComponent(UIOpacity);
        const gamePos = this.gamePanel.position.clone();

        this.gamePanel.active = true;
        gameOpacity.opacity = 0;

        tween(this.gamePanel)
            .parallel(
                tween().to(0.3, { position: gamePos.add(new Vec3(0, -30, 0)) }, { easing: 'quadOut' }),
                tween(gameOpacity).to(0.3, { opacity: 255 }, { easing: 'fade' })
            )
            .call(() => {
                if (onComplete) onComplete();
                // Initialize the game panel manager after fading in
            })
            .start();
    }

    showPauseOverview() {
        this.pauseOverView.active = true;
    }

    closePauseOverview() {
        this.pauseOverView.active = false;
    }

    onRestartButtonClicked() {
        director.loadScene('Game');
    }

    onQuitButtonClicked() {
        director.loadScene('Main');
    }

    initCookieDrag() {
        for (let row = 8; row < 16; row++) {
            for (let col = 0; col < 8; col++) {
                this.enableCookieDrag(row, col);
            }
        }
    }

    enableCookieDrag(row: number, col: number) {
        const nodeName = `CubeItem_${row}_${col}`;
        const itemNode = this.gamePanel.getChildByName(nodeName);
        if (!itemNode) return;

        const cookieNode = itemNode.getChildByName('Cookie');
        if (!cookieNode || !cookieNode.active) return;

        let startWorldPos: Vec3 | null = null;

        cookieNode.on(Node.EventType.TOUCH_START, (event: EventTouch) => {
            const uiPos = event.getUILocation(); // Vec2
            startWorldPos = new Vec3(uiPos.x, uiPos.y, 0);
        });

        cookieNode.on(Node.EventType.TOUCH_END, (event: EventTouch) => {
            if (!startWorldPos) return;

            const endWorldPos = event.getUILocation();
            const deltaX = endWorldPos.x - startWorldPos.x;
            const deltaY = endWorldPos.y - startWorldPos.y;

            let targetRow = row;
            let targetCol = col;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 50) targetCol++;
                else if (deltaX < -50) targetCol--;
            } else {
                if (deltaY > 50) targetRow--;
                else if (deltaY < -50) targetRow++;
            }

            const valid =
                targetRow >= 8 && targetRow < 16 &&
                targetCol >= 0 && targetCol < 8 &&
                !(targetRow === row && targetCol === col);

            if (valid) {
                this.swapCookies(row, col, targetRow, targetCol);
            }

            startWorldPos = null;
        });
    }

    swapCookies(r1: number, c1: number, r2: number, c2: number) {
        const node1 = this.gamePanel.getChildByName(`CubeItem_${r1}_${c1}`)?.getChildByName('Cookie');
        const node2 = this.gamePanel.getChildByName(`CubeItem_${r2}_${c2}`)?.getChildByName('Cookie');

        if (!node1 || !node2) return;

        const pos1 = node1.position.clone();
        const pos2 = node2.position.clone();

        // Animate swap
        tween(node1).to(0.2, { position: pos2 }, { easing: 'quadInOut' }).start();
        tween(node2).to(0.2, { position: pos1 }, { easing: 'quadInOut' }).start();

        // Swap in gameState
        const temp = this.currentGameState[r1][c1];
        this.currentGameState[r1][c1] = this.currentGameState[r2][c2];
        this.currentGameState[r2][c2] = temp;

        // Optionally, swap spriteFrame immediately (or after animation)
        const sprite1 = node1.getComponent(Sprite);
        const sprite2 = node2.getComponent(Sprite);
        if (sprite1 && sprite2) {
            const tempSprite = sprite1.spriteFrame;
            sprite1.spriteFrame = sprite2.spriteFrame;
            sprite2.spriteFrame = tempSprite;
        }
    }

}
