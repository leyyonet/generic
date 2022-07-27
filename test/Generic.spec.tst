import * as dotenv from "dotenv";
// it's important, it must run before core
dotenv.config();
import {leyyo} from "@leyyo/core";
leyyo.base.lyyDebug(false);

import { strict as assert } from 'assert';

describe('generic', () => {
    it('todo', () => {
        assert.deepEqual(2-1, 1);
    });
    it('Generics should be run', () => {
        const parser = CallbackGenericParser.ins();
        const text = 'Array<Record<Enum<Language>,Array<Array<string>>>>';
        // noinspection JSCheckFunctionSignatures
        assert.deepStrictEqual(parser.stringify(parser.parse(text)), text);
    });

    /*    describe(arrayType.name, () => {
        it('cast Array<integer>', () => {
            assert.deepEqual(callback.generic.run('Array<integer>', ['1', '2']), [1, 2]);
        });
        it('cast Array<integer>', () => {
            assert.deepEqual(callback.generic.run('Array<integer>', [1.2, 2.1]), [1, 2]);
        });
    });
    describe(objectType.name, () => {
        it('cast Record<string, integer>', () => {
            assert.deepEqual(callback.generic.run('Record<string, integer>', {'a': '1', 'b': '2'}), {a:1, b:2});
        });
    });
    describe('enumHelper', () => {
        it('cast Enum<Language>', () => {
            assert.deepEqual(callback.generic.run('Enum<Language>', 'TR'), languageEnum.Id.tr);
        });
        it('cast Record<Enum<Language>, string>', () => {
            assert.deepEqual(callback.generic.run('Record<Enum<Language>, string>', {TR: 1, EN: 2}), {tr: '1', en: '2'});
        });
    });*/
});