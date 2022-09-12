import axios from "axios";
import { Preferences } from '@capacitor/preferences';
import categories from "/data/category.json";

const APIURL = 'https://opentdb.com/api.php'

/**
 * Api Request for new Question
 * @returns ApiResponse
 */
export async function getQuestion(){
    let difficulty = (await Preferences.get({key: 'difficulty'})).value;
    let category = (await Preferences.get({key: 'category'})).value;

    let params = {
        amount: 1,
        type: 'multiple'
    }

    if (difficulty && difficulty !== 'rand'){
        params.difficulty = difficulty
    }

    if (category && category !== 'rand'){
        params.category = category
    }

    return axios({
        method: 'get',
        url: APIURL,
        params: params
    })
}

/**
 * returns all categories
 * @returns categories
 */
export function getCategories(){
    return categories.categories
}
