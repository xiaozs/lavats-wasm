import { instructionSet } from './Instruction';
import { Type } from './Type';

/**
 * offset的包裹对象, 以应对js没有指针问题
 */
export interface Offset {
    /**
     * 偏移值
     */
    value: number;
}

// 文本编码器
let te = new TextEncoder();
// 文本解码器
let td = new TextDecoder();

/**
 * 缓存读取器
 */
export interface Reader<T> {
    (buffer: ArrayBuffer, offset: Offset): T;
}

/**
 * 缓存写入器
 */
export interface Writer<T> {
    (item: T): ArrayBuffer
}

/**
 * 字符串缓存写入器
 * @param str 字符串
 */
export function encodeString(str: string): ArrayBuffer {
    let length = encodeInt(str.length);
    let content = te.encode(str);
    return combin([
        length,
        content
    ])
}

/**
 * 数据类型 -> expr写入器 的映射
 */
let encodeExprMap = {
    [Type.I32]: (val: number) => {
        let code = instructionSet["i32.const"].code;
        let num = encodeInt(val);
        let end = instructionSet["end"].code;
        return combin([code, num, end])
    },
    [Type.I64]: (val: number) => {
        let code = instructionSet["i64.const"].code;
        let num = encodeInt(val);
        let end = instructionSet["end"].code;
        return combin([code, num, end])
    },
    [Type.F32]: (val: number) => {
        let code = instructionSet["f32.const"].code;
        let num = encodeF32(val);
        let end = instructionSet["end"].code;
        return combin([code, num, end])
    },
    [Type.F64]: (val: number) => {
        let code = instructionSet["f64.const"].code;
        let num = encodeF64(val);
        let end = instructionSet["end"].code;
        return combin([code, num, end])
    },
    [Type.V128]: (val: number) => { throw new Error("todo") }
};

/**
 * expr写入器
 * @param type 类型
 * @param val 值
 */
export function encodeExpr(type: Type, val: number): ArrayBuffer {
    let fn = encodeExprMap[type];
    return fn(val);
}

/**
 * 缓存写入器
 * @param buffer 缓存
 * @param isWriteSize 是否写入大写
 */
export function encodeBuffer(buffer: ArrayBuffer, isWriteSize = true) {
    let size = isWriteSize ? encodeInt(buffer.byteLength) : new ArrayBuffer(0);
    return combin([
        size,
        buffer
    ])
}

/**
 * 字符串读取器
 * @param buffer 缓存
 * @param offset 偏移
 */
export function decodeString(buffer: ArrayBuffer, offset: Offset): string {
    let length = decodeUint(buffer, offset);
    let start = offset.value;
    let end = start + length;
    let buf = buffer.slice(start, end);
    let content = td.decode(buf);
    offset.value += length;
    return content;
}

/**
 * uint读取器
 * @param buffer 缓存
 * @param offset 偏移
 */
export function decodeUint(buffer: ArrayBuffer, offset: Offset): number {
    let view = new Uint8Array(buffer);
    let value = 0;
    let byteLength = 0;
    while (true) {
        let u8 = view[offset.value + byteLength];
        let isEnd = (u8 & 0b1000_0000) === 0;
        u8 &= 0b0111_1111;
        value = value | (u8 << 7 * byteLength);
        byteLength++;

        if (isEnd) {
            offset.value += byteLength;
            return value;
        }
    }
}

/**
 * sint读取器
 * @param buffer 缓存
 * @param offset 偏移
 */
export function decodeSint(buffer: ArrayBuffer, offset: Offset): number {
    let view = new Uint8Array(buffer);
    let value = 0;
    let byteLength = 0;
    while (true) {
        let u8 = view[offset.value + byteLength];
        let isEnd = (u8 & 0b1000_0000) === 0;
        u8 &= 0b0111_1111;
        value = value | (u8 << 7 * byteLength);
        byteLength++;

        if (isEnd) {
            let shift = 32 - 7 * byteLength;
            value = value << shift >> shift;

            offset.value += byteLength;
            return value;
        }
    }
}

/**
 * f32读取器
 * @param buffer 缓存
 * @param offset 偏移
 */
