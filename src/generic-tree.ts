import {FuncLike, leyyo, RecLike} from "@leyyo/core";
import {GenericInput, GenericTreeLike} from "./index-types";
import {Fqn} from "../../fqn";
import {FQN_NAME} from "./internal-component";

@Fqn(...FQN_NAME)
export class GenericTree implements GenericTreeLike {
    base: string;
    children: Array<GenericTreeLike>;
    private static _childFormatter: FuncLike;

    constructor(base?: string, ...children: Array<GenericInput>) {
        this.base = base ?? null;
        this.children = children.map(child => GenericTree._childFormatter(child));
    }
    static ly_childFormatter(fn: FuncLike): void {
        if (!this._childFormatter) {
            this._childFormatter = fn;
        }
    }

    toJSON(): RecLike {
        const obj = {n: this.base} as RecLike;
        if (leyyo.is.array(this.children, true)) {
            obj.c = this.children.map(c => c.toJSON());
        }
        return obj;
    }
}