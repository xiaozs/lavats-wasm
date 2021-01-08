import { combin } from './encode';
import { F32, F64, I16, I32, I64, I8, isF32, isF64, isI16, isI32, isI64, isI8, isV128, V128 } from './Type';

let te = new TextEncoder();

/**
 * 数据类型
 */
export enum DataType {
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

/**
 * 数据对象
 */
export type DataItem =
    | {
        /**
         * 数据类型
         */
        type: DataType.I8,
        /**
         * 数据内容
         */
        val: I8[]
    }
    | { type: DataType.I16, val: I16[] }
    | { type: DataType.I32, val: I32[] }
    | { type: DataType.I64, val: I64[] }
    | { type: DataType.F32, val: F32[] }
    | { type: DataType.F64, val: F64[] }
    | { type: DataType.V128, val: V128[] }
    | { type: DataType.Buffer, val: ArrayBuffer }
    | { type: DataType.String, val: string }

/**
 * 用于处理i64位数的ArrayBuffer
 */
class Int64Array {
    constructor(vals: (number | bigint)[]) {
        vals = vals.map(it => BigInt(it));
        return new BigInt64Array(vals as bigint[]);
    }
}
interface Int64Array extends ArrayBuffer { }

/**
 * 用于处理V128位数的ArrayBuffer
 */
class V128Array {
    constructor(vals: V128[]) {
        let map = {
            "v8x16": Int8Array,
            "v16x8": Int16Array,
            "v32x4": Int32Array,
            "v64x2": Int64Array,
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

/**
 * 数据包装器
 */
class DataPacker {
    /**
     * @param datas 包裹的数据
     */
    constructor(private datas: DataItem[]) { }
    toBuffer() {
        let map = {
            [DataType.I8]: Int8Array,
            [DataType.I16]: Int16Array,
            [DataType.I32]: Int32Array,
            [DataType.I64]: Int64Array,
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

    /**
     * 增加一个缓存
     * @param val 缓存
     */
    buffer(val: ArrayBuffer) {
        this.datas.push({ type: DataType.Buffer, val });
        return this;
    }
    /**
     * 增加一个字符串
     * @param val 字符串
     */
    string(val: string) {
        this.datas.push({ type: DataType.String, val });
        return this;
    }
}

/**
 * 包裹数据的方法
 * @param datas 包裹的数据
 */
export function data(datas: DataItem[]) {
    return new DataPacker(datas)
}

export namespace data {
    /**
     * 增加一个缓存
     * @param val 缓存
     */
    export function buffer(val: ArrayBuffer) {
        return new DataPacker([{ type: DataType.Buffer, val }]);
    }
    /**
     * 增加一个字符串
     * @param val 字符串
     */
    export function string(val: string) {
        return new DataPacker([{ type: DataType.String, val }]);
    }
}

interface DataPacker {
    /**
     * 增加一组i8
     * @param val i8
     */
    i8(...val: I8[]): DataPacker;
    /**
     * 增加一组i16
     * @param val i16
     */
    i16(...val: I16[]): DataPacker;
    /**
     * 增加一组i32
     * @param val i32
     */
    i32(...val: I32[]): DataPacker;
    /**
     * 增加一组i64
     * @param val i64
     */
    i64(...val: I64[]): DataPacker;
    /**
     * 增加一组f32
     * @param val f32
     */
    f32(...val: F32[]): DataPacker;
    /**
     * 增加一组f64
     * @param val f64
     */
    f64(...val: F64[]): DataPacker;
    /**
     * 增加一组v128
     * @param val v128
     */
    v128(...val: V128[]): DataPacker;
}

export declare namespace data {
    /**
     * 增加一组i8
     * @param val i8
     */
    export function i8(...val: I8[]): DataPacker;
    /**
     * 增加一组i16
     * @param val i16
     */
    export function i16(...val: I16[]): DataPacker;
    /**
     * 增加一组i32
     * @param val i32
     */
    export function i32(...val: I32[]): DataPacker;
    /**
     * 增加一组i64
     * @param val i64
     */
    export function i64(...val: I64[]): DataPacker;
    /**
     * 增加一组f32
     * @param val f32
     */
    export function f32(...val: F32[]): DataPacker;
    /**
     * 增加一组f64
     * @param val f64
     */
    export function f64(...val: F64[]): DataPacker;
    /**
     * 增加一组v128
     * @param val v128
     */
    export function v128(...val: V128[]): DataPacker;
}

/**
 * 方法名称 -> [数据类型, 校验方法] 的映射
 */
const map: Record<string, [DataType, (val: any) => boolean]> = {
    "i8": [DataType.I8, isI8],
    "i16": [DataType.I16, isI16],
    "i32": [DataType.I32, isI32],
    "i64": [DataType.I64, isI64],
    "f32": [DataType.F32, isF32],
    "f64": [DataType.F64, isF64],
    "v128": [DataType.V128, isV128],
}

// 给DataPacker类添加方法
for (let key in map) {
    let [type, fn] = map[key];
    (DataPacker.prototype as any)[key] = function (...val: any[]) {
        for (let i = 0; i < val.length; i++) {
            let it = val[i];
            if (!fn(it)) throw new Error(`data ${i}: 不是${key}`);
        }
        this.datas.push({ type, val });
        return this;
    }
}

// 给data名称空间添加方法
for (let key in map) {
    let [type, fn] = map[key];
    (data as any)[key] = function (...val: any[]) {
        for (let i = 0; i < val.length; i++) {
            let it = val[i];
            if (!fn(it)) throw new Error(`data ${i}: 不是${key}`);
        }
        return new DataPacker([{ type, val }] as DataItem[]);
    }
}