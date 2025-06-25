import {
    _decorator, Color, Component, director, EventTouch, instantiate, Label, Layout, Node, Prefab,
    Sprite, SpriteFrame, tween, UIOpacity, UITransform, Vec2, Vec3
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
    @property(Prefab) cookieItem: Prefab | null = null;
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

    private dragStartGrid: { row: number, col: number } | null = null;
    private swapPerformed: boolean = false;


    // Called when component starts
    start() {
        // Get current level number from localStorage or default to 1
        const currentLevel = JSON.parse(localStorage.getItem('currentLevel') || '1');
        this.startLevel(currentLevel);
    }

    /**
     * Load level data and initiate UI transitions + rendering.
     * @param levelNumber Number of the level to load
     */
    startLevel(levelNumber: number) {

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
                this.blackPanel?.on(Node.EventType.TOUCH_END, this.onBlackPanelClick, this);
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




        // Clear previous goal items to avoid duplicates
        this.items?.removeAllChildren();
        this.blockItems?.removeAllChildren();

        // GOAL_BLOCK is a 2D array where each sub-array has [spriteIndex, count]
        // Add goal block items to both 'items' and 'blockItems' nodes
        if (Array.isArray(goals.GOAL_BLOCK)) {
            for (const goal of goals.GOAL_BLOCK) {
                if (goal.length >= 2) {
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

                const sprite = background.getComponent(Sprite);if (sprite) {
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


    /**
     * Attach touch listeners to game panel.
     */
    initCookieDrag() {
        this.gamePanel.on(Node.EventType.TOUCH_START, this.onCookieTouchStart, this);
        this.gamePanel.on(Node.EventType.TOUCH_MOVE, this.onCookieTouchMove, this);
        this.gamePanel.on(Node.EventType.TOUCH_END, this.onCookieTouchEnd, this);
    }

    /**
     * Handle initial cookie touch.
     */
    onCookieTouchStart(event: EventTouch) {
        const uiPos = event.getUILocation(); // Vec2
        this.dragStartGrid = this.getGridIndexFromPosition(uiPos);

        this.swapPerformed = false;
    }

    /**
     * Handle dragging motion and swap if moved into neighbor.
     */
    onCookieTouchMove(event: EventTouch) {
        if (!this.dragStartGrid || this.swapPerformed) return;

        const currentPos = event.getUILocation();
        const currentGrid = this.getGridIndexFromPosition(currentPos);
        if (!currentGrid) return;

        const { row: r1, col: c1 } = this.dragStartGrid;
        const { row: r2, col: c2 } = currentGrid;
        if(currentGrid && r1 && c1) {
            if(this.currentGameState[r1][c1] === 1 || this.currentGameState[r2][c2] === 1) return;
            if(this.currentMapState[r1-8][c1] === 6  || this.currentMapState[r2-8][c2] === 6) return;
            if(this.currentMapState[r1-8][c1] === 8 || this.currentMapState[r2-8][c2] === 8) return;
        }
        // If adjacent and not same
        if ((Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1) {
            this.swapCookies(r1, c1, r2, c2);
            this.swapPerformed = true;
        }

    }


    /**
     * Handle touch end and reset drag state.
     */
    onCookieTouchEnd(event: EventTouch) {
        this.dragStartGrid = null;
        this.swapPerformed = false;
    }

    /**
     * Convert UI touch position to grid cell.
     */
    getGridIndexFromPosition(uiPos: Vec2): { row: number, col: number } | null {
        for (let row = 8; row < 16; row++) {
            for (let col = 0; col < 8; col++) {
                const cubeNode = this.gamePanel.getChildByName(`CubeItem_${row}_${col}`);
                const cookieNode = cubeNode.getChildByName('Cookie');
                if (!cubeNode || !cubeNode.active) continue;
                if(!cookieNode || !cookieNode.active) continue;

                const transform = cubeNode.getComponent(UITransform);
                if (!transform) continue;

                const worldPos = transform.convertToWorldSpaceAR(Vec3.ZERO);
                const size = transform.contentSize;
                const halfW = size.width / 2;
                const halfH = size.height / 2;

                if (
                    uiPos.x >= worldPos.x - halfW &&
                    uiPos.x <= worldPos.x + halfW &&
                    uiPos.y >= worldPos.y - halfH &&
                    uiPos.y <= worldPos.y + halfH
                ) {
                    return { row, col };
                }
            }
        }
        return null;
    }


    /**
     * Swap cookie data and visuals between two grid cells.
     */


    swapCookies(r1: number, c1: number, r2: number, c2: number) {
        const cube1 = this.gamePanel.getChildByName(`CubeItem_${r1}_${c1}`);
        const cube2 = this.gamePanel.getChildByName(`CubeItem_${r2}_${c2}`);
        if (!cube1 || !cube2) return;

        const cookie1 = cube1.getChildByName('Cookie');
        const cookie2 = cube2.getChildByName('Cookie');
        if (!cookie1 || !cookie2) return;

        const sp1 = cookie1.getComponent(Sprite);
        const sp2 = cookie2.getComponent(Sprite);
        const originalFrame1 = sp1?.spriteFrame;
        const originalFrame2 = sp2?.spriteFrame;

        const originalVal1 = this.currentGameState[r1][c1];
        const originalVal2 = this.currentGameState[r2][c2];

        // Swap in memory (simulate swap)
        this.currentGameState[r1][c1] = originalVal2;
        this.currentGameState[r2][c2] = originalVal1;

        const hasMatch =
            this.checkMatchAt(r1, c1) || this.checkMatchAt(r2, c2);

        if (hasMatch) {
            // ✔ Match → animate and update visuals
            const targetPos1 = cube1.inverseTransformPoint(new Vec3(), cube2.getWorldPosition());
            const targetPos2 = cube2.inverseTransformPoint(new Vec3(), cube1.getWorldPosition());

            tween(cookie1).to(0.1, { position: targetPos1 })
                .call(() => {
                    if (sp1 && sp2) {
                        sp1.spriteFrame = originalFrame2!;
                        sp2.spriteFrame = originalFrame1!;
                    }
                    cookie1.setPosition(new Vec3(0, 0, 0));
                })
                .start();

            tween(cookie2).to(0.1, { position: targetPos2 })
                .call(() => {
                    cookie2.setPosition(new Vec3(0, 0, 0));
                })
                .start();

                this.runMatchCycle();
            // this.scheduleOnce(() => {
            //     const matched = this.findAllMatches();
            //     if (matched.length > 0) {
            //         this.destroyMatchedCookies(matched);

            //         this.scheduleOnce(() => {
            //             this.dropCookiesDown();
            //         }, 0.15);
            //     }
            // }, 0.15);

        } else {
            // ✘ No Match → revert memory state
            this.currentGameState[r1][c1] = originalVal1;
            this.currentGameState[r2][c2] = originalVal2;

            const pos1 = cookie1.getPosition().clone();
            const pos2 = cookie2.getPosition().clone();

            const targetPos1 = cube1.inverseTransformPoint(new Vec3(), cube2.getWorldPosition());
            const targetPos2 = cube2.inverseTransformPoint(new Vec3(), cube1.getWorldPosition());

            // Animate to new positions first
            tween(cookie1).to(0.1, { position: targetPos1 }).start();
            tween(cookie2).to(0.1, { position: targetPos2 }).start();

            // Then move back and restore visuals
            this.scheduleOnce(() => {
                tween(cookie1)
                    .to(0.1, { position: pos1 })
                    .call(() => {
                        if (sp1) sp1.spriteFrame = originalFrame1;
                        cookie1.setPosition(pos1);
                    })
                    .start();

                tween(cookie2)
                    .to(0.1, { position: pos2 })
                    .call(() => {
                        if (sp2) sp2.spriteFrame = originalFrame2;
                        cookie2.setPosition(pos2);
                    })
                    .start();
            }, 0.1);
        }
    }



    checkMatchAt(row: number, col: number): boolean {
        const value = this.currentGameState[row][col];
        if (!value || value === 0) return false;

        let count = 1;

        // --- Horizontal check
        // left
        let c = col - 1;
        while (c >= 0 && this.currentGameState[row][c] === value) {
            count++; c--;
        }
        // right
        c = col + 1;
        while (c < 8 && this.currentGameState[row][c] === value) {
            count++; c++;
        }
        if (count >= 3) return true;

        // --- Vertical check
        count = 1;
        // up
        let r = row - 1;
        while (r >= 8 && this.currentGameState[r][col] === value) {
            count++; r--;
        }
        // down
        r = row + 1;
        while (r < 16 && this.currentGameState[r][col] === value) {
            count++; r++;
        }
        return count >= 3;
    }

    findAllMatches(): { row: number, col: number }[] {
        const matches: { row: number, col: number }[] = [];
        const visited = new Set<string>();
    
        const mark = (r: number, c: number) => {
            const key = `${r},${c}`;
            if (!visited.has(key)) {
                visited.add(key);
                matches.push({ row: r, col: c });
            }
        };
    
        const isMatchable = (val: number): boolean => {
            return val !== 7 && val !== 6 && val !== 8 && val < 30;
        };
    
        // Horizontal
        for (let row = 8; row < 16; row++) {
            let col = 0;
            while (col < 8) {
                const val = this.currentGameState[row][col];
                if (!isMatchable(val)) {
                    col++;
                    continue;
                }
                let end = col + 1;
                while (end < 8 && this.currentGameState[row][end] === val) end++;
                if (end - col >= 3) for (let i = col; i < end; i++) mark(row, i);
                col = end;
            }
        }
    
        // Vertical
        for (let col = 0; col < 8; col++) {
            let row = 8;
            while (row < 16) {
                const val = this.currentGameState[row][col];
                if (!isMatchable(val)) {
                    row++;
                    continue;
                }
                let end = row + 1;
                while (end < 16 && this.currentGameState[end][col] === val) end++;
                if (end - row >= 3) for (let i = row; i < end; i++) mark(i, col);
                row = end;
            }
        }
    
        // Square (2x2)
        for (let row = 8; row < 15; row++) {
            for (let col = 0; col < 7; col++) {
                const val = this.currentGameState[row][col];
                if (!isMatchable(val)) continue;
                if (
                    this.currentGameState[row][col + 1] === val &&
                    this.currentGameState[row + 1][col] === val &&
                    this.currentGameState[row + 1][col + 1] === val
                ) {
                    mark(row, col);
                    mark(row, col + 1);
                    mark(row + 1, col);
                    mark(row + 1, col + 1);
                }
            }
        }
    
        return matches;
    }

    destroyMatchedCookies(matched: { row: number, col: number }[]): Promise<void> {
        return new Promise((resolve) => {
            let completed = 0;
            const total = matched.length;
    
            if (total === 0) return resolve();
    
            for (const { row, col } of matched) {
                const cube = this.gamePanel.getChildByName(`CubeItem_${row}_${col}`);
                if (!cube) {
                    completed++;
                    if (completed === total) resolve();
                    continue;
                }
                const cookie = cube.getChildByName('Cookie');
                if (cookie) {
                    tween(cookie)
                        .to(0.2, { scale: new Vec3(0, 0, 0) })
                        .call(() => {
                            cookie.destroy();
                            this.currentGameState[row][col] = 7;
                            completed++;
                            if (completed === total) resolve();
                        })
                        .start();
                } else {
                    this.currentGameState[row][col] = 7;
                    completed++;
                    if (completed === total) resolve();
                }
            }
        });
    }
    async dropCookiesDown(): Promise<boolean> {
        const dropAnims: Promise<void>[] = [];
        let moved = false;
    
        for (let col = 0; col < 8; col++) {
            for (let row = 15; row >= 8; row--) {
                if (this.currentGameState[row][col] !== 7) continue;
    
                let sourceRow = row - 1;
                while (sourceRow >= 0) {
                    const val = this.currentGameState[sourceRow][col];
                    if (val !== 7 && val !== 1) {
                        // 💾 Update data
                        this.currentGameState[row][col] = val;
                        this.currentGameState[sourceRow][col] = 7;
    
                        const sourceCube = this.gamePanel.getChildByName(`CubeItem_${sourceRow}_${col}`);
                        const targetCube = this.gamePanel.getChildByName(`CubeItem_${row}_${col}`);
                        const cookieNode = sourceCube?.getChildByName('Cookie');
    
                        if (cookieNode && targetCube) {
                            const worldPos = cookieNode.getWorldPosition();
                            cookieNode.setParent(targetCube);
                            const localPos = targetCube.getComponent(UITransform)?.convertToNodeSpaceAR(worldPos) || new Vec3(0, 0, 0);
                            cookieNode.setPosition(localPos);
    
                            // 🟢 FIX: Always activate before drop
                            cookieNode.active = true;
    
                            // 📦 Collect drop animation promise
                            const anim = new Promise<void>((resolve) => {
                                tween(cookieNode)
                                    .to(0.3, { position: new Vec3(0, 0, 0) }, { easing: 'quadIn' })
                                    .call(() => resolve())
                                    .start();
                            });
                            dropAnims.push(anim);
                        }
    
                        moved = true;
                        break;
                    }
                    sourceRow--;
                }
            }
        }
    
        // 🔁 Wait for all animations to finish together
        await Promise.all(dropAnims);
        return moved;
    }

    fillAbovePanelAfterDrop(): Promise<void> {
        return new Promise((resolve) => {
            const currentLevel = JSON.parse(localStorage.getItem('currentLevel') || '1');
            const pool = this.getPossibleCookiesForLevel(currentLevel);
    
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    if (this.currentGameState[row][col] !== 7) continue;
    
                    const avoid = new Set<number>();
                    if (col >= 2 && this.currentGameState[row][col - 1] === this.currentGameState[row][col - 2])
                        avoid.add(this.currentGameState[row][col - 1]);
                    if (row >= 2 && this.currentGameState[row - 1][col] === this.currentGameState[row - 2][col])
                        avoid.add(this.currentGameState[row - 1][col]);
                    if (
                        row >= 1 && col >= 1 &&
                        this.currentGameState[row - 1][col - 1] === this.currentGameState[row - 1][col] &&
                        this.currentGameState[row - 1][col] === this.currentGameState[row][col - 1]
                    ) {
                        avoid.add(this.currentGameState[row - 1][col]);
                    }
    
                    const candidates = pool.filter(v => !avoid.has(v));
                    const chosen = candidates.length > 0
                        ? candidates[Math.floor(Math.random() * candidates.length)]
                        : pool[Math.floor(Math.random() * pool.length)];
    
                    this.currentGameState[row][col] = chosen;
    
                    const cubeNode = this.gamePanel.getChildByName(`CubeItem_${row}_${col}`);
                    if (!cubeNode.getChildByName('Cookie')) {
                        const cookieNode = instantiate(this.cookieItem);
                        cookieNode.active = false;
                        cookieNode.getComponent(Sprite).spriteFrame = this.spriteFrames[chosen - 10];
                        cubeNode.addChild(cookieNode);
                    }
                }
            }
    
            resolve();
        });
    }

    async runMatchCycle() {
        while (true) {
            const matches = this.findAllMatches();
            if (matches.length === 0) break;
    
            await this.destroyMatchedCookies(matches);
            await this.dropCookiesDown();
            await this.fillAbovePanelAfterDrop();
        }
    }
}