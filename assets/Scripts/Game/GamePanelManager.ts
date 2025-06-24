import { Node, Sprite, SpriteFrame, UITransform } from 'cc';

/**
 * Draws tile backgrounds with appropriate sprite frames based on neighbors.
 * @param gamePanel The parent node that contains all CubeItem nodes.
 * @param cubeItem The prefab node used to name-match each tile (for structure reference).
 * @param gridBackgroundFrames SpriteFrames: 0-middle, 1-left, 2-right, 3-top, 4-bottom, 5-left_top, 6-left_bot, 7-right_top, 8-right_bot
 * @param grid The 8×8 part of the level data grid (should be grid[8..15])
 */
export function drawGridTilesWithRoundedEdges(
    gamePanel: Node,
    cubeItem: Node,
    gridBackgroundFrames: SpriteFrame[],
    grid: number[][]
) {
    const TILE_ROWS = 8;
    const TILE_COLS = 8;

    for (let row = 0; row < TILE_ROWS; row++) {
        for (let col = 0; col < TILE_COLS; col++) {
            const realRow = row + 8;
            const value = grid[realRow][col];

            if (value === 1) continue; // unused tile, skip

            const nodeName = `CubeItem_${realRow}_${col}`;
            const tileNode = gamePanel.getChildByName(nodeName);
            if (!tileNode) continue;

            // Check for neighbors (value !== 1 is usable)
            const top = realRow > 0 && grid[realRow - 1][col] !== 1;
            const bottom = realRow < 15 && grid[realRow + 1][col] !== 1;
            const left = col > 0 && grid[realRow][col - 1] !== 1;
            const right = col < 7 && grid[realRow][col + 1] !== 1;

            // Determine sprite type
            let spriteIndex = 0; // default: middle

            if (!top && left && right && bottom) spriteIndex = 3; // top
            else if (!bottom && left && right && top) spriteIndex = 4; // bottom
            else if (!left && top && bottom && right) spriteIndex = 1; // left
            else if (!right && top && bottom && left) spriteIndex = 2; // right
            else if (!top && !left) spriteIndex = 5; // left_top
            else if (!bottom && !left) spriteIndex = 6; // left_bot
            else if (!top && !right) spriteIndex = 7; // right_top
            else if (!bottom && !right) spriteIndex = 8; // right_bot
            // otherwise: middle

            // Get or create the background node
            let background = tileNode.getChildByName('background');
            if (!background) {
                background = new Node('background');
                background.addComponent(UITransform).setContentSize(90, 90);
                tileNode.addChild(background);
            }

            // Set sprite
            let sprite = background.getComponent(Sprite);
            if (!sprite) {
                sprite = background.addComponent(Sprite);
            }
            sprite.spriteFrame = gridBackgroundFrames[spriteIndex];
        }
    }
}