export function decodeF32(buffer: ArrayBuffer, offset: Offset): number {
    let view = new DataView(buffer, offset.value, 4);
    offset.value += 4;
    return view.getFloat32(0);
}

/**
 * f64读取器
 * @param buffer 缓存
 * @param offset 偏移
 */
export function decodeF64(buffer: ArrayBuffer, offset: Offset): number {
    let view = new DataView(buffer, offset.value, 8);
    offset.value += 8;
    return view.getFloat64(0);
}

/**
 * 数组读取器
 * @param buffer 缓存
 * @param offset 偏移
 * @param reader 单个数组元素的读取器
 */
export function decodeArray<T>(buffer: ArrayBuffer, offset: Offset, reader: Reader<T>): T[] {
    let count = decodeUint(buffer, offset);
    let res: T[] = [];
    for (let i = 0; i < count; i++) {
        let obj = reader(buffer, offset);
        res.push(obj);
    }
    return res;
}

/**
 * 数据类型 -> expr读取器 的映射
 */
let decodeExprMap = {
    [Type.I32]: (buffer: ArrayBuffer, offset: Offset) => {
        offset.value += instructionSet["i32.const"].code.byteLength;
        let num = decodeUint(buffer, offset);
        offset.value += instructionSet["end"].code.byteLength;
        return num;
    },
    [Type.I64]: (buffer: ArrayBuffer, offset: Offset) => {
        offset.value += instructionSet["i64.const"].code.byteLength;
        let num = decodeUint(buffer, offset);
        offset.value += instructionSet["end"].code.byteLength;
        return num;
    },
    [Type.F32]: (buffer: ArrayBuffer, offset: Offset) => {
        offset.value += instructionSet["f32.const"].code.byteLength;
        let num = decodeF32(buffer, offset);
        offset.value += instructionSet["end"].code.byteLength;
        return num;
    },
    [Type.F64]: (buffer: ArrayBuffer, offset: Offset) => {
        offset.value += instructionSet["f32.const"].code.byteLength;
        let num = decodeF64(buffer, offset);
        offset.value += instructionSet["end"].code.byteLength;
        return num;
    },
    [Type.V128]: (buffer: ArrayBuffer, offset: Offset) => { throw new Error("todo") }
};

/**
 * expr读取器
 * @param buffer 缓存
 * @param offset 偏移
 * @param type 数据类型
 */
export function decodeExpr(buffer: ArrayBuffer, offset: Offset, type: Type): number {
    let fn = decodeExprMap[type];
    return fn(buffer, offset);
}

/**
 * 缓存读取器
 * @param buffer 缓存
 * @param offset 偏移
 * @param size 缓存大小
 */
export function decodeBuffer(buffer: ArrayBuffer, offset: Offset, size: number) {
    let start = offset.value;
    let end = start + size;
    offset.value += size;
    return buffer.slice(start, end);
}

/**
 * 装饰器的信息
 */
interface Deco {
    /**
     * 构造函数
     */
    target: Function,
    /**
     * 被修饰的属性名称
     */
    key: string;
    /**
     * 写入器
     */
    writer: (val: any, obj: any) => ArrayBuffer;
    /**
     * 读取器
     */
    reader: (buffer: ArrayBuffer, offset: Offset, obj: any, org?: number) => any;
    /**
     * 是否是size指示字段
     */
    isSize?: true;
    /**
     * 是否忽略该字段
     */
    ignore?: (obj: any) => boolean;
}

/**
 * 保存装饰器的数组
 */
let decos: Deco[] = [];

/**
 * 获取对象size字段之后所占的大小
 * @param arr 对象的各部分的缓存的数组
 * @param sizeIndex 代表size的缓存在数组中的索引
 */
function getSize(arr: ArrayBuffer[], sizeIndex: number): ArrayBuffer {
    let total = 0;
    for (let i = sizeIndex + 1; i < arr.length; i++) {
        let it = arr[i];
        total += it.byteLength;
    }
    return encodeInt(total);
}

/**
 * 对象的写入器
 * @param obj 对象
 */
