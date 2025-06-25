import { resources, TextAsset } from 'cc';

// ----------------------
// Level Data Structure
// ----------------------
export interface LevelData {
    mapName: string;
    moves: number;
    score: number;
    grid: number[][];
    goals: {
      GOAL_BLOCK: number[][];
      GOAL_OBSTACLE: number;
      GOAL_BISCUIT: number;
      GOAL_DOWN: number;
      GOAL_CREAM: number;
    //   [key: string]: number | number[][];
    };
  }
// ----------------------
// Parse Level Text
// ----------------------
export function parseLevelText(text: string): LevelData {
    const lines = text.trim().split('\n');
    const mapName = lines[0].split(' ')[1];
    const moves = parseInt(lines[1].split(' ')[1]);
    const score = parseInt(lines[2].split(' ')[1]);

    const goals: Record<string, number | number[][]> = {};
    let i = 3;

    while (i < lines.length && lines[i].startsWith('GOAL')) {
        const [key, ...raw] = lines[i].split(' ');

        if (key === 'GOAL_BLOCK') {
            const valueGroups = raw.join(' ').split(' / ');
            goals[key] = valueGroups.map(group =>
                group.trim().split(' ').map(Number)
            );
        } else {
            goals[key] = parseInt(raw[0]);
        }

        i++;
    }

    const grid: number[][] = [];
    while (i < lines.length) {
        const row = lines[i].trim().split(' ').map(Number);
        grid.push(row);
        i++;
    }

    return { mapName, moves, score, grid, goals: goals as LevelData['goals'], };
}

// ----------------------
// Load + Parse Level File
// ----------------------
export function loadLevelFile(levelNumber: number): Promise<LevelData> {
    const filePath = `Levels/${levelNumber}`; // resources/levels/1.txt, etc.

    return new Promise((resolve, reject) => {
        resources.load(filePath, TextAsset, (err, asset) => {
            if (err || !asset) {
                reject(`Failed to load ${filePath}: ${err}`);
                return;
            }

            try {
                const levelData = parseLevelText(asset.text);
                resolve(levelData);
            } catch (e) {
                reject(`Failed to parse level file: ${e}`);
            }
        });
    });
}