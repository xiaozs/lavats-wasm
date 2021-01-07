import { Block, IfBlock, Instruction, instructionSet, LoopBlock } from './Instruction';
import { F32, F64, I32, I64, Index, ImmediateType, isBlockType, isF32, isF64, isI32, isI64, isIndex, isIndexArray, isV128, U32, BlockOption, IfOption } from './Type';

/**
 * 不可到达指令
 * ```
 * 功能: 执行到时会触发陷入
 * params: []
 * results: []
 * ```
 */
export declare const unreachable: Instruction;
/**
 * 不做操作指令
 * ```
 * 功能: 不做操作
 * params: []
 * results: []
 * ```
 */
export declare const nop: Instruction;
/**
 * 块指令
 * ```
 * 功能: 生成代码块，br指令会跳转到end之后
 * params: blockOption.type.params
 * results: blockOption.type.results
 * ```
 * @param blockOption 块指令配置
 */
export function block(blockOption: BlockOption): Instruction {
    return new Block(blockOption);
}
/**
 * 循环块指令
 * ```
 * 功能: 生成代码块，br指令会跳转到loop之后，类型于continue
 * params: blockOption.type.params
 * results: blockOption.type.results
 * ```
 * @param blockOption 块指令配置
 */
export function loop(blockOption: BlockOption): Instruction {
    return new LoopBlock(blockOption);
}
/**
 * 分支块指令
 * ```
 * 功能: 生成代码块，br指令会跳转到end之后
 * params: ifOption.type.params
 * results: ifOption.type.results
 * ```
 * @param ifOption 块指令配置
 */
export function If(ifOption: IfOption): Instruction {
    return new IfBlock(ifOption);
}
/**
 * 跳转指令
 * ```
 * 功能: 用于跳出块级指令
 * params: []
 * results: []
 * ```
 * @param labelIndex 块标签的索引
 */
export declare function br(labelIndex: Index): Instruction;
/**
 * 条件跳转指令
 * ```
 * 功能: 用于跳出块级指令
 * params: [i32]
 * results: []
 * ```
 * @param labelIndex 块标签的索引
 */
export declare function br_if(labelIndex: Index): Instruction;
/**
 * 表格跳转指令
 * ```
 * 功能: 用于跳出块级指令，取栈顶数 i，
 *      如果 i < labelIndexes.length
 *      则跳转到 labelIndexes[i]
 *      否则跳转到 defaultlabelIndex
 * params: [i32]
 * results: []
 * ```
 * @param labelIndexes 块标签的索引的数组
 * @param defaultlabelIndex 默认索引
 */
export declare function br_table(labelIndexes: Index[], defaultlabelIndex: Index): Instruction;
/**
 * 返回指令
 * ```
 * 功能: 用于跳出函数
 * params: []
 * results: []
 * ```
 */
export declare const Return: Instruction;
/**
 * 直接调用指令
 * ```
 * 功能: 用于调用函数func
 * params: func.params
 * results: func.results
 * ```
 * @param functionIndex 函数的索引
 */
export declare function call(functionIndex: Index): Instruction;
/**
 * 间接调用指令
 * ```
 * 功能: 用于调用tables[tableIndex][top0]指定的函数func，
 *      func的类型应该和types[typeIndex]相同
 * params: [...func.params, top0: i32]
 * results: func.results
 * ```
 * @param typeIndex 类型索引
 * @param tableIndex 表格索引
 */
export declare function call_indirect(typeIndex: Index, tableIndex: Index): Instruction;
/**
 * 退栈指令
 * ```
 * 功能: 删除栈顶元素
 * params: [*]
 * results: []
 * ```
 */
export declare const drop: Instruction;
/**
 * 选择指令
 * ```
 * 功能: 如果top0为真，则返回a，否则返回b
 *      a、b类型相等
 * params: [a: *, b: *, top0: i32]
 * results: [*]
 * ```
 */
