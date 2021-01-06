import { FormatOption, Type } from './Type';

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
export function typeToString(type: Type): string {
    let map = {
        [Type.I32]: "i32",
        [Type.I64]: "i64",
        [Type.F32]: "f32",
        [Type.F64]: "f64",
        [Type.V128]: "v128",
    }
    return map[type];
}

export interface ExpandOption {
    option: Required<FormatOption>;
    header: (string | number | undefined)[];
    body: (string | number | undefined)[];
}

export function bufferToString(buffer: ArrayBuffer): string {
    let td = new TextDecoder();
    let txt = td.decode(buffer).replace(/\W/g, $$ => {
        let txt = $$.charCodeAt(0).toString(16);
        return txt.length < 2 ? `\\0${txt}` : `\\${txt}`;
    })
    return txt.length ? `"${txt}"` : "";
}

export function ImportExportName(str: string): string {
    return `"${str.replace(/"/g, "\\\"")}"`;
}

export function itemName(name: string | number | undefined): string | undefined {
    return name ? `$${name}` : undefined;
}

function dataFilter(val: any) {
    return ![undefined, ""].includes(val);
}

export function expandItem({ option, header, body }: ExpandOption): string {
    return [
        `(${header.filter(dataFilter).join(" ")}`,
        ...body.filter(dataFilter).map(it => addIndent(it as string, option.indentChar, option.indent)),
        ")"
    ].join("\n");
}

export function expandInstr({ option, header, body, end }: ExpandOption & { end: string }): string {
    return [
        `${header.filter(dataFilter).join(" ")}`,
        ...body.filter(dataFilter).map(it => addIndent(it as string, option.indentChar, option.indent)),
        end
    ].join("\n");
}

export function flatItem(...strArr: (string | number | undefined)[]): string {
    return `(${strArr.filter(dataFilter).join(" ")})`;
}

export function flatInstr(...strArr: (string | number | undefined)[]): string {
    return strArr.filter(dataFilter).join(" ");
}