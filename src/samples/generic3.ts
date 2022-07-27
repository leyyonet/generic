import {AbstractDto, Cast2} from "@leyyo/cast";
import {printDetailed, TypeOpt} from "@leyyo/core";

class C1 extends AbstractDto {
    @Cast2("string")
    firstName: string;

    static cast(value: unknown, opt?: TypeOpt): C1 {
        return super.ly_inner<C1>(C1, value, opt);
    }

}
class C2 extends C1 {
    @Cast2("string")
    lastName: string;
    static cast(value: unknown, opt?: TypeOpt): C2 {
        return super.ly_inner<C2>(C2, value, opt);
    }
}
class C3 extends C2 {
    @Cast2("string")
    city: string;
    static cast(value: unknown, opt?: TypeOpt): C3 {
        return super.ly_inner<C3>(C3, value, opt);
    }
}
export function sample3() {
    const c1a = new C1();
    c1a.firstName = 11 as unknown as string;
    printDetailed('c1a', JSON.stringify(c1a));
    const c1b = new C1();
    c1b.firstName = 'mustafa';
    printDetailed('c1b', JSON.stringify(c1b));
    printDetailed('c1a', JSON.stringify(c1a));
    printDetailed('c1c', JSON.stringify(C1.cast({firstName: true})));

    const c2a = new C2();
    c2a.firstName = 21 as unknown as string;
    c2a.lastName = (() => [' ali ']) as unknown as string;
    printDetailed('c2a', JSON.stringify(c2a));
    const c2b = new C2();
    c2b.firstName = 22 as unknown as string;
    c2b.lastName = [' veli '] as unknown as string;

    printDetailed('c2b', JSON.stringify(c2b));
    printDetailed('c2a', JSON.stringify(c2a));
    printDetailed('c2c', JSON.stringify(C2.cast({firstName: true, lastName: {id:3}})));

    const c3a = new C3();
    c3a.firstName = 21 as unknown as string;
    c3a.lastName = (() => [' ali ']) as unknown as string;
    c3a.city = ' simav ';
    printDetailed('c3a', JSON.stringify(c3a));
    const c3b = new C3();
    c3b.firstName = 22 as unknown as string;
    c3b.lastName = [' veli '] as unknown as string;

    printDetailed('c3b', JSON.stringify(c3b));
    printDetailed('c3a', JSON.stringify(c3a));
    const c3c = C3.cast({firstName: true, lastName: {id:3}});
    printDetailed('c3c', JSON.stringify(c3c));

}