export declare const select: Instruction;
export declare namespace local {
    /**
     * 获取局部变量指令
     * ```
     * 功能: 获取局部变量
     * params: []
     * results: [*]
     * ```
     * @param localIndex 局部变量索引
     */
    export function get(localIndex: Index): Instruction;
    /**
     * 设置局部变量指令
     * ```
     * 功能: 设置局部变量
     * params: [*]
     * results: []
     * ```
     * @param localIndex 局部变量索引
     */
    export function set(localIndex: Index): Instruction;
    /**
     * 设置局部变量指令
     * ```
     * 功能: 设置局部变量，但不弹出top0
     * params: []
     * results: []
     * ```
     * @param localIndex 局部变量索引
     */
    export function tee(localIndex: Index): Instruction;
}
export declare namespace global {
    /**
     * 获取全局变量指令
     * ```
     * 功能: 获取全局变量
     * params: []
     * results: [*]
     * ```
     * @param localIndex 全局变量索引
     */
    export function get(globalIndex: Index): Instruction;
    /**
     * 设置全局变量指令
     * ```
     * 功能: 设置全局变量
     * params: [*]
     * results: []
     * ```
     * @param localIndex 全局变量索引
     */
    export function set(globalIndex: Index): Instruction;
}
export declare namespace i32 {
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，返回i32
     * params: [i32]
     * results: [i32]
     * ```
     */
    export function load(offset: U32, align: U32): Instruction;
}
export declare namespace i64 {
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，返回i64
     * params: [i32]
     * results: [i64]
     * ```
     */
    export function load(offset: U32, align: U32): Instruction;
}
export declare namespace f32 {
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，返回f32
     * params: [i32]
     * results: [f32]
     * ```
     */
    export function load(offset: U32, align: U32): Instruction;
}
export declare namespace f64 {
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，返回f64
     * params: [i32]
     * results: [f64]
     * ```
     */
    export function load(offset: U32, align: U32): Instruction;
}
export declare namespace i32 {
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，读取s8，返回i32
     * params: [i32]
     * results: [i32]
     * ```
     */
    export function load8_s(offset: U32, align: U32): Instruction;
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，读取u8，返回i32
     * params: [i32]
     * results: [i32]
     * ```
     */
    export function load8_u(offset: U32, align: U32): Instruction;
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，读取s16，返回i32
     * params: [i32]
     * results: [i32]
     * ```
     */
    export function load16_s(offset: U32, align: U32): Instruction;
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，读取u16，返回i32
     * params: [i32]
     * results: [i32]
     * ```
     */
    export function load16_u(offset: U32, align: U32): Instruction;
}
export declare namespace i64 {
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，读取s8，返回i64
     * params: [i32]
     * results: [i64]
     * ```
     */
    export function load8_s(offset: U32, align: U32): Instruction;
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，读取u8，返回i64
     * params: [i32]
     * results: [i64]
     * ```
     */
    export function load8_u(offset: U32, align: U32): Instruction;
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，读取s16，返回i64
     * params: [i32]
     * results: [i64]
     * ```
     */
    export function load16_s(offset: U32, align: U32): Instruction;
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，读取u16，返回i64
     * params: [i32]
     * results: [i64]
     * ```
     */
    export function load16_u(offset: U32, align: U32): Instruction;
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，读取s32，返回i64
     * params: [i32]
     * results: [i64]
     * ```
     */
    export function load32_s(offset: U32, align: U32): Instruction;
    /**
     * 读取内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 读取 top0 + offset 处内存，读取u32，返回i64
     * params: [i32]
     * results: [i64]
     * ```
     */
    export function load32_u(offset: U32, align: U32): Instruction;
}
export declare namespace i32 {
    /**
     * 写入内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 于内存 addr + offset 处内存，存入val
     * params: [addr: i32, val: i32]
     * results: []
     * ```
     */
    export function store(offset: U32, align: U32): Instruction;
}
export declare namespace i64 {
    /**
     * 写入内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 于内存 addr + offset 处内存，存入val
     * params: [addr: i32, val: i64]
     * results: []
     * ```
     */
    export function store(offset: U32, align: U32): Instruction;
}
export declare namespace f32 {
    /**
     * 写入内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 于内存 addr + offset 处内存，存入val
     * params: [addr: i32, val: f32]
     * results: []
     * ```
     */
    export function store(offset: U32, align: U32): Instruction;
}
export declare namespace f64 {
    /**
     * 写入内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 于内存 addr + offset 处内存，存入val
     * params: [addr: i32, val: f64]
     * results: []
     * ```
     */
    export function store(offset: U32, align: U32): Instruction;
}
export declare namespace i32 {
    /**
     * 写入内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 于内存 addr + offset 处内存，存入val的低8位
     * params: [addr: i32, val: i32]
     * results: []
     * ```
     */
    export function store8(offset: U32, align: U32): Instruction;
    /**
     * 写入内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 于内存 addr + offset 处内存，存入val的低16位
     * params: [addr: i32, val: i32]
     * results: []
     * ```
     */
    export function store16(offset: U32, align: U32): Instruction;
}
export declare namespace i64 {
    /**
     * 写入内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 于内存 addr + offset 处内存，存入val的低8位
     * params: [addr: i32, val: i64]
     * results: []
     * ```
     */
    export function store8(offset: U32, align: U32): Instruction;
    /**
     * 写入内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 于内存 addr + offset 处内存，存入val的低16位
     * params: [addr: i32, val: i64]
     * results: []
     * ```
     */
    export function store16(offset: U32, align: U32): Instruction;
    /**
     * 写入内存指令
     * @param offset 地址偏移
     * @param align 对齐，最好和数据长度相同
     * ```
     * 功能: 于内存 addr + offset 处内存，存入val的低32位
     * params: [addr: i32, val: i64]
     * results: []
     * ```
     */
    export function store32(offset: U32, align: U32): Instruction;
}
export declare namespace memory {
    /**
     * 内存大小指令
     * @param memoryIndex 内存索引
     * ```
     * 功能: 返回memories[memoryIndex]的大小，单位为页
     * params: []
     * results: [i32]
     * ```
     */
    export function size(memoryIndex: Index): Instruction;
    /**
     * 内存扩大指令
     * @param memoryIndex 内存索引
     * ```
     * 功能: memories[memoryIndex]的大小增大top0页
     * params: [i32]
     * results: [i32]
     * ```
     */
    export function grow(memoryIndex: Index): Instruction;
}
export declare namespace i32 {
    /**
     * 入栈指令
     * @param value 数值
     * ```
     * 功能: 往栈中推入一个i32
     * params: []
     * results: [i32]
     * ```
     */
    export function Const(value: I32): Instruction;
}
export declare namespace i64 {
    /**
     * 入栈指令
     * @param value 数值
     * ```
     * 功能: 往栈中推入一个i64
     * params: []
     * results: [i64]
     * ```
     */
    export function Const(value: I64): Instruction;
}
export declare namespace f32 {
    /**
     * 入栈指令
     * @param value 数值
     * ```
     * 功能: 往栈中推入一个f32
     * params: []
     * results: [f32]
     * ```
     */
    export function Const(value: F32): Instruction;
}
export declare namespace f64 {
    /**
     * 入栈指令
     * @param value 数值
     * ```
     * 功能: 往栈中推入一个f64
     * params: []
     * results: [f64]
     * ```
     */
    export function Const(value: F64): Instruction;
}
export declare namespace i32 {
    /**
     * 等于零指令
     * ```
     * 功能: 判断 top0 是否为 0，
     *      为真，入栈 1；
     *      为假，入栈 0；
     * params: [i32]
     * results: [i32]
     * ```
     */
    export const eqz: Instruction;
    /**
     * 相等指令
     * ```
     * 功能: 判断 top0 和 top1 是否相等，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [i32, i32]
     * results: [i32]
     * ```
     */
    export const eq: Instruction;
    /**
     * 不等指令
     * ```
     * 功能: 判断 top0 和 top1 是否不等，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [i32, i32]
     * results: [i32]
     * ```
     */
    export const ne: Instruction;
    /**
     * 小于指令（有符号）
     * ```
     * 功能: 将a、b看作s32 
     *      判断 a < b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const lt_s: Instruction;
    /**
     * 小于指令（无符号）
     * ```
     * 功能: 将a、b看作u32 
     *      判断 a < b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const lt_u: Instruction;
    /**
     * 大于指令（有符号）
     * ```
     * 功能: 将a、b看作s32 
     *      判断 a > b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const gt_s: Instruction;
    /**
     * 大于指令（无符号）
     * ```
     * 功能: 将a、b看作u32 
     *      判断 a > b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const gt_u: Instruction;
    /**
     * 小于等于指令（有符号）
     * ```
     * 功能: 将a、b看作s32 
     *      判断 a <= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const le_s: Instruction;
    /**
     * 小于等于指令（无符号）
     * ```
     * 功能: 将a、b看作u32 
     *      判断 a <= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const le_u: Instruction;
    /**
     * 大于等于指令（有符号）
     * ```
     * 功能: 将a、b看作s32 
     *      判断 a >= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const ge_s: Instruction;
    /**
     * 大于等于指令（无符号）
     * ```
     * 功能: 将a、b看作u32 
     *      判断 a >= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const ge_u: Instruction;
}
export declare namespace i64 {
    /**
     * 等于零指令
     * ```
     * 功能: 判断 top0 是否为 0，
     *      为真，入栈 1；
     *      为假，入栈 0；
     * params: [i64]
     * results: [i32]
     * ```
     */
    export const eqz: Instruction;
    /**
     * 相等指令
     * ```
     * 功能: 判断 top0 和 top1 是否相等，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [i64, i64]
     * results: [i32]
     * ```
     */
    export const eq: Instruction;
    /**
     * 不等指令
     * ```
     * 功能: 判断 top0 和 top1 是否不等，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [i64, i64]
     * results: [i32]
     * ```
     */
    export const ne: Instruction;
    /**
     * 小于指令（有符号）
     * ```
     * 功能: 将a、b看作s64
     *      判断 a < b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i64, b: i64]
     * results: [i32]
     * ```
     */
    export const lt_s: Instruction;
    /**
     * 小于指令（无符号）
     * ```
     * 功能: 将a、b看作u64
     *      判断 a < b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i64, b: i64]
     * results: [i32]
     * ```
     */
    export const lt_u: Instruction;
    /**
     * 大于指令（有符号）
     * ```
     * 功能: 将a、b看作s64
     *      判断 a > b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i64, b: i64]
     * results: [i32]
     * ```
     */
    export const gt_s: Instruction;
    /**
     * 大于指令（无符号）
     * ```
     * 功能: 将a、b看作u64
     *      判断 a > b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i64, b: i64]
     * results: [i32]
     * ```
     */
    export const gt_u: Instruction;
    /**
     * 小于等于指令（有符号）
     * ```
     * 功能: 将a、b看作s64 
     *      判断 a <= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i64, b: i64]
     * results: [i32]
     * ```
     */
    export const le_s: Instruction;
    /**
     * 小于等于指令（无符号）
     * ```
     * 功能: 将a、b看作u32 
     *      判断 a <= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i64, b: i64]
     * results: [i32]
     * ```
     */
    export const le_u: Instruction;
    /**
     * 大于等于指令（有符号）
     * ```
     * 功能: 将a、b看作u32 
     *      判断 a >= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i64, b: i64]
     * results: [i32]
     * ```
     */
    export const ge_s: Instruction;
    /**
     * 大于等于指令（无符号）
     * ```
     * 功能: 将a、b看作s32 
     *      判断 a >= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: i64, b: i64]
     * results: [i32]
     * ```
     */
    export const ge_u: Instruction;
}
export declare namespace f32 {
    /**
     * 相等指令
     * ```
     * 功能: 判断 top0 和 top1 是否相等，
     *      为真，入栈 1；
     *      为假，入栈 0；
     * params: [f32, f32]
     * results: [i32]
     * ```
     */
    export const eq: Instruction;
    /**
     * 不等指令
     * ```
     * 功能: 判断 top0 和 top1 是否相等，
     *      为真，入栈 1；
     *      为假，入栈 0；
     * params: [f32, f32]
     * results: [i32]
     * ```
     */
    export const ne: Instruction;
    /**
     * 小于指令
     * ```
     * 功能: 判断 a < b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: f32, b: f32]
     * results: [i32]
     * ```
     */
    export const lt: Instruction;
    /**
     * 大于指令
     * ```
     * 功能: 判断 a > b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: f32, b: f32]
     * results: [i32]
     * ```
     */
    export const gt: Instruction;
    /**
     * 小于等于指令
     * ```
     * 功能: 判断 a <= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: f32, b: f32]
     * results: [i32]
     * ```
     */
    export const le: Instruction;
    /**
     * 大于等于指令
     * ```
     * 功能: 判断 a >= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: f32, b: f32]
     * results: [i32]
     * ```
     */
    export const ge: Instruction;
}
export declare namespace f64 {
    /**
     * 相等指令
     * ```
     * 功能: 判断 top0 和 top1 是否相等，
     *      为真，入栈 1；
     *      为假，入栈 0；
     * params: [f64, f64]
     * results: [i32]
     * ```
     */
    export const eq: Instruction;
    /**
     * 不等指令
     * ```
     * 功能: 判断 top0 和 top1 是否相等，
     *      为真，入栈 1；
     *      为假，入栈 0；
     * params: [f64, f64]
     * results: [i32]
     * ```
     */
    export const ne: Instruction;
    /**
     * 小于指令
     * ```
     * 功能: 判断 a < b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: f64, b: f64]
     * results: [i32]
     * ```
     */
    export const lt: Instruction;
    /**
     * 大于指令
     * ```
     * 功能: 判断 a > b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: f64, b: f64]
     * results: [i32]
     * ```
     */
    export const gt: Instruction;
    /**
     * 小于等于指令
     * ```
     * 功能: 判断 a <= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: f64, b: f64]
     * results: [i32]
     * ```
     */
    export const le: Instruction;
    /**
     * 大于等于指令
     * ```
     * 功能: 判断 a >= b，
     *      为真，入栈1；
     *      为假，入栈0；
     * params: [a: f64, b: f64]
     * results: [i32]
     * ```
     */
    export const ge: Instruction;
}
export declare namespace i32 {
    /**
     * 高位为零位数指令
     * ```
     * 功能: 统计top0从最高位开始连续为零的位数
     * params: [i32]
     * results: [i32]
     * ```
     */
    export const clz: Instruction;
    /**
     * 低位为零位数指令
     * ```
     * 功能: 统计top0从最低位开始连续为零的位数
     * params: [i32]
     * results: [i32]
     * ```
     */
    export const ctz: Instruction;
    /**
     * 为零位数指令
     * ```
     * 功能: 统计top0为零的位数
     * params: [i32]
     * results: [i32]
     * ```
     */
    export const popcnt: Instruction;
    /**
     * 求和指令
     * ```
     * 功能: a + b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const add: Instruction;
    /**
     * 求差指令
     * ```
     * 功能: a - b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const sub: Instruction;
    /**
     * 求积指令
     * ```
     * 功能: a * b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const mul: Instruction;
    /**
     * 求商指令（有符号）
     * ```
     * 功能: 将a、b看作s32
     *      a / b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const div_s: Instruction;
    /**
     * 求商指令（无符号）
     * ```
     * 功能: 将a、b看作u32
     *      a / b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const div_u: Instruction;
    /**
     * 求余指令（有符号）
     * ```
     * 功能: 将a、b看作s32
     *      a % b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const rem_s: Instruction;
    /**
     * 求余指令（无符号）
     * ```
     * 功能: 将a、b看作u32
     *      a % b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const rem_u: Instruction;
    /**
     * 与指令
     * ```
     * 功能: a & b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const and: Instruction;
    /**
     * 或指令
     * ```
     * 功能: a | b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const or: Instruction;
    /**
     * 异或指令
     * ```
     * 功能: a ^ b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const xor: Instruction;
    /**
     * 左移指令
     * ```
     * 功能: a << b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const shl: Instruction;
    /**
     * 有符号右移指令
     * ```
     * 功能: a >> b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const shr_s: Instruction;
    /**
     * 无符号右移指令
     * ```
     * 功能: a >>> b
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const shr_u: Instruction;
    /**
     * 循环左移指令
     * ```
     * 功能: a 循环左移 b 位
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const rotl: Instruction;
    /**
     * 循环右移指令
     * ```
     * 功能: a 循环右移 b 位
     * params: [a: i32, b: i32]
     * results: [i32]
     * ```
     */
    export const rotr: Instruction;
}
export declare namespace i64 {
    /**
     * 高位为零位数指令
     * ```
     * 功能: 统计top0从最高位开始连续为零的位数
     * params: [i64]
     * results: [i64]
     * ```
     */
    export const clz: Instruction;
    /**
     * 低位为零位数指令
     * ```
     * 功能: 统计top0从最低位开始连续为零的位数
     * params: [i64]
     * results: [i64]
     * ```
     */
    export const ctz: Instruction;
    /**
     * 为零位数指令
     * ```
     * 功能: 统计top0为零的位数
     * params: [i64]
     * results: [i64]
     * ```
     */
    export const popcnt: Instruction;
    /**
     * 求和指令
     * ```
     * 功能: a + b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const add: Instruction;
    /**
     * 求差指令
     * ```
     * 功能: a - b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const sub: Instruction;
    /**
     * 求积指令
     * ```
     * 功能: a * b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const mul: Instruction;
    /**
     * 求商指令（有符号）
     * ```
     * 功能: 将a、b看作s64
     *      a / b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const div_s: Instruction;
    /**
     * 求商指令（无符号）
     * ```
     * 功能: 将a、b看作u64
     *      a / b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const div_u: Instruction;
    /**
     * 求余指令（有符号）
     * ```
     * 功能: 将a、b看作s64
     *      a % b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const rem_s: Instruction;
    /**
     * 求余指令（无符号）
     * ```
     * 功能: 将a、b看作u64
     *      a % b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const rem_u: Instruction;
    /**
     * 与指令
     * ```
     * 功能: a & b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const and: Instruction;
    /**
     * 或指令
     * ```
     * 功能: a | b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const or: Instruction;
    /**
     * 异或指令
     * ```
     * 功能: a ^ b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const xor: Instruction;
    /**
     * 左移指令
     * ```
     * 功能: a << b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const shl: Instruction;
    /**
     * 有符号右移指令
     * ```
     * 功能: a >> b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const shr_s: Instruction;
    /**
     * 无符号右移指令
     * ```
     * 功能: a >>> b
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const shr_u: Instruction;
    /**
     * 循环左移指令
     * ```
     * 功能: a 循环左移 b 位
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const rotl: Instruction;
    /**
     * 循环右移指令
     * ```
     * 功能: a 循环右移 b 位
     * params: [a: i64, b: i64]
     * results: [i64]
     * ```
     */
    export const rotr: Instruction;
}
export declare namespace f32 {
    /**
     * 求绝对值指令
     * ```
     * 功能: Math.abs(top0)
     * params: [f32]
     * results: [f32]
     * ```
     */
    export const abs: Instruction;
    /**
     * 求反指令
     * ```
     * 功能: -top0
     * params: [f32]
     * results: [f32]
     * ```
     */
    export const neg: Instruction;
    /**
     * 向上取整指令
     * ```
     * 功能: Math.ceil(top0)
     * params: [f32]
     * results: [f32]
     * ```
     */
    export const ceil: Instruction;
    /**
     * 向下取整指令
     * ```
     * 功能: Math.floor(top0)
     * params: [f32]
     * results: [f32]
     * ```
     */
    export const floor: Instruction;
    /**
     * 向0取整指令
     * ```
     * 功能: Math.trunc(top0)
     * params: [f32]
     * results: [f32]
     * ```
     */
    export const trunc: Instruction;
    /**
     * 最接近取整指令
     * ```
     * 功能: 对top0四舍五入
     * params: [f32]
     * results: [f32]
     * ```
     */
    export const nearest: Instruction;
    /**
     * 求平方根指令
     * ```
     * 功能: Math.sqrt(top0)
     * params: [f32]
     * results: [f32]
     * ```
     */
    export const sqrt: Instruction;
    /**
     * 求和指令
     * ```
     * 功能: a + b
     * params: [a: f32, b: f32]
     * results: [f32]
     * ```
     */
    export const add: Instruction;
    /**
     * 求差指令
     * ```
     * 功能: a - b
     * params: [a: f32, b: f32]
     * results: [f32]
     * ```
     */
    export const sub: Instruction;
    /**
     * 求积指令
     * ```
     * 功能: a * b
     * params: [a: f32, b: f32]
     * results: [f32]
     * ```
     */
    export const mul: Instruction;
    /**
     * 求商指令
     * ```
     * 功能: a / b
     * params: [a: f32, b: f32]
     * results: [f32]
     * ```
     */
    export const div: Instruction;
    /**
     * 最小值指令
     * ```
     * 功能: Math.min(a, b)
     * params: [a: f32, b: f32]
     * results: [f32]
     * ```
     */
    export const min: Instruction;
    /**
     * 最大值指令
     * ```
     * 功能: Math.max(a, b)
     * params: [a: f32, b: f32]
     * results: [f32]
     * ```
     */
    export const max: Instruction;
    /**
     * 复制符号位指令
     * ```
     * 功能: setSign(a, getSign(b))
     * params: [a: f32, b: f32]
     * results: [f32]
     * ```
     */
    export const copysign: Instruction;
}
export declare namespace f64 {
    /**
     * 求绝对值指令
     * ```
     * 功能: Math.abs(top0)
     * params: [f64]
     * results: [f64]
     * ```
     */
    export const abs: Instruction;
    /**
     * 求反指令
     * ```
     * 功能: -top0
     * params: [f64]
     * results: [f64]
     * ```
     */
    export const neg: Instruction;
    /**
     * 向上取整指令
     * ```
     * 功能: Math.ceil(top0)
     * params: [f64]
     * results: [f64]
     * ```
     */
    export const ceil: Instruction;
    /**
     * 向下取整指令
     * ```
     * 功能: Math.floor(top0)
     * params: [f64]
     * results: [f64]
     * ```
     */
    export const floor: Instruction;
    /**
     * 向0取整指令
     * ```
     * 功能: Math.trunc(top0)
     * params: [f64]
     * results: [f64]
     * ```
     */
    export const trunc: Instruction;
    /**
     * 最接近取整指令
     * ```
     * 功能: 对top0四舍五入
     * params: [f64]
     * results: [f64]
     * ```
     */
    export const nearest: Instruction;
    /**
     * 求平方根指令
     * ```
     * 功能: Math.sqrt(top0)
     * params: [f64]
     * results: [f64]
     * ```
     */
    export const sqrt: Instruction;
    /**
     * 求和指令
     * ```
     * 功能: a + b
     * params: [a: f64, b: f64]
     * results: [f64]
     * ```
     */
    export const add: Instruction;
    /**
     * 求差指令
     * ```
     * 功能: a - b
     * params: [a: f64, b: f64]
     * results: [f64]
     * ```
     */
    export const sub: Instruction;
    /**
     * 求积指令
     * ```
     * 功能: a * b
     * params: [a: f64, b: f64]
     * results: [f64]
     * ```
     */
    export const mul: Instruction;
    /**
     * 求商指令
     * ```
     * 功能: a / b
     * params: [a: f64, b: f64]
     * results: [f64]
     * ```
     */
    export const div: Instruction;
    /**
     * 最小值指令
     * ```
     * 功能: Math.min(a, b)
     * params: [a: f64, b: f64]
     * results: [f64]
     * ```
     */
    export const min: Instruction;
    /**
     * 最大值指令
     * ```
     * 功能: Math.max(a, b)
     * params: [a: f64, b: f64]
     * results: [f64]
     * ```
     */
    export const max: Instruction;
    /**
     * 复制符号位指令
     * ```
     * 功能: setSign(a, getSign(b))
     * params: [a: f64, b: f64]
     * results: [f64]
     * ```
     */
    export const copysign: Instruction;
}
export declare namespace i32 {
    /**
     * 转换指令
     * ```
     * 功能: i64 -> i32，取低32位
     * params: [i64]
     * results: [i32]
     * ```
     */
    export const wrap_i64: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f32 -> s32，
     *      取整数部分，
     *      溢出则抛出异常，
     *      NaN则抛出异常
     * params: [f32]
     * results: [i32]
     * ```
     */
    export const trunc_f32_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f32 -> u32，
     *      取整数部分，
     *      溢出则抛出异常，
     *      NaN则抛出异常
     * params: [f32]
     * results: [i32]
     * ```
     */
    export const trunc_f32_u: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f64 -> s32，
     *      取整数部分，
     *      溢出则抛出异常，
     *      NaN则抛出异常
     * params: [f64]
     * results: [i32]
     * ```
     */
    export const trunc_f64_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f64 -> u32，
     *      取整数部分，
     *      溢出则抛出异常，
     *      NaN则抛出异常
     * params: [f64]
     * results: [i32]
     * ```
     */
    export const trunc_f64_u: Instruction;
}
export declare namespace i64 {
    /**
     * 转换指令
     * ```
     * 功能: s32 -> s64
     * params: [i32]
     * results: [i64]
     * ```
     */
    export const extend_i32_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: u32 -> u64
     * params: [i32]
     * results: [i64]
     * ```
     */
    export const extend_i32_u: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f32 -> s64，
     *      取整数部分，
     *      溢出则抛出异常，
     *      NaN则抛出异常
     * params: [f32]
     * results: [i64]
     * ```
     */
    export const trunc_f32_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f32 -> u64，
     *      取整数部分，
     *      溢出则抛出异常，
     *      NaN则抛出异常
     * params: [f32]
     * results: [i64]
     * ```
     */
    export const trunc_f32_u: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f64 -> s64，
     *      取整数部分，
     *      溢出则抛出异常，
     *      NaN则抛出异常
     * params: [f64]
     * results: [i64]
     * ```
     */
    export const trunc_f64_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f64 -> u64，
     *      取整数部分，
     *      溢出则抛出异常，
     *      NaN则抛出异常
     * params: [f64]
     * results: [i64]
     * ```
     */
    export const trunc_f64_u: Instruction;
}
export declare namespace f32 {
    /**
     * 转换指令
     * ```
     * 功能: s32 -> f32
     * params: [i32]
     * results: [f32]
     * ```
     */
    export const convert_i32_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: u32 -> f32
     * params: [i32]
     * results: [f32]
     * ```
     */
    export const convert_i32_u: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: s32 -> f32
     * params: [i64]
     * results: [f32]
     * ```
     */
    export const convert_i64_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: u32 -> f32
     * params: [i64]
     * results: [f32]
     * ```
     */
    export const convert_i64_u: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f64 -> f32
     * params: [f64]
     * results: [f32]
     * ```
     */
    export const demote_f64: Instruction;
}
export declare namespace f64 {
    /**
     * 转换指令
     * ```
     * 功能: s32 -> f64
     * params: [i32]
     * results: [f64]
     * ```
     */
    export const convert_i32_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: u32 -> f64
     * params: [i32]
     * results: [f64]
     * ```
     */
    export const convert_i32_u: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: s64 -> f64
     * params: [i64]
     * results: [f64]
     * ```
     */
    export const convert_i64_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: u64 -> f64
     * params: [i64]
     * results: [f64]
     * ```
     */
    export const convert_i64_u: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f32 -> f64
     * params: [f32]
     * results: [f64]
     * ```
     */
    export const promote_f32: Instruction;
}
export declare namespace i32 {
    /**
     * 按位原样转换指令
     * ```
     * 功能: f32 -> i32
     * params: [f32]
     * results: [i32]
     * ```
     */
    export const reinterpret_f32: Instruction;
}
export declare namespace i64 {
    /**
     * 按位原样转换指令
     * ```
     * 功能: f64 -> i64
     * params: [f64]
     * results: [i64]
     * ```
     */
    export const reinterpret_f64: Instruction;
}
export declare namespace f32 {
    /**
     * 按位原样转换指令
     * ```
     * 功能: i32 -> f32
     * params: [i32]
     * results: [f32]
     * ```
     */
    export const reinterpret_i32: Instruction;
}
export declare namespace f64 {
    /**
     * 按位原样转换指令
     * ```
     * 功能: i64 -> f64
     * params: [i64]
     * results: [f64]
     * ```
     */
    export const reinterpret_i64: Instruction;
}
export declare namespace i32 {
    /**
     * 转换指令
     * ```
     * 功能: s8 -> s32
     * params: [i32]
     * results: [i32]
     * ```
     */
    export const extend8_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: s16 -> s32
     * params: [i32]
     * results: [i32]
     * ```
     */
    export const extend16_s: Instruction;
}
export declare namespace i64 {
    /**
     * 转换指令
     * ```
     * 功能: s8 -> s64
     * params: [i64]
     * results: [i64]
     * ```
     */
    export const extend8_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: s16 -> s64
     * params: [i64]
     * results: [i64]
     * ```
     */
    export const extend16_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: s32 -> s64
     * params: [i64]
     * results: [i64]
     * ```
     */
    export const extend32_s: Instruction;
}
export declare namespace i32 {
    /**
     * 转换指令
     * ```
     * 功能: f32 -> s32，
     *      取整数部分，
     *      溢出则返回最大或最小整数值，
     *      NaN返回0
     * params: [f32]
     * results: [i32]
     * ```
     */
    export const trunc_sat_f32_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f32 -> u32，
     *      取整数部分，
     *      溢出则返回最大或最小整数值，
     *      NaN返回0
     * params: [f32]
     * results: [i32]
     * ```
     */
    export const trunc_sat_f32_u: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f64 -> s32，
     *      取整数部分，
     *      溢出则返回最大或最小整数值，
     *      NaN返回0
     * params: [f64]
     * results: [i32]
     * ```
     */
    export const trunc_sat_f64_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f64 -> u32，
     *      取整数部分，
     *      溢出则返回最大或最小整数值，
     *      NaN返回0
     * params: [f64]
     * results: [i32]
     * ```
     */
    export const trunc_sat_f64_u: Instruction;
}
export declare namespace i64 {
    /**
     * 转换指令
     * ```
     * 功能: f32 -> s64，
     *      取整数部分，
     *      溢出则返回最大或最小整数值，
     *      NaN返回0
     * params: [f32]
     * results: [i64]
     * ```
     */
    export const trunc_sat_f32_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f32 -> u64，
     *      取整数部分，
     *      溢出则返回最大或最小整数值，
     *      NaN返回0
     * params: [f32]
     * results: [i64]
     * ```
     */
    export const trunc_sat_f32_u: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f64 -> s64，
     *      取整数部分，
     *      溢出则返回最大或最小整数值，
     *      NaN返回0
     * params: [f64]
     * results: [i64]
     * ```
     */
    export const trunc_sat_f64_s: Instruction;
    /**
     * 转换指令
     * ```
     * 功能: f64 -> u64，
     *      取整数部分，
     *      溢出则返回最大或最小整数值，
     *      NaN返回0
     * params: [f64]
     * results: [i64]
     * ```
     */
    export const trunc_sat_f64_u: Instruction;
}

/**
 * 转换指令的名称，以免和关键字冲突
 * @param name 指令名称
 */
function getName(name: string): string {
    let keywords = ["try", "catch", "if", "else", "return", "throw", "null", "const"];
    let isKeyWords = keywords.includes(name);
    return isKeyWords ? name.replace(/^\w/, $$ => $$.toUpperCase()) : name;
}

/**
 * 导出对象
 */
const exportObj: any = {};
/**
 * 获取指令名称对应的命名空间
 * @param names 指令名称
 */
function getNamespace(names: string[]): any {
    let res = exportObj;
    for (let name of names) {
        res = res[name] = res[name] || {};
    }
    return res;
}

/**
 * 检查指令的立即数
 * @param args 立即数数组
 * @param immediateTypes 立即数类型数组
 */
function checkArgs(args: any[], immediateTypes: readonly any[]) {
    let fnMap: { [type: number]: (arg: any) => boolean } = {
        [ImmediateType.I32]: isI32,
        [ImmediateType.I64]: isI64,
        [ImmediateType.F32]: isF32,
        [ImmediateType.F64]: isF64,
        [ImmediateType.V128]: isV128,
        [ImmediateType.BlockType]: isBlockType,
        [ImmediateType.IndexArray]: isIndexArray,
        [ImmediateType.Index]: isIndex,
    }

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        let type = immediateTypes[i];
        let fn = fnMap[type];
        let isValidate = fn(arg);
        if (!isValidate) throw new Error("输入有误");
    }
}

// 迭代指令集，通过指令名称生成对应的命名空间和指令函数、指令对象
for (let text in instructionSet) {
    let instr = instructionSet[text];
    let names = text.split(".");
    let name = getName(names.pop()!);
    let namespace = getNamespace(names);

    if (instr.immediateTypes.length) {
        namespace[name] = function (...args: any[]) {
            checkArgs(args, instr.immediateTypes);
            return new Instruction(instr, args);
        }
    } else {
        namespace[name] = new Instruction(instr, []);
    }
}

// 融合通过上面代码生成的，和export关键字导出的，再进行导出
module.exports = { ...exportObj, ...exports };