export function encodeObject(obj: any): ArrayBuffer {
    let decosOfType = decos.filter(it => obj instanceof it.target);
    let res: ArrayBuffer[] = [];
    let ignoreKey: string | undefined;
    let sizeIndex: number | undefined;
    for (let { key, writer, isSize, ignore } of decosOfType) {
        if (ignoreKey === key) continue;

        if (ignore) {
            let isIgnore = ignore(obj);
            if (isIgnore) ignoreKey = key;
            continue;
        }

        if (isSize) {
            sizeIndex = res.length;
        }

        let val = obj[key];
        let buf = writer(val, obj);
        res.push(buf);
    }

    if (sizeIndex !== undefined) {
        let size = getSize(res, sizeIndex);
        res[sizeIndex] = size;
    }

    return combin(res);
}

/**
 * 对象的读取器
 * @param buffer 缓存
 * @param offset 偏移
 * @param type 对象的构造函数
 */
export function decodeObject(buffer: ArrayBuffer, offset: Offset, type: any) {
    let decosOfType = decos.filter(it => isExtends(type, it.target));
    let obj = new type();
    let org: number | undefined;
    let ignoreKey: string | undefined;
    for (let { key, reader, isSize, ignore } of decosOfType) {
        if (ignoreKey === key) continue;

        if (ignore) {
            let isIgnore = ignore(obj);
            if (isIgnore) ignoreKey = key;
            continue;
        }

        let value = reader(buffer, offset, obj, org);
        obj[key] = value;

        if (isSize) {
            org = offset.value;
        }
    }
    return obj;
}

/**
 * uint装饰器
 * @param target 原型
 * @param key 字段名称
 */
export const uint = (target: any, key: string): void => {
    decos.push({ target: target.constructor, key, writer: encodeInt, reader: decodeUint });
}

/**
 * sint装饰器
 * @param target 原型
 * @param key 字段名称
 */
export const sint = (target: any, key: string): void => {
    decos.push({ target: target.constructor, key, writer: encodeInt, reader: decodeSint });
}

/**
 * 字符串装饰器
 * @param target 原型
 * @param key 字段名称
 */
export const str = (target: any, key: string): void => {
    decos.push({ target: target.constructor, key, writer: encodeString, reader: decodeString });
}

/**
 * 缓存的装饰器
 * @param isWriteSize 是否写入缓存大小
 */
export const buf = (isWriteSize = true) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: val => encodeBuffer(val, isWriteSize),
        reader: (buffer, offset, obj, org) => {
            let size: number;
            if (isWriteSize) {
                size = decodeUint(buffer, offset);
            } else {
                let deco = decos.find(it => it.isSize);
                if (!deco) throw new Error(`${target.name}.${key}无法找到对应size`);
                let totalSize = obj[deco.key];
                size = totalSize - (offset.value - org!);
            }
            return decodeBuffer(buffer, offset, size);
        }
    });
}

/**
 * 数组的装饰器（对对象）
 * @param type 数组的元素的构造函数
 */
export const array = (type: Function) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: arr => encodeArray(arr, it => encodeObject(it)),
        reader: (buf, offset) => decodeArray(buf, offset, (buf, offset) => decodeObject(buf, offset, type))
    });
}

/**
 * 数组的装饰器（对多态对象）
 * @param map 数组的元素的构造函数映射
 */
export const arrayMap = (map: Record<number | string, Function>) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: arr => encodeArray(arr, it => encodeObject(it)),
        reader: (buf, offset) => {
            let org = offset.value;
            let typeValue = decodeUint(buf, offset);
            offset.value = org;
            let type = map[typeValue];
            return decodeArray(buf, offset, (buf, offset) => decodeObject(buf, offset, type));
        }
    });
}

/**
 * 数组的装饰器（对uint）
 * @param target 原型
 * @param key 字段名称
 */
export const arrayUint = (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: arr => encodeArray(arr, encodeInt),
        reader: (buf, offset) => decodeArray(buf, offset, decodeUint)
    });
}

/**
 * 数组的装饰器（对sint）
 * @param target 原型
 * @param key 字段名称
 */
export const arraySint = (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: arr => encodeArray(arr, encodeInt),
        reader: (buf, offset) => decodeArray(buf, offset, decodeSint)
    });
}

/**
 * expr装饰器
 * @param type 数据类型
 */
