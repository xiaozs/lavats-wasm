import { Block, IfBlock, Instruction, instructionSet, LoopBlock } from './Instruction';
import { F32, F64, I32, I64, Index, ImmediateType, isBlockType, isF32, isF64, isI32, isI64, isIndex, isIndexArray, isV128, U32, BlockOption, IfOption } from './Type';

export declare const unreachable: Instruction;
export declare const nop: Instruction;
export function block(blockOption: BlockOption): Instruction {
    return new Block(blockOption);
}
export function loop(blockOption: BlockOption): Instruction {
    return new LoopBlock(blockOption);
}
export function If(ifOption: IfOption): Instruction {
    return new IfBlock(ifOption);
}
export declare function br(labelIndex: Index): Instruction;
export declare function br_if(labelIndex: Index): Instruction;
export declare function br_table(labelIndexes: Index[], defaultlabelIndex: Index): Instruction;
export declare const Return: Instruction;
export declare function call(functionIndex: Index): Instruction;
export declare function call_indirect(typeIndex: Index, tableIndex: Index): Instruction;
export declare const drop: Instruction;
export declare const select: Instruction;
export declare namespace local {
    export function get(localIndex: Index): Instruction;
    export function set(localIndex: Index): Instruction;
    export function tee(localIndex: Index): Instruction;
}
export declare namespace global {
    export function get(globalIndex: Index): Instruction;
    export function set(globalIndex: Index): Instruction;
}
export declare namespace i32 {
    export function load(offset: U32, align: U32): Instruction;
}
export declare namespace i64 {
    export function load(offset: U32, align: U32): Instruction;
}
export declare namespace f32 {
    export function load(offset: U32, align: U32): Instruction;
}
export declare namespace f64 {
    export function load(offset: U32, align: U32): Instruction;
}
export declare namespace i32 {
    export function load8_s(offset: U32, align: U32): Instruction;
    export function load8_u(offset: U32, align: U32): Instruction;
    export function load16_s(offset: U32, align: U32): Instruction;
    export function load16_u(offset: U32, align: U32): Instruction;
}
export declare namespace i64 {
    export function load8_s(offset: U32, align: U32): Instruction;
    export function load8_u(offset: U32, align: U32): Instruction;
    export function load16_s(offset: U32, align: U32): Instruction;
    export function load16_u(offset: U32, align: U32): Instruction;
    export function load32_s(offset: U32, align: U32): Instruction;
    export function load32_u(offset: U32, align: U32): Instruction;
}
export declare namespace i32 {
    export function store(offset: U32, align: U32): Instruction;
}
export declare namespace i64 {
    export function store(offset: U32, align: U32): Instruction;
}
export declare namespace f32 {
    export function store(offset: U32, align: U32): Instruction;
}
export declare namespace f64 {
    export function store(offset: U32, align: U32): Instruction;
}
export declare namespace i32 {
    export function store8(offset: U32, align: U32): Instruction;
    export function store16(offset: U32, align: U32): Instruction;
}
export declare namespace i64 {
    export function store8(offset: U32, align: U32): Instruction;
    export function store16(offset: U32, align: U32): Instruction;
    export function store32(offset: U32, align: U32): Instruction;
}
export declare namespace memory {
    export function size(memoryIndex: Index): Instruction;
    export function grow(memoryIndex: Index): Instruction;
}
export declare namespace i32 {
    export function Const(value: I32): Instruction;
}
export declare namespace i64 {
    export function Const(value: I64): Instruction;
}
export declare namespace f32 {
    export function Const(value: F32): Instruction;
}
export declare namespace f64 {
    export function Const(value: F64): Instruction;
}
export declare namespace i32 {
    export const eqz: Instruction;
    export const eq: Instruction;
    export const ne: Instruction;
    export const lt_s: Instruction;
    export const lt_u: Instruction;
    export const gt_s: Instruction;
    export const gt_u: Instruction;
    export const le_s: Instruction;
    export const le_u: Instruction;
    export const ge_s: Instruction;
    export const ge_u: Instruction;
}
export declare namespace i64 {
    export const eqz: Instruction;
    export const eq: Instruction;
    export const ne: Instruction;
    export const lt_s: Instruction;
    export const lt_u: Instruction;
    export const gt_s: Instruction;
    export const gt_u: Instruction;
    export const le_s: Instruction;
    export const le_u: Instruction;
    export const ge_s: Instruction;
    export const ge_u: Instruction;
}
export declare namespace f32 {
    export const eq: Instruction;
    export const ne: Instruction;
    export const lt: Instruction;
    export const gt: Instruction;
    export const le: Instruction;
    export const ge: Instruction;
}
export declare namespace f64 {
    export const eq: Instruction;
    export const ne: Instruction;
    export const lt: Instruction;
    export const gt: Instruction;
    export const le: Instruction;
    export const ge: Instruction;
}
export declare namespace i32 {
    export const clz: Instruction;
    export const ctz: Instruction;
    export const popcnt: Instruction;
    export const add: Instruction;
    export const sub: Instruction;
    export const mul: Instruction;
    export const div_s: Instruction;
    export const div_u: Instruction;
    export const rem_s: Instruction;
    export const rem_u: Instruction;
    export const and: Instruction;
    export const or: Instruction;
    export const xor: Instruction;
    export const shl: Instruction;
    export const shr_s: Instruction;
    export const shr_u: Instruction;
    export const rotl: Instruction;
    export const rotr: Instruction;
}
export declare namespace i64 {
    export const clz: Instruction;
    export const ctz: Instruction;
    export const popcnt: Instruction;
    export const add: Instruction;
    export const sub: Instruction;
    export const mul: Instruction;
    export const div_s: Instruction;
    export const div_u: Instruction;
    export const rem_s: Instruction;
    export const rem_u: Instruction;
    export const and: Instruction;
    export const or: Instruction;
    export const xor: Instruction;
    export const shl: Instruction;
    export const shr_s: Instruction;
    export const shr_u: Instruction;
    export const rotl: Instruction;
    export const rotr: Instruction;
}
export declare namespace f32 {
    export const abs: Instruction;
    export const neg: Instruction;
    export const ceil: Instruction;
    export const floor: Instruction;
    export const trunc: Instruction;
    export const nearest: Instruction;
    export const sqrt: Instruction;
    export const add: Instruction;
    export const sub: Instruction;
    export const mul: Instruction;
    export const div: Instruction;
    export const min: Instruction;
    export const max: Instruction;
    export const copysign: Instruction;
}
export declare namespace f64 {
    export const abs: Instruction;
    export const neg: Instruction;
    export const ceil: Instruction;
    export const floor: Instruction;
    export const trunc: Instruction;
    export const nearest: Instruction;
    export const sqrt: Instruction;
    export const add: Instruction;
    export const sub: Instruction;
    export const mul: Instruction;
    export const div: Instruction;
    export const min: Instruction;
    export const max: Instruction;
    export const copysign: Instruction;
}
export declare namespace i32 {
    export const wrap_i64: Instruction;
    export const trunc_f32_s: Instruction;
    export const trunc_f32_u: Instruction;
    export const trunc_f64_s: Instruction;
    export const trunc_f64_u: Instruction;
}
export declare namespace i64 {
    export const extend_i32_s: Instruction;
    export const extend_i32_u: Instruction;
    export const trunc_f32_s: Instruction;
    export const trunc_f32_u: Instruction;
    export const trunc_f64_s: Instruction;
    export const trunc_f64_u: Instruction;
}
export declare namespace f32 {
    export const convert_i32_s: Instruction;
    export const convert_i32_u: Instruction;
    export const convert_i64_s: Instruction;
    export const convert_i64_u: Instruction;
    export const demote_f64: Instruction;
}
export declare namespace f64 {
    export const convert_i32_s: Instruction;
    export const convert_i32_u: Instruction;
    export const convert_i64_s: Instruction;
    export const convert_i64_u: Instruction;
    export const promote_f32: Instruction;
}
export declare namespace i32 {
    export const reinterpret_f32: Instruction;
}
export declare namespace i64 {
    export const reinterpret_f64: Instruction;
}
export declare namespace f32 {
    export const reinterpret_i32: Instruction;
}
export declare namespace f64 {
    export const reinterpret_i64: Instruction;
}
export declare namespace i32 {
    export const extend8_s: Instruction;
    export const extend16_s: Instruction;
}
export declare namespace i64 {
    export const extend8_s: Instruction;
    export const extend16_s: Instruction;
    export const extend32_s: Instruction;
}
export declare namespace i32 {
    export const trunc_sat_f32_s: Instruction;
    export const trunc_sat_f32_u: Instruction;
    export const trunc_sat_f64_s: Instruction;
    export const trunc_sat_f64_u: Instruction;
}
export declare namespace i64 {
    export const trunc_sat_f32_s: Instruction;
    export const trunc_sat_f32_u: Instruction;
    export const trunc_sat_f64_s: Instruction;
    export const trunc_sat_f64_u: Instruction;
}



function getName(name: string): string {
    let keywords = ["try", "catch", "if", "else", "return", "throw", "null", "const"];
    let isKeyWords = keywords.includes(name);
    return isKeyWords ? name.replace(/^\w/, $$ => $$.toUpperCase()) : name;
}

const exportObj: any = {};
function getNamespace(names: string[]): any {
    let res = exportObj;
    for (let name of names) {
        res = res[name] = res[name] || {};
    }
    return res;
}

function checkArgs(args: any[], immediates: readonly any[]) {
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
        let type = immediates[i];
        let fn = fnMap[type];
        let isValidate = fn(arg);
        if (!isValidate) throw new Error("输入有误");
    }
}

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

module.exports = { ...exportObj, ...exports };