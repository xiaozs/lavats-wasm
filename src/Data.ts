import { combin } from './encode';
import { F32, F64, I16, I32, I64, I8, isF32, isF64, isI16, isI32, isI64, isI8, isV128, V128 } from './Type';

let te = new TextEncoder();

enum DataType {
    I8,
    I16,
    I32,
    I64,
    F32,
    F64,
    V128,
    Buffer,
    String,
}

type DataItem =
    | { type: DataType.I8, val: I8[] }
    | { type: DataType.I16, val: I16[] }
    | { type: DataType.I32, val: I32[] }
    | { type: DataType.I64, val: I64[] }
    | { type: DataType.F32, val: F32[] }
    | { type: DataType.F64, val: F64[] }
    | { type: DataType.V128, val: V128[] }
    | { type: DataType.Buffer, val: ArrayBuffer }
    | { type: DataType.String, val: string }

class MyBigInt64Array {
    constructor(vals: (number | bigint)[]) {
        vals = vals.map(it => BigInt(it));
        return new BigInt64Array(vals as bigint[]);
    }
}
interface MyBigInt64Array extends ArrayBuffer { }

class V128Array {
    constructor(vals: V128[]) {
        let map = {
            "v8x16": Int8Array,
            "v16x8": Int16Array,
            "v32x4": Int32Array,
            "v64x2": MyBigInt64Array,
        }

        let buffers: ArrayBuffer[] = [];
        for (let val of vals) {
            let fn = map[val.type];
            let buf = new fn(val.value);
            buffers.push(buf);
        }
        return combin(buffers);
    }
}
interface V128Array extends ArrayBuffer { }

class InitData {
    private datas: DataItem[] = [];
    constructor(data: DataItem) {
        this.datas.push(data);
    }
    toBuffer() {
        let map = {
            [DataType.I8]: Int8Array,
            [DataType.I16]: Int16Array,
            [DataType.I32]: Int32Array,
            [DataType.I64]: MyBigInt64Array,
            [DataType.F32]: Float32Array,
            [DataType.F64]: Float64Array,
            [DataType.V128]: V128Array,
        }
        let buffers: ArrayBuffer[] = [];
        for (let it of this.datas) {
            if (it.type === DataType.Buffer) {
                buffers.push(it.val);
            } else if (it.type === DataType.String) {
                let buf = te.encode(it.val);
                buffers.push(buf);
            } else {
                let fn = map[it.type] as (new (vals: any[]) => ArrayBuffer);
                let buf = new fn(it.val);
                buffers.push(buf);
            }
        }
        return combin(buffers);
    }
    buffer(val: ArrayBuffer) {
        this.datas.push({ type: DataType.Buffer, val });
        return this;
    }
    string(val: string) {
        this.datas.push({ type: DataType.String, val });
        return this;
    }
}

export namespace data {
    export function buffer(val: ArrayBuffer) {
        return new InitData({ type: DataType.Buffer, val });
    }
    export function string(val: string) {
        return new InitData({ type: DataType.String, val });
    }
}

interface InitData {
    i8(...val: I8[]): InitData;
    i16(...val: I16[]): InitData;
    i32(...val: I32[]): InitData;
    i64(...val: I64[]): InitData;
    f32(...val: F32[]): InitData;
    f64(...val: F64[]): InitData;
    v128(...val: V128[]): InitData;
}

export declare namespace data {
    export function i8(...val: I8[]): InitData;
    export function i16(...val: I16[]): InitData;
    export function i32(...val: I32[]): InitData;
    export function i64(...val: I64[]): InitData;
    export function f32(...val: F32[]): InitData;
    export function f64(...val: F64[]): InitData;
    export function v128(...val: V128[]): InitData;
}

const map: Record<string, [DataType, (val: any) => boolean]> = {
    "i8": [DataType.I8, isI8],
    "i16": [DataType.I16, isI16],
    "i32": [DataType.I32, isI32],
    "i64": [DataType.I64, isI64],
    "f32": [DataType.F32, isF32],
    "f64": [DataType.F64, isF64],
    "v128": [DataType.V128, isV128],
}

for (let key in map) {
    let [type, fn] = map[key];
    (InitData.prototype as any)[key] = function (...val: any[]) {
        for (let i = 0; i < val.length; i++) {
            let it = val[i];
            if (!fn(it)) throw new Error(`data ${i}: 不是${key}`);
        }
        this.datas.push({ type, val });
        return this;
    }
}

for (let key in map) {
    let [type, fn] = map[key];
    (data as any)[key] = function (...val: any[]) {
        for (let i = 0; i < val.length; i++) {
            let it = val[i];
            if (!fn(it)) throw new Error(`data ${i}: 不是${key}`);
        }
        return new InitData({ type, val } as DataItem);
    }
}