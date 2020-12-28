import type { BlockProxy, Instruction } from "./Instruction";
import type { Func } from "./Func";
import type { Env } from './Env';
import type { Stack } from './Stack';

export type I8 = number;
export type I16 = number;
export type U32 = number;
export type I32 = number;
export type I64 = number;
export type F32 = number;
export type F64 = number;
export type V128 =
    | { type: "v8x16", value: [I8, I8, I8, I8, I8, I8, I8, I8, I8, I8, I8, I8, I8, I8, I8, I8] }
    | { type: "v16x8", value: [I16, I16, I16, I16, I16, I16, I16, I16] }
    | { type: "v32x4", value: [I32, I32, I32, I32] }
    | { type: "v64x2", value: [I64, I64] }

/**
 * 索引，可为U32，或字符串
 */
export type Index = U32 | string;

/**
 * 判断值是否为整数
 * @param val 值
 */
function isInt(val: number) {
    return ~~val === val;
}

/**
 * 判断值是否为I8
 * @param val 值
 */
export function isI8(val: number) {
    return isInt(val) && (-(2 ** 7) <= val && val <= 2 ** 7 - 1);
}

/**
 * 判断值是否为I16
 * @param val 值
 */
export function isI16(val: number) {
    return isInt(val) && (-(2 ** 15) <= val && val <= 2 ** 15 - 1);
}

/**
 * 判断值是否为U32
 * @param val 值
 */
export function isU32(val: number) {
    return isInt(val) && (0 <= val && val <= 2 ** 32);
}

/**
 * 判断值是否为I32
 * @param val 值
 */
export function isI32(val: number) {
    return isInt(val) && (-(2 ** 31) <= val && val <= 2 ** 31 - 1);
}

/**
 * 判断值是否为I64
 * @param val 值
 */
export function isI64(val: number) {
    return isInt(val);
}

/**
 * 判断值是否为F32
 * @param val 值
 */
export function isF32(val: number) {
    return true;
}

/**
 * 判断值是否为F64
 * @param val 值
 */
export function isF64(val: number) {
    return true;
}

/**
 * 判断值是否为V128
 * @param val 值
 */
export function isV128(val: V128) {
    switch (val.type) {
        case "v8x16": return val.value.length === 16 && val.value.every(it => isI8(it));
        case "v16x8": return val.value.length === 8 && val.value.every(it => isI16(it));
        case "v32x4": return val.value.length === 4 && val.value.every(it => isI32(it));
        case "v64x2": return val.value.length === 2 && val.value.every(it => isI64(it));
        default: return false;
    }
}

/**
 * 判断值是否为块指令的签名类型
 * @param val 值    
 */
export function isBlockType(val: any) {
    return BlockType[val] !== undefined || isIndex(val);
}

/**
 * 判断数组中的每个值是否都是索引或相应名称
 * @param val 值的数组
 */
export function isIndexArray(val: number[]) {
    return val.every(it => isIndex(it));
}

/**
 * 判断值是否为索引或相应名称
 * @param val 值
 */
export function isIndex(val: number) {
    return isU32(val) || typeof val === "string";
}

/**
 * 指令的参数类型
 */
export enum Type {
    I32 = -0x01,
    I64 = -0x02,
    F32 = -0x03,
    F64 = -0x04,
    V128 = -0x05,
}

/**
 * 指令立即数的类型
 */
export enum ImmediateType {
    I32 = -0x01,
    I64 = -0x02,
    F32 = -0x03,
    F64 = -0x04,
    V128 = -0x05,
    BlockType,
    IndexArray,
    Index
}

/**
 * 块指令的签名类型
 */
export enum BlockType {
    I32 = -0x01,
    I64 = -0x02,
    F32 = -0x03,
    F64 = -0x04,
    V128 = -0x05,
    Empty = -0x40,
}

/**
 * 导入、导出项的类型
 */
export enum ImportExportType {
    Function = 0x00,
    Table = 0x01,
    Memory = 0x02,
    Global = 0x03,
}

/**
 * 表格中的元素类型
 */
export enum ElementType {
    funcref = -0x10,
}

/**
 * Name段中的名称类型
 */
export enum NameType {
    Module = 0x00,
    Function = 0x01,
    Local = 0x02,
    Label = 0x03,
    Type = 0x04,
    Table = 0x05,
    Memory = 0x06,
    Global = 0x07,
    Element = 0x08,
    Data = 0x09,
}

/**
 * 函数项
 */
export interface FunctionOption {
    /**
     * 函数的名称
     */
    name?: string;
    /**
     * 函数的入参类型
     */
    params?: ({ name: string, type: Type } | Type)[];
    /**
     * 函数的结果类型
     */
    results?: Type[];
    /**
     * 局部变量的类型
     */
    locals?: ({ name: string, type: Type } | Type)[];
    /**
     * 函数的代码指令
     */
    codes?: Instruction[];
}

/**
 * 内存项
 */
export interface MemoryOption {
    /**
     * 内存项的名称
     */
    name?: string;
    /**
     * 内存的最小大小（页）
     */
    min: U32;
    /**
     * 内存的最大大小（页）
     */
    max?: U32;
}

/**
 * 数据项
 */
export interface DataOption {
    /**
     * 数据项的名称
     */
    name?: string;
    /**
     * 对应的内存的索引，或者是名称
     */
    memoryIndex: Index;
    /**
     * 数据项填入的offset
     */
    offset: U32;
    /**
     * 初始化值
     */
    init: ArrayBuffer;
}

/**
 * 表格项
 */
export interface TableOption {
    /**
     * 表格项的名称
     */
    name?: string;
    /**
     * 表格的元素类型
     */
    elementType: ElementType;
    /**
     * 表格的最小值
     */
    min: U32;
    /**
     * 表格的最大值
     */
    max?: U32;
}

