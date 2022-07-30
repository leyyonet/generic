import memoize from 'memoizee-decorator';
import {ArraySome, DeveloperException, FuncLike, leyyo, OneOrMore, printDetailed, RecLike, TypeOpt} from "@leyyo/core";
import {Bind, fqn, Fqn} from "@leyyo/fqn";
import {AbstractCallback} from "@leyyo/callback";
import {CastCheckResult, castPool, CastTransfer} from "@leyyo/cast";
import {GenericInput, GenericLike, GenericPoolLike, GenericTransfer, GenericTreeLike} from "./index-types";
import {COMPONENT_NAME, FQN_NAME} from "./internal-component";
import {GenericTree} from "./generic-tree";

// noinspection JSUnusedGlobalSymbols
@Fqn(...FQN_NAME)
@Bind()
export class GenericPool extends AbstractCallback<GenericLike> implements GenericPoolLike {
    // region properties
    protected static readonly _CHILD_FUNCTIONS = ['cast', 'docCast'];
    protected static readonly _MAIN_FUNCTIONS = ['gen', 'docGen', 'childGen'];
    protected readonly _map: Map<string, GenericTreeLike>;
    protected readonly _staging: Map<string, Array<GenericTransfer<GenericInput>>>;
    // endregion properties

    constructor() {
        super('generic', GenericPool);
        this._map = leyyo.repo.newMap<string, GenericTreeLike>(this, '_map');
        this._staging = leyyo.repo.newMap<string, Array<GenericTransfer<GenericInput>>>(this, '_staging');
        leyyo.component.add(COMPONENT_NAME);
        castPool.ly_initGen((dto) => this._fromCast(dto));
        GenericTree.ly_childFormatter((child) => this._toTree(child, true));
    }
    // region inherited
    add(value: GenericLike, ...aliases: Array<string>): void {
        super.add(value, ...aliases);
        const base = super.get(value);
        [base.basic, base.full, ...base.aliases].forEach(name => {
            if (name && this._staging.has(name)) {
                this._staging.get(name).forEach(dto => {
                    this._refactorProperty(dto, base.value);
                });
                this._staging.delete(name);
            }
        });
    }
    ly_checkClass(rec: GenericLike, isChild?: boolean, throwable?: boolean): CastCheckResult {
        if (!rec) {
            if (throwable) {
                throw new DeveloperException('generic.invalid-like', {rec}).with(this);
            }
            return null;
        }
        if (GenericPool._MAIN_FUNCTIONS.every(fn => (typeof rec[fn] === 'function'))) {
            return 'self';
        }
        const proto = rec.prototype;
        if (proto) {
            if (GenericPool._MAIN_FUNCTIONS.every(fn => (typeof proto[fn] === 'function'))) {
                return 'proto';
            }
        }
        if (isChild) {
            if (GenericPool._CHILD_FUNCTIONS.every(fn => (typeof rec[fn] === 'function'))) {
                return 'self';
            }
            if (proto) {
                if (GenericPool._CHILD_FUNCTIONS.every(fn => (typeof proto[fn] === 'function'))) {
                    return 'proto';
                }
            }
        }
        if (throwable) {
            throw new DeveloperException('generic.invalid-function', {rec, functions: GenericPool._MAIN_FUNCTIONS}).with(this);
        }
        return null;
    }

