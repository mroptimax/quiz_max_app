import axios from "axios";
import {Plugins} from "@capacitor/core";
import categories from "/data/category.json";

const {Storage} = Plugins;
const APIURL = 'https://opentdb.com/api.php'


export async function getQuestion(){
    let difficulty = (await Storage.get({key: 'difficulty'})).value;
    let category = (await Storage.get({key: 'category'})).value;

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


export function getCategories(){
    return categories.categories
}