/**
 * 元素项
 */
export interface ElementOption {
    /**
     * 元素项的名称
     */
    name?: string;
    /**
     * 对应的表格的索引，或者是名称
     */
    tableIndex: Index;
    /**
     * 元素项填入的offset
     */
    offset: U32;
    /**
     * 元素项所代表的函数索引，或者是名称
     */
    functionIndexes: Index[];
}

/**
 * Limit的配置项
 */
export interface LimitOption {
    /**
     * 最小值
     */
    min: U32;
    /**
     * 最大值
     */
    max?: U32;
}

/**
 * 导入项
 */
export type ImportOption =
    {
        /**
         * 给导入项命名的名称
         */
        name?: string,
        /**
         * 导入的模块
         */
        module: string,
        /**
         * 模块中的名字
         */
        importName: string
    } &
    (
        | {
            /**
             * 导入项的类型
             */
            type: ImportExportType.Function,
            /**
             * 导入的函数的入参类型
             */
            params?: Type[],
            /**
             * 导入的函数的结果类型
             */
            results?: Type[]
        }
        | {
            type: ImportExportType.Table,
            /**
             * 导入的表格的类型
             */
            elementType: ElementType,
            /**
             * 表格的最小大小
             */
            min: U32,
            /**
             * 表格的最大大小
             */
            max?: U32
        }
        | {
            type: ImportExportType.Memory,
            /**
             * 内存的最小大小（页）
             */
            min: U32,
            /**
             * 内存的最大大小（页）
             */
            max?: U32
        }
        | {
            type: ImportExportType.Global,
            globalType: Type,
            mutable?: boolean
        }
    );

/**
 * 导出项
 */
export interface ExportOption {
    /**
     * 导出项的名称
     */
    exportName: string;
    /**
     * 导出项的类型
     */
    type: ImportExportType;
    /**
     * 导出项的对应类型的索引，
     * 也可以是由字符串指定的对应类型的项目
     */
    index: Index;
}

/**
 * 签名类型
 */
export interface TypeOption {
    /**
     * 类型的名称
     */
    name?: string;
    /**
     * 签名的入参类型
     */
    params: Type[];
    /**
     * 签名的结果类型
     */
    results: Type[];
}

/**
 * 全局变量
 */
export type GlobalOption =
    | {
        /**
         * 全局变量的名称
         */
        name?: string,
        /**
         * 全局变量的类型
         */
        globalType: Type.I32,
        /**
         * 全局变量是否可变
         */
        mutable?: boolean,
        /**
         * 全局变量的初始值
         */
        init: I32
    }
    | { name?: string, globalType: Type.I64, mutable?: boolean, init: I64 }
    | { name?: string, globalType: Type.F32, mutable?: boolean, init: F32 }
    | { name?: string, globalType: Type.F64, mutable?: boolean, init: F64 }


/**
 * Module的配置
 */
export interface ModuleOption {
    /**
     * 模块名称
     */
    name?: string;
    /**
     * 内存项
     */
    memory: MemoryOption[];
    /**
     * 数据项
     */
    data: DataOption[];
    /**
     * 表格项
     */
    table: TableOption[];
    /**
     * 元素项
     */
    element: ElementOption[];
    /**
     * 导入项
     */
    import: ImportOption[];
    /**
     * 导出项
     */
    export: ExportOption[];
    /**
     * 类型项
     */
    type: TypeOption[];
    /**
     * 全局变量项
     */
    global: GlobalOption[];
    /**
     * 函数项
     */
    function: Func[];
    /**
     * 开始函数
     */
    start?: Index;
}

/**
 * 检查配置项
 */
export interface CheckOption {
    /**
     * 环境上下文对象
     */
    env: Env;
    /**
     * 栈
     */
    stack: Stack;
    /**
     * 立即数
     */
    immediates: readonly any[];
    /**
     * 当前指令对应函数
     */
    func: Func;
    /**
     * 块的代理
     */
    block: BlockProxy;
}

/**
 * 一般指令
 */
export interface NormalInstructionOption {
    /**
     * 指令名称
     */
    readonly name: string;
    /**
     * 指令代码
     */
    readonly code: readonly number[];
    /**
     * 指令的立即数类型
     */
    readonly immediates: readonly ImmediateType[];
    /**
     * 指令的参数类型
     */
    readonly params: readonly Type[];
    /**
     * 指令的结果类型
     */
    readonly results: readonly Type[];
}

/**
 * 特殊指令
 */
export interface SpecialInstructionOption {
    /**
     * 指令名称
     */
    readonly name: string;
    /**
     * 指令代码
     */
    readonly code: readonly number[];
    /**
     * 指令的立即数类型
     */
    readonly immediates: readonly ImmediateType[];
    /**
     * 指令的检查函数
     * @param option 检查配置项
     */
    check(option: CheckOption): void;
}

/**
 * 指令配置项
 */
export type InstructionOption = NormalInstructionOption | SpecialInstructionOption;

/**
 * 块类型指令配置项
 */
export interface BlockOption {
    /**
     * 块的标签名称
     */
    label?: string;
    /**
     * 块的签名类型
     */
    type: BlockType | Index;
    /**
     * 块的代码
     */
    codes?: Instruction[]
}

/**
 * If指令配置
 */
export interface IfOption {
    /**
     * 块的标签名称
     */
    label?: string;
    /**
     * 块的签名类型
     */
    type: BlockType | Index;
    /**
     * true分支代码
     */
    then?: Instruction[];
    /**
     * false分支代码
     */
    else?: Instruction[];
}