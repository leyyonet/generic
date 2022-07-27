// export function GenericAble2(min: number, max?: number, ...aliases: Array<string>): ClassDecorator {
//     const id = decoRepo.identify(GenericAble, {clazz: true});
//     return (target: unknown) => {
//         const fnc = target['gen'] as GenericLambda;
//         const name = fqn.get(target);
//         if (typeof fnc !== 'function') {
//             throw new DeveloperException('class.has.not.method', {name, method: 'gen'}).withHolder(this);
//         }
//         if (fnc.length < 2) {
//             throw new DeveloperException('insufficient.method.params', {name, method: 'gen', min: 2}).withHolder(this);
//         }
//         generic.addGen(fnc, {min, max}, name, ...aliases);
//         id.fork([target]).set({min, max, aliases});
//     };
// }
import {leyyo} from "@leyyo/core";
import {fqn} from "@leyyo/fqn";
import {reflectPool} from "@leyyo/reflection";
import {GenericLike} from "./index-types";
import {genericPool} from "./generic-pool";
import {FQN_NAME} from "./internal-component";

// @Generic('map<language, number>')
// @Generic({map: ['language', 'number']})

// @Generic('record<language, number>')
// @Generic({record: ['language', 'number']})

// @Generic('array<number>')
// @Generic({array: ['number']})
// @Generic(['number'])

// @Generic('set<number>')
// @Generic({set: ['number']})

// @Generic('Pagination<User,PageOffset>')
// @Generic({Pagination: ['User','PageOffset']})

// region AssignGeneric
export function AssignGeneric(...aliases: Array<string>): ClassDecorator {
    aliases = leyyo.primitive.array(aliases) ?? [];
    return (target) => {
        fqn.refresh(target);
        const like = target as unknown as GenericLike;
        if (genericPool.ly_checkClass(like, false, true) === 'self') {
            genericPool.add(like, ...aliases);
        } else {
            genericPool.add(target.prototype as GenericLike, ...aliases);
        }
        assignGenericId.fork(target).set({aliases});
    }
}
fqn.func(AssignGeneric, ...FQN_NAME);
const assignGenericId = reflectPool.identify(AssignGeneric, {clazz: true, notMultiple: true});

// endregion AssignGeneric
