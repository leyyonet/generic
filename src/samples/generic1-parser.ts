import {genericPool} from "../generic-pool";

const text = 'array<object<string, array<string>>>';
const tree = genericPool.parse(text);
const arr = genericPool.toArray(tree);
const obj = genericPool.toObject(tree);

export function sample1() {
    console.log('text', text);
    console.log('tree', JSON.stringify(tree));
    console.log('object', JSON.stringify(obj));
    console.log('array', JSON.stringify(arr));

    console.log('tree to text', genericPool.stringify(tree));
    console.log('tree to object', JSON.stringify(genericPool.fromObject(obj)));
    console.log('tree to array', JSON.stringify(genericPool.fromArray(arr)));
}