import type { Writer } from "./encode";

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