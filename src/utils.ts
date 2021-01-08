import { FormatOption, Type } from './Type';

/**
 * 生成重复字符的字符串
 * @param char 字符
 * @param count 字符个数
 */
export function repeatChar(char: string, count: number) {
    let res = "";
    for (let i = 0; i < count; i++) {
        res += char;
    }
    return res;
}

/**
 * 给字符串的每一行增加缩进
 * @param str 字符串
 * @param char 缩进字符
 * @param count 缩进个数
 */
export function addIndent(str: string, char: string, count: number) {
    return str.replace(/^/gm, repeatChar(char, count));
}

/**
 * 转换数据类型为对应字符串
 * @param type 数据类型
 */
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

/**
 * 展开对象的配置
 */
export interface ExpandItemOption {
    /**
     * 格式化配置
     */
    option: Required<FormatOption>;
    /**
     * 头部，内容不折行
     */
    header: (string | number | undefined)[];
    /**
     * 体部，内容折行
     */
    body: (string | number | undefined)[];
}

/**
 * 缓存转换为wat字符串
 * @param buffer 缓存
 */
export function bufferToString(buffer: ArrayBuffer): string {
    let td = new TextDecoder();
    let txt = td.decode(buffer).replace(/\W/g, $$ => {
        let txt = $$.charCodeAt(0).toString(16);
        return txt.length < 2 ? `\\0${txt}` : `\\${txt}`;
    })
    return txt.length ? `"${txt}"` : "";
}

/**
 * 转换字符串为，wat中的导入、导出名称
 * @param str 字符串
 */
export function ImportExportName(str: string): string {
    return `"${str.replace(/"/g, "\\\"")}"`;
}

/**
 * 将字符串改为wat中的$name格式
 * @param name 名称
 */
export function itemName(name: string | number | undefined): string | undefined {
    return name ? `$${name}` : undefined;
}

/**
 * 过滤不转化wat字符的数据的谓词
 * @param val 数据
 */
function dataFilter(val: any) {
    return ![undefined, ""].includes(val);
}

/**
 * 展开对象
 * @param param0 展开对象的配置
 */
export function expandItem({ option, header, body }: ExpandItemOption): string {
    return [
        `(${header.filter(dataFilter).join(" ")}`,
        ...body.filter(dataFilter).map(it => addIndent(it as string, option.indentChar, option.indent)),
        ")"
    ].join("\n");
}

/**
 * 展开指令
 * @param param0 展开指令的配置
 */
export function expandInstr({ option, header, body, end }: ExpandItemOption & { end: string }): string {
    return [
        `${header.filter(dataFilter).join(" ")}`,
        ...body.filter(dataFilter).map(it => addIndent(it as string, option.indentChar, option.indent)),
        end
    ].join("\n");
}

/**
 * 扁平对象
 * @param strArr 字符串部分
 */
export function flatItem(...strArr: (string | number | undefined)[]): string {
    return `(${strArr.filter(dataFilter).join(" ")})`;
}

/**
 * 扁平指令
 * @param strArr 字符串部分
 */
export function flatInstr(...strArr: (string | number | undefined)[]): string {
    return strArr.filter(dataFilter).join(" ");
}