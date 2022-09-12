import { Preferences } from '@capacitor/preferences';
import categories from "/data/category.json";



/**
 * Initial Setup for Stats
 */
export async function setupStats() {
    let stats = {}

    stats['count'] = 0;

    categories.categories.forEach(cat => {
        stats[cat.name] = {
            "easy": {
                "right": 0,
                "wrong": 0
            },
            "medium": {
                "right": 0,
                "wrong": 0
            },
            "hard": {
                "right": 0,
                "wrong": 0
            }
        }
    })

    await Preferences.set({key: 'stats', value: JSON.stringify(stats)})
    console.log('Stats initialized')
}

/**
 *
 * @param category
 * @param difficulty
 * @param right Bool
 */
export async function addDataToStats(category, difficulty, right) {
    let stats = JSON.parse((await Preferences.get({key: 'stats'})).value)

    stats.count += 1
    if (right) {
        stats[category][difficulty].right += 1
    } else {
        stats[category][difficulty].wrong += 1
    }

    await Preferences.set({key: 'stats', value: JSON.stringify(stats)})
}
