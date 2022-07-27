import {FuncLike, RecLike, TypeOpt} from "@leyyo/core";
import {CastApiDocResponse, CastCheckResult, CastName, CastTransfer} from "@leyyo/cast";
import {CallbackLike} from "@leyyo/callback";

export interface GenericTreeLike {
    base?: string;
    children?: Array<GenericTreeLike>;
    toJSON?(): RecLike;
}
export type GenericInput = CastName|GenericTreeLike;
export type GenericGenLambda<T = unknown, O extends TypeOpt = TypeOpt> = (clazz: GenericInput, value: unknown, opt?: O) => T;
export type GenericDocLambda<O extends TypeOpt = TypeOpt> = (target: unknown, propertyKey: PropertyKey, clazz: GenericInput, openApi: RecLike, opt?: O) => CastApiDocResponse;
export type GenericChildLambda = (...children: Array<GenericInput>) => GenericTreeLike;
//childGen(key: GenericInput, value: GenericInput)
export interface GenericLike<T = unknown, O extends TypeOpt = TypeOpt> extends RecLike {
    minGen?: number;
    maxGen?: number;
    gen: GenericGenLambda<T, O>;
    docGen: GenericDocLambda<O>;
    childGen: GenericChildLambda;
}
export interface GenericTransfer<T> extends CastTransfer<T> {
    tree?: GenericTreeLike;
}
export interface GenericPoolLike extends CallbackLike<GenericLike> {
    add(value: GenericLike, ...aliases: Array<string>): void;
    ly_checkClass(rec: GenericLike, isChild?: boolean, throwable?: boolean): CastCheckResult;
    get staging(): Map<string, Array<GenericTransfer<GenericInput>>>;
    run<T>(clazz: GenericInput, value: unknown, opt?: TypeOpt): T;
    copy(source: GenericLike|FuncLike, target: FuncLike): void;
    buildTree(parent: string, ...children: Array<GenericInput>): GenericTreeLike;
    toTree(given: GenericInput): GenericTreeLike;
    parse(given: unknown): GenericTreeLike;
    stringify(tree: GenericTreeLike): string;
    fromArray(arr: Array<unknown>): GenericTreeLike;
    toArray(tree: GenericTreeLike): Array<unknown>;
    fromObject(obj: RecLike): GenericTreeLike;
    toObject(tree: GenericTreeLike): RecLike;
}