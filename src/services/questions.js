import axios from "axios";
import { Preferences } from '@capacitor/preferences';
import categories from "/data/category.json";

const APIURL = 'https://opentdb.com/api.php'
const TOKENURL = 'https://opentdb.com/api_token.php'

// response codes of the OpenTDB API, see https://opentdb.com/api_config.php
const TOKEN_NOT_FOUND = 3
const TOKEN_EMPTY = 4

/**
 * Returns the anonymous OpenTDB session token, which makes sure no question is delivered twice.
 * Requests a new one if none is stored yet.
 * @returns token or null if it could not be requested
 */
async function getToken() {
    const stored = (await Preferences.get({key: 'apiToken'})).value
    if (stored) {
        return stored
    }
    try {
        const res = await axios.get(TOKENURL, {params: {command: 'request'}})
        if (res.data.response_code === 0 && res.data.token) {
            await Preferences.set({key: 'apiToken', value: res.data.token})
            return res.data.token
        }
    } catch (err) {
        console.log('Session token could not be requested', err)
    }
    return null
}

/**
 * Fixes the stored token after the API rejected it, so the next request works again.
 * @param token
 * @param responseCode
 */
async function handleTokenError(token, responseCode) {
    if (responseCode === TOKEN_NOT_FOUND) {
        // expired after 6 hours of inactivity, a new one is requested with the next call
        await Preferences.remove({key: 'apiToken'})
    } else if (responseCode === TOKEN_EMPTY) {
        // all questions for the current settings were delivered, start over
        try {
            await axios.get(TOKENURL, {params: {command: 'reset', token: token}})
        } catch (err) {
            await Preferences.remove({key: 'apiToken'})
        }
    }
}

/**
 * Api Request for new Question
 * @returns ApiResponse
 */
export async function getQuestions(){
    let difficulty = (await Preferences.get({key: 'difficulty'})).value;
    let category = (await Preferences.get({key: 'category'})).value;
    let token = await getToken();

    let params = {
        amount: 10,
        type: 'multiple'
    }

    if (difficulty && difficulty !== 'rand'){
        params.difficulty = difficulty
    }

    if (category && category !== 'rand'){
        params.category = category
    }

    if (token){
        params.token = token
    }

    const res = await axios({
        method: 'get',
        url: APIURL,
        params: params
    })

    // the caller retries on these codes, the token is fixed until then
    if (token && (res.data.response_code === TOKEN_NOT_FOUND || res.data.response_code === TOKEN_EMPTY)) {
        await handleTokenError(token, res.data.response_code)
    }

    return res
}

/**
 * returns all categories
 * @returns categories
 */
export function getCategories(){
    return categories.categories
}

/**
 * returns the API parameter of a category by its name in the stats (HTML-encoded "raw" or plain name)
 * @param statsKey
 * @returns param or null for categories that are not in the list
 */
export function getCategoryParam(statsKey){
    const cat = categories.categories.find(c => (c.raw ?? c.name) === statsKey)
    return cat ? cat.param : null
}
