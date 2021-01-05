import { Type } from './Type';

export function stringOf(char: string, count: number) {
    let res = "";
    for (let i = 0; i < count; i++) {
        res += char;
    }
    return res;
}

export function addIndent(str: string, char: string, count: number) {
    return str.replace(/^/gm, stringOf(char, count));
}
export function typesToString(types: Type[]): string {
    let res: string[] = [];
    for (let type of types) {
        switch (type) {
            case Type.I32: res.push("i32"); break;
            case Type.I64: res.push("i64"); break;
            case Type.F32: res.push("f32"); break;
            case Type.F64: res.push("f64"); break;
            case Type.V128: res.push("v128"); break;
        }
    }
    return res.join(" ");
}