    // endregion inherited
    // region private
    protected _fromCast(dto: CastTransfer<GenericInput>): void {
        const tree = this.toTree(dto.clazz);
        if (!tree) {
            throw new DeveloperException('generic.invalid-definition', {clazz: dto.clazz}).with(this);
        }
        const rec = {...dto, tree} as GenericTransfer<GenericInput>;
        if (this.has(tree.base)) {
            this._refactorProperty(rec, super.get(tree.base).value);
        } else {
            this._toStaging(rec);
        }
    }
    protected _toTree(given: GenericInput, isChild = false): GenericTreeLike {
        if (leyyo.is.object(given) && given instanceof GenericTree) {
            return given;
        }
        if (typeof given === 'string') {
            const str = this.normalizeName(given);
            if (str) {
                return this.parse(str);
            }
        }
        else if (leyyo.is.func(given) && this.ly_checkClass(given as GenericLike, isChild)) {
            return this.buildTree(fqn.name(given));
        }
        else if (leyyo.is.array(given)) {
            if (given[0]) {
                return this.buildTree('Array', given[0]);
            }
        } else if (leyyo.is.object(given)) {
            if (this.ly_checkClass(given as GenericLike, isChild)) {
                return this.buildTree(fqn.name(given));
            }
            // todo
            // return this.fromObject(given as RecLike);
        }
        throw new DeveloperException('generic.invalid-definition', {clazz: given}).with(this);
        // return null;
    }
    protected _stringify(tree: OneOrMore<GenericTreeLike>): string {
        if (Array.isArray(tree)) {
            const list = [];
            tree.forEach(item => {
                list.push(this._stringify(item));
            });
            return list.join(',');
        }
        if (tree.children.length > 0) {
            return `${tree.base}<${this._stringify(tree.children)}>`;
        }
        return tree.base;
    }
    protected _array(tree: OneOrMore<GenericTreeLike>): Array<unknown> {
        if (Array.isArray(tree)) {
            if (tree.length < 1) {
                return [];
            }
            const list = [];
            tree.forEach(item => {
                list.push(this._array(item));
            });
            return list;
        }
        return [tree.base, ...this._array(tree.children)];
    }
    protected _fromObject(obj: RecLike): Array<GenericTreeLike> {
        const tree: Array<GenericTreeLike> = [];
        if (!leyyo.is.object(obj, true)) {
            return tree;
        }
        const keys = Object.keys(obj);
        keys.forEach(key => {
            tree.push(this.buildTree(key, ...this._fromObject(obj[key] as RecLike)));
        });
        return tree;
    }
    protected _toObject(tree: OneOrMore<GenericTreeLike>): RecLike {
        if (Array.isArray(tree)) {
            if (tree.length < 1) {
                return null;
            }
            const obj = {};
            tree.forEach(item => {
                obj[item.base] = this._toObject(item.children);
            });
            return obj;
        }
        return {[tree.base]: this._toObject(tree.children)};
    }
    protected _parse(values: string | ArraySome): OneOrMore<GenericTreeLike> {
        if (typeof values === 'string') {
            return this.buildTree(values);
        }
        // if (values.length === 1) {
        //     return {lambda: values[0] as string, children: []};
        // }
        let index = -1;
        const arr: Array<GenericTreeLike> = [];
        values.forEach(value => {
            if (Array.isArray(value)) {
                if (arr[index] === undefined) {
                    throw new Error('invalid index at ' + JSON.stringify(value));
                }
                arr[index].children = this._parse(value) as Array<GenericTreeLike>;
            } else {
                index++;
                arr[index] = this.buildTree(value as string);
            }
        });
        return arr;
    }
    protected _copy(source: unknown, target: FuncLike): boolean {
        if (source) {
            if (GenericPool._MAIN_FUNCTIONS.every(fn => (typeof source[fn] === 'function'))) {
                GenericPool._MAIN_FUNCTIONS.forEach(fn => {
                    target[fn] = (...a: ArraySome) => source[fn](...a);
                });
                return true;
            }
        }
        return false;
    }
    protected _toStaging(dto: CastTransfer<GenericInput>): void {
        const tree = this.toTree(dto.clazz);
        printDetailed('_toStaging', tree, dto.clazz);
        if (!this._staging.has(tree.base)) {
            this._staging.set(tree.base, []);
        }
        this._staging.get(tree.base).push({...dto, tree});
        // this.LOG.warn('_toStaging', {clazz: fqn.name(dto.target), property: dto.property});
        castPool.ly_defaultSetter(dto);
    }
    protected _refactorProperty(dto: GenericTransfer<GenericInput>, like: GenericLike): void {
        castPool.ly_refactorProperty(dto.target, dto.property, dto.opt, (v, opt) => like.gen(dto.clazz, v, opt));
    }
    // endregion private

    // region custom
    get staging(): Map<string, Array<GenericTransfer<GenericInput>>> {
        return this._staging;
    }

