import { Preferences } from '@capacitor/preferences';
import categories from "/data/category.json";

/**
 * Empty stats for one category
 */
function emptyCategoryStats() {
    return {
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
}

/**
 * Initial Setup for Stats
 */
export async function setupStats() {
    let stats = {}

    stats['count'] = 0;

    // the API returns some category names HTML-encoded, "raw" holds that variant
    categories.categories.forEach(cat => {
        stats[cat.raw ?? cat.name] = emptyCategoryStats()
    })

    await Preferences.set({key: 'stats', value: JSON.stringify(stats)})
    console.log('Stats initialized')
}

/**
 * returns the stored stats, initializes them first if they don't exist yet
 * @returns stats
 */
export async function getStats() {
    let value = (await Preferences.get({key: 'stats'})).value
    if (!value) {
        await setupStats()
        value = (await Preferences.get({key: 'stats'})).value
    }
    return JSON.parse(value)
}

/**
 *
 * @param category
 * @param difficulty
 * @param right Bool
 */
export async function addDataToStats(category, difficulty, right) {
    let stats = await getStats()

    stats.count += 1
    if (!stats[category] || !stats[category][difficulty]) {
        stats[category] = emptyCategoryStats()
    }
    if (right) {
        stats[category][difficulty].right += 1
    } else {
        stats[category][difficulty].wrong += 1
    }

    await Preferences.set({key: 'stats', value: JSON.stringify(stats)})
}

export async function resetStats() {
    await Preferences.remove({key: 'stats'})
    await Preferences.set({key: 'points', value: '0'})
    await setupStats()
}
