import {
    DeveloperException,
    Key,
    leyyo,
    printDetailed,
    RecLike,
    TypeArrayOpt, TypeChildOpt,
    TypeObjectOpt,
    TypeOpt
} from "@leyyo/core";
import {Bind, fqn, Fqn} from "@leyyo/fqn";
import {M} from "@leyyo/reflection";
import {AbstractDto, AssignCast, Cast, CastApiDocResponse, castPool} from "@leyyo/cast";

import {AssignGeneric} from "../index-annotations";
import {FQN_NAME} from "../internal-component";
import {genericPool} from "../generic-pool";
import {GenericInput, GenericTreeLike} from "../index-types";
import {GenericTree} from "../generic-tree";

@AssignGeneric('Array', 'List', 'Collection')
@AssignCast('Array', 'List', 'Collection')
@Fqn(...FQN_NAME)
@Bind()
class MyArray {
    static readonly minGen = 1;
    static readonly maxGen = 1;

    static docCast(target: unknown, propertyKey: PropertyKey, openApi: RecLike, opt?: TypeArrayOpt): CastApiDocResponse {
        return {type: 'array', items: {type: 'string'}};
        // return {type: 'array', items: {$ref: '#/components/schemas/Pet'}};
    }

    static cast<T = unknown>(value: unknown, opt?: TypeArrayOpt): Array<T> {
        return leyyo.primitive.array(value, opt);
    }
    static childGen(item: GenericInput): GenericTreeLike {
        return new GenericTree(fqn.name(MyArray), item);
    }

    static docGen(target: unknown, propertyKey: PropertyKey, clazz: GenericInput, openApi: RecLike, opt?: TypeArrayOpt): CastApiDocResponse {
        return undefined;
    }

    static gen<T = unknown>(clazz: GenericInput, value: unknown, opt?: TypeArrayOpt): Array<T> {
        const tree = genericPool.toTree(clazz);
        // printDetailed('====> MyArray.gen', {tree: tree.toJSON(), value});
        opt = opt ?? {};
        if (tree.children.length < 0) {
            return this.cast(value, opt);
        }
        const valueOpt = opt?.children?.value;
        if (valueOpt) {
            valueOpt.fn = null;
        }
        const arr = this.cast<T>(value, opt) ?? [];
        arr.forEach((item, index) => {
            arr[index] = genericPool.run(tree.children[0], item, valueOpt) as T;
        });
        return arr;
    }

    static {
        fqn.refresh(MyArray);
        castPool.copy(MyArray, Array);
        genericPool.copy(MyArray, Array);
    }
}

@AssignGeneric('Object', 'Record')
@AssignCast('Object', 'Record')
@Fqn(...FQN_NAME)
@Bind()
class MyObject {
    static readonly minGen = 1;
    static readonly maxGen = 2;

    static docCast(target: unknown, propertyKey: PropertyKey, openApi: RecLike, opt?: TypeObjectOpt): CastApiDocResponse {
        return {type: 'object', items: {}};
        // return {type: 'array', items: {$ref: '#/components/schemas/Pet'}};
    }

    static cast<T extends TypeChildOpt = TypeChildOpt>(value: unknown, opt?: TypeObjectOpt<T>): RecLike<T> {
        return leyyo.primitive.object(value, opt);
    }
    static docGen(target: unknown, propertyKey: PropertyKey, tree: GenericInput, openApi: RecLike, opt?: TypeObjectOpt): CastApiDocResponse {
        return {type: 'object', items: {}};
        // return {type: 'array', items: {$ref: '#/components/schemas/Pet'}};
    }
    static childGen(key: GenericInput, value: GenericInput) {
        return new GenericTree(fqn.name(MyObject), key ?? String, value);
    }

