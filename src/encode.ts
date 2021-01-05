import { instructionSet } from './Instruction';
import { Type } from './Type';

export interface Offset {
    value: number;
}

let te = new TextEncoder();
let td = new TextDecoder();

export interface Reader<T> {
    (buffer: ArrayBuffer, offset: Offset): T;
}

export interface Writer<T> {
    (item: T): ArrayBuffer
}

export function encodeString(str: string): ArrayBuffer {
    let length = encodeInt(str.length);
    let content = te.encode(str);
    return combin([
        length,
        content
    ])
}

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

export function encodeExpr(type: Type, val: number): ArrayBuffer {
    let fn = encodeExprMap[type];
    return fn(val);
}

export function encodeBuffer(buffer: ArrayBuffer, isWriteSize = true) {
    let size = isWriteSize ? encodeInt(buffer.byteLength) : new ArrayBuffer(0);
    return combin([
        size,
        buffer
    ])
}

export function decodeString(buffer: ArrayBuffer, offset: Offset): string {
    let length = decodeUint(buffer, offset);
    let start = offset.value;
    let end = start + length;
    let buf = buffer.slice(start, end);
    let content = td.decode(buf);
    offset.value += length;
    return content;
}

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

export function decodeF32(buffer: ArrayBuffer, offset: Offset): number {
    let view = new DataView(buffer, offset.value, 4);
    offset.value += 4;
    return view.getFloat32(0);
}

export function decodeF64(buffer: ArrayBuffer, offset: Offset): number {
    let view = new DataView(buffer, offset.value, 8);
    offset.value += 8;
    return view.getFloat64(0);
}

export function decodeArray<T>(buffer: ArrayBuffer, offset: Offset, reader: Reader<T>): T[] {
    let count = decodeUint(buffer, offset);
    let res: T[] = [];
    for (let i = 0; i < count; i++) {
        let obj = reader(buffer, offset);
        res.push(obj);
    }
    return res;
}

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

export function decodeExpr(buffer: ArrayBuffer, offset: Offset, type: Type): number {
    let fn = decodeExprMap[type];
    return fn(buffer, offset);
}

export function decodeBuffer(buffer: ArrayBuffer, offset: Offset, size: number) {
    let start = offset.value;
    let end = start + size;
    offset.value += size;
    return buffer.slice(start, end);
}

interface Deco {
    target: Function,
    key: string;
    writer: (val: any, obj: any) => ArrayBuffer;
    reader: (buffer: ArrayBuffer, offset: Offset, obj: any, org?: number) => any;
    isSize?: true;
    ignore?: (obj: any) => boolean;
}

let decos: Deco[] = [];

function getSize(arr: ArrayBuffer[], sizeIndex: number): ArrayBuffer {
    let total = 0;
    for (let i = sizeIndex + 1; i < arr.length; i++) {
        let it = arr[i];
        total += it.byteLength;
    }
    return encodeInt(total);
}

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

export const uint = (target: any, key: string): void => {
    decos.push({ target: target.constructor, key, writer: encodeInt, reader: decodeUint });
}

export const sint = (target: any, key: string): void => {
    decos.push({ target: target.constructor, key, writer: encodeInt, reader: decodeSint });
}

export const str = (target: any, key: string): void => {
    decos.push({ target: target.constructor, key, writer: encodeString, reader: decodeString });
}

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

export const array = (type: Function) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: arr => encodeArray(arr, it => encodeObject(it)),
        reader: (buf, offset) => decodeArray(buf, offset, (buf, offset) => decodeObject(buf, offset, type))
    });
}

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

export const arrayInt = (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: arr => encodeArray(arr, encodeInt),
        reader: (buf, offset) => decodeArray(buf, offset, decodeUint)
    });
}

export const arraySint = (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: arr => encodeArray(arr, encodeInt),
        reader: (buf, offset) => decodeArray(buf, offset, decodeSint)
    });
}

export const expr = (type: Type) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: val => encodeExpr(type, val),
        reader: (buf, offset) => decodeExpr(buf, offset, type)
    });
}

export const obj = (type: Function) => (target: any, key: string): void => {
    decos.push({
        target: target.constructor,
        key,
        writer: val => encodeObject(val),
        reader: (buf, offset) => decodeObject(buf, offset, type)
    });
}

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

export function encodeF32(num: number): ArrayBuffer {
    return new Float32Array([num]).buffer;
}

export function encodeF64(num: number): ArrayBuffer {
    return new Float64Array([num]).buffer;
}

export function encodeArray<T>(arr: T[], writer: Writer<T>): ArrayBuffer {
    let size = encodeInt(arr.length);
    let buffers: ArrayBuffer[] = [size];
    for (let it of arr) {
        let buf = writer(it);
        buffers.push(buf);
    }
    return combin(buffers);
}