    @memoize({})
    run<T>(clazz: GenericInput, value: unknown, opt?: TypeOpt): T {
        const tree = this.toTree(clazz);
        if (!tree.base) {
            throw new DeveloperException('generic.invalid-definition', {clazz}).with(this);
        }
        if (tree.children.length < 1) {
            const castItem = castPool.fetchValue(tree.base);
            if (castItem) {
                return castItem.cast(value, opt) as T;
            }
        }
        const rec = this.fetchValue(tree.base);
        if (!rec) {
            throw new DeveloperException('generic.invalid-definition', {clazz: tree.base}).with(this);
        }
        if (leyyo.is.integer(rec.minGen) && rec.minGen > tree.children.length) {
            throw new DeveloperException('generic.invalid-min.child', {tree}).with(this);
        }
        if (leyyo.is.integer(rec.maxGen) && rec.maxGen < tree.children.length) {
            throw new DeveloperException('generic.invalid-max.child', {tree}).with(this);
        }
        return rec.gen(tree, value, opt) as T;
    }
    copy(source: GenericLike|FuncLike, target: FuncLike): void {
        if (!leyyo.is.func(source) && !leyyo.is.object(source)) {
            throw new DeveloperException('generic.invalid-source', {source});
        }
        if (!leyyo.is.func(target)) {
            throw new DeveloperException('generic.invalid-target', {target});
        }
        if (!this._copy(source, target) && !this._copy(source?.prototype, target)) {
            throw new DeveloperException('generic.absent-function', {source: fqn.name(source), target: fqn.name(target), functions: GenericPool._MAIN_FUNCTIONS}).with(this);
        }
        this.add(target as unknown as GenericLike);
    }
    buildTree(parent: string, ...children: Array<GenericInput>): GenericTreeLike {
        return new GenericTree(parent, ...children);
    }
    toTree(given: GenericInput): GenericTreeLike {
        return this._toTree(given, false);
    }

    @memoize({})
    parse(given: unknown): GenericTreeLike {
        const text = leyyo.primitive.text(given);
        if (!text) {
            return new GenericTree();
        }
        if (! this._map.has(text)) {
            const slf = this;
            let i = 0;
            function main() {
                const arr = [];
                let collected = '';
                while (i < text.length) {
                    const chr = text[i];
                    i++;
                    switch (chr) {
                        case ' ':
                            break;
                        case ',':
                            if (collected !== '') {
                                arr.push(slf.normalizeName(collected));
                                collected = '';
                            }
                            break;
                        case "<":
                            if (collected !== '') {
                                arr.push(slf.normalizeName(collected));
                                collected = '';
                            }
                            arr.push(main());
                            break;
                        case ">":
                            if (collected !== '') {
                                arr.push(slf.normalizeName(collected));
                                collected = '';
                            }
                            return arr;
                        default:
                            collected += chr;
                            break;
                    }
                }
                if (collected !== '') {
                    arr.push(slf.normalizeName(collected));
                }
                return arr;
            }
            this._map.set(text, this._parse(main() as ArraySome) as GenericTreeLike);
        }
        const tree: GenericTreeLike = this._map.get(text);
        return Array.isArray(tree) ? tree[0] : tree;
    }
    stringify(tree: GenericTreeLike): string {
        return this._stringify(tree);
    }
    fromArray(arr: Array<unknown>): GenericTreeLike {
        if (!Array.isArray(arr) || arr.length < 1) {
            return null;
        }
        const tree = this.buildTree(arr.shift());
        if (arr.length < 1) {
            return tree;
        }
        arr.forEach(item => {
            tree.children.push(this.fromArray(item));
        });
        return tree;
    }
    toArray(tree: GenericTreeLike): Array<unknown> {
        return this._array(tree);
    }
    fromObject(obj: RecLike): GenericTreeLike {
        const tree = this._fromObject(obj);
        return Array.isArray(tree) ? tree[0] : tree;
    }
    toObject(tree: GenericTreeLike): RecLike {
        return this._toObject(tree);
    }
    // endregion custom
}
export const genericPool: GenericPoolLike = new GenericPool();