    static gen<T = unknown>(clazz: GenericInput, value: unknown, opt?: TypeObjectOpt): RecLike<T> {
        const tree = genericPool.toTree(clazz);
        // printDetailed('====> MyObject.gen', {tree: tree.toJSON(), value});
        opt = opt ?? {};
        if (tree.children.length < 1) {
            tree.children[0] = {base: 'String'};
            tree.children[1] = {base: 'Any'};
        } else if (tree.children.length < 2) {
            tree.children[1] = tree.children[0];
            tree.children[0] = {base: 'String'};
        }
        const valueOpt = opt?.children?.value;
        if (valueOpt) {
            valueOpt.fn = null;
        }
        const keyOpt = opt?.children?.key;
        if (keyOpt) {
            keyOpt.fn = null;
        }
        const obj = this.cast(value, opt) ?? {};
        const result = {} as RecLike<T>;
        let index = 0;
        for (const [k, v] of Object.entries(obj)) {
            const key = genericPool.run(tree.children[0], k, keyOpt) as Key;
            if (!leyyo.is.key(key)) {
                new DeveloperException(`Invalid key ${key}`).with(this).raise(!keyOpt?.silent);
            } else {
                result[key] = genericPool.run(tree.children[1], v, valueOpt) as T;
            }
            index++;
        }
        return result;
    }

    static {
        fqn.refresh(MyObject);
        castPool.copy(MyObject, Object);
        genericPool.copy(MyObject, Object);
    }
}

@AssignCast('string')
@Fqn(...FQN_NAME)
@Bind()
export class MyStr {
    static docCast(target: unknown, propertyKey: PropertyKey, openApi: RecLike, opt?: TypeOpt): CastApiDocResponse {
        return {type: 'string'};
    }

    static cast(value: unknown, opt?: TypeOpt): string {
        return leyyo.primitive.text(value, opt);
    }
}

@AssignCast('integer', 'rakam')
@Fqn(...FQN_NAME)
@Bind()
export class MyInt {
    @M()
    static docCast(target: unknown, propertyKey: PropertyKey, openApi: RecLike, opt?: TypeOpt): CastApiDocResponse {
        return {type: 'integer'};
    }
    @M()
    static cast(value: unknown, opt?: TypeOpt): number {
        return leyyo.primitive.integer(value, opt);
    }
}

@Fqn(...FQN_NAME)
@Bind()
export class C1 extends AbstractDto {
    @Cast('array<string>')
    surnames: Array<string>;

    static cast(value: unknown, opt?: TypeOpt): C1 {
        return super.ly_inner<C1>(C1, value, opt);
    }
}

@Fqn(...FQN_NAME)
@Bind()
export class C2 extends C1 {

    @Cast('string')
    static stt: string;

    @Cast('string')
    str: string;

    @Cast('list<string>')
    names: Array<string>;

    @Cast('list<Category>')
    categories: Array<unknown>;

    @Cast('collection<rakam>')
    ages: Array<number>;

    @Cast('object<string, integer>')
    levels: Record<string, number>;

    static cast(value: unknown, opt?: TypeOpt): C2 {
        return super.ly_inner<C2>(C2, value, opt);
    }
}

export function sample2() {
    // printDetailed('cast1', {sources: generic});
    // printDetailed('castPool.bases', JSON.stringify(castPool.bases));
    // printDetailed('castPool.staging', castPool.staging);
    // printDetailed('castPool.genPool', castPool.genPool);
    printDetailed('genericPool', genericPool.info);
    // printDetailed('genericPool.staging', genericPool.staging);

    const c1 = new C1();
    c1.surnames = 5 as unknown as string[]; // ['5']
    printDetailed('c1', JSON.stringify(c1));

    const c2a = new C2();
    c2a.ages = '4' as unknown as Array<number>;
    c2a.names = (() => 5) as unknown as Array<string>;
    c2a.surnames = false as unknown as Array<string>;
    c2a.levels = {'first': (() => 5), 'second': '2', third: 3.4, forth: false} as unknown as Record<string, number>;
    printDetailed('c2a', JSON.stringify(c2a));

    const c2b = new C2();
    c2b.str = ' 4 ';
    c2b.names = (() => 5) as unknown as Array<string>;
    c2b.surnames = false as unknown as Array<string>;
    printDetailed('c2b', JSON.stringify(c2b));

    const c2c = C2.cast({ages: '5', names: [3], surnames: () => ' true '});
    printDetailed('c2c', JSON.stringify(c2c));
}