export const expr = (type: Type) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: val => encodeExpr(type, val),
        reader: (buf, offset) => decodeExpr(buf, offset, type)
    });
}

/**
 * 对象的装饰器
 * @param type 对象的构造函数
 */
export const obj = (type: Function) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: val => encodeObject(val),
        reader: (buf, offset) => decodeObject(buf, offset, type)
    });
}

/**
 * 多态对象的装饰器
 * @param map 构造函数映射
 */
export const objMap = (map: Record<number | string, Function>) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: val => encodeObject(val),
        reader: (buf, offset) => {
            let org = offset.value;
            let typeValue = decodeUint(buf, offset);
            offset.value = org;
            let type = map[typeValue];
            return decodeObject(buf, offset, type);
        }
    });
}

/**
 * expr的装饰器
 * @param mapKey 指示类型的字段名称
 */
export const exprMap = (mapKey: string) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: (val, obj) => {
            let type: Type = obj[mapKey];
            return encodeExpr(type, val);
        },
        reader: (buf, offset, obj) => {
            let type: Type = obj[mapKey];
            return decodeExpr(buf, offset, type);
        }
    });
}

/**
 * size字段的装饰器
 * @param target 原型
 * @param key 字段名称
 */
export const size = (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: () => {
            // 这里只是个占位对象
            return new ArrayBuffer(0);
        },
        reader: decodeUint,
        isSize: true
    })
}

/**
 * 当前字段是否忽略的装饰器
 * @param flagKey 用于判断是否忽略的字段名称
 */
export const notIgnore = (flagKey: string) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: () => { throw new Error() },
        reader: () => { throw new Error() },
        ignore: (obj) => !obj[flagKey]
    })
}

/**
 * 计算编码数值的长度
 * @param num 编码数值
 */
function getBtyeLength(num: number): number {
    if (num < 0) {
        num = ~num + 1;
    }

    let byteLength = 1;
    while (true) {
        let isEnd = num >> (7 * byteLength) === 0;
        if (isEnd) {
            return byteLength;
        } else {
            byteLength++;
        }
    }
}

/**
 * 对数值进行leb128编码
 * @param num 编码数值
 */
export function encodeInt(num: number): ArrayBuffer {
    let byteLength = getBtyeLength(num);
    let res = new Uint8Array(byteLength);

    for (let i = 0; i < byteLength; i++) {
        let u8 = num >> (7 * i);
        u8 &= 0b0111_1111;
        u8 |= 0b1000_0000;

        let isEnd = i === byteLength - 1;
        if (isEnd) {
            u8 &= ~0b1000_0000;
        }
        res[i] = u8;
    }

    return res.buffer;
}

/**
 * 判断两个类型之间的关系
 * @param subClass 子类型
 * @param baseClass 父类型
 */
export function isExtends(subClass: Function, baseClass: Function) {
    let current = subClass;
    do {
        if (current === baseClass) return true;
    } while (current = current.prototype.__proto__?.constructor);
    return false;
}

/**
 * 组合多个缓存的方法
 * @param buffers 缓存
 */
export function combin(buffers: ArrayBuffer[]) {
    let total = buffers.reduce((res, it) => res + it.byteLength, 0);
    let res = new Uint8Array(total);
    let i = 0;
    for (let buf of buffers) {
        buf = ArrayBuffer.isView(buf) ? buf.buffer : buf;
        let b = new Uint8Array(buf);
        for (let val of b) {
            res[i++] = val;
        }
    }
    return res.buffer;
}

/**
 * f32的写入器
 * @param num 值
 */
export function encodeF32(num: number): ArrayBuffer {
    return new Float32Array([num]).buffer;
}

/**
 * f64的写入器
 * @param num 值
 */
export function encodeF64(num: number): ArrayBuffer {
    return new Float64Array([num]).buffer;
}

/**
 * 数组的写入器
 * @param arr 数组
 * @param writer 单个元素的写入器
 */
export function encodeArray<T>(arr: T[], writer: Writer<T>): ArrayBuffer {
    let size = encodeInt(arr.length);
    let buffers: ArrayBuffer[] = [size];
    for (let it of arr) {
        let buf = writer(it);
        buffers.push(buf);
    }
    return combin(buffers);
}