export enum Type {
    Any,
    I32,
    I64,
    F32,
    F64,
    V128,
}

export interface Test {
    text: string;
    params: Type[];
    result: Type | null;
    code: Uint8Array;
}

function c(...nums: number[]) {
    return new Uint8Array(nums);
}

export const unreachable: Test = {
    text: "unreachable",
    params: [],
    result: null,
    code: c(0x00)
}
export const nop: Test = {
    text: "nop",
    params: [],
    result: null,
    code: c(0x01)
}
export const block: Test = {
    text: "block",
    params: [],
    result: null,
    code: c(0x02)
}
export const loop: Test = {
    text: "loop",
    params: [],
    result: null,
    code: c(0x03)
}
export const If: Test = {
    text: "if",
    params: [],
    result: null,
    code: c(0x04)
}
export const Else: Test = {
    text: "else",
    params: [],
    result: null,
    code: c(0x05)
}
export const Try: Test = {
    text: "try",
    params: [],
    result: null,
    code: c(0x06)
}
export const Catch: Test = {
    text: "catch",
    params: [],
    result: null,
    code: c(0x07)
}
export const Throw: Test = {
    text: "throw",
    params: [],
    result: null,
    code: c(0x08)
}
export const rethrow: Test = {
    text: "rethrow",
    params: [],
    result: null,
    code: c(0x09)
}
export const br_on_exn: Test = {
    text: "br_on_exn",
    params: [],
    result: null,
    code: c(0x0a)
}
export const end: Test = {
    text: "end",
    params: [],
    result: null,
    code: c(0x0b)
}
export const br: Test = {
    text: "br",
    params: [],
    result: null,
    code: c(0x0c)
}
export const br_if: Test = {
    text: "br_if",
    params: [Type.I32],
    result: null,
    code: c(0x0d)
}
export const br_table: Test = {
    text: "br_table",
    params: [Type.I32],
    result: null,
    code: c(0x0e)
}
export const Return: Test = {
    text: "return",
    params: [],
    result: null,
    code: c(0x0f)
}
export const call: Test = {
    text: "call",
    params: [],
    result: null,
    code: c(0x10)
}
export const call_indirect: Test = {
    text: "call_indirect",
    params: [],
    result: null,
    code: c(0x11)
}
export const return_call: Test = {
    text: "return_call",
    params: [],
    result: null,
    code: c(0x12)
}
export const return_call_indirect: Test = {
    text: "return_call_indirect",
    params: [],
    result: null,
    code: c(0x13)
}
export const drop: Test = {
    text: "drop",
    params: [],
    result: null,
    code: c(0x1a)
}
export const select: Test = {
    text: "select",
    params: [Type.I32],
    result: null,
    code: c(0x1b)
}
export const selectT: Test = {
    text: "select",
    params: [Type.I32],
    result: null,
    code: c(0x1c)
}
export module local {
    export const get: Test = {
        text: "local.get",
        params: [],
        result: null,
        code: c(0x20)
    }
    export const set: Test = {
        text: "local.set",
        params: [],
        result: null,
        code: c(0x21)
    }
    export const tee: Test = {
        text: "local.tee",
        params: [],
        result: null,
        code: c(0x22)
    }
}
export module global {
    export const get: Test = {
        text: "global.get",
        params: [],
        result: null,
        code: c(0x23)
    }
    export const set: Test = {
        text: "global.set",
        params: [],
        result: null,
        code: c(0x24)
    }
}
export module i32 {
    export const load: Test = {
        text: "i32.load",
        params: [Type.I32],
        result: Type.I32,
        code: c(0x28)
    }
}
export module i64 {
    export const load: Test = {
        text: "i64.load",
        params: [Type.I32],
        result: Type.I64,
        code: c(0x29)
    }
}
export module f32 {
    export const load: Test = {
        text: "f32.load",
        params: [Type.I32],
        result: Type.F32,
        code: c(0x2a)
    }
}
export module f64 {
    export const load: Test = {
        text: "f64.load",
        params: [Type.I32],
        result: Type.F64,
        code: c(0x2b)
    }
}
export module i32 {
    export const load8_s: Test = {
        text: "i32.load8_s",
        params: [Type.I32],
        result: Type.I32,
        code: c(0x2c)
    }
    export const load8_u: Test = {
        text: "i32.load8_u",
        params: [Type.I32],
        result: Type.I32,
        code: c(0x2d)
    }
    export const load16_s: Test = {
        text: "i32.load16_s",
        params: [Type.I32],
        result: Type.I32,
        code: c(0x2e)
    }
    export const load16_u: Test = {
        text: "i32.load16_u",
        params: [Type.I32],
        result: Type.I32,
        code: c(0x2f)
    }
}
export module i64 {
    export const load8_s: Test = {
        text: "i64.load8_s",
        params: [Type.I32],
        result: Type.I64,
        code: c(0x30)
    }
    export const load8_u: Test = {
        text: "i64.load8_u",
        params: [Type.I32],
        result: Type.I64,
        code: c(0x31)
    }
    export const load16_s: Test = {
        text: "i64.load16_s",
        params: [Type.I32],
        result: Type.I64,
        code: c(0x32)
    }
    export const load16_u: Test = {
        text: "i64.load16_u",
        params: [Type.I32],
        result: Type.I64,
        code: c(0x33)
    }
    export const load32_s: Test = {
        text: "i64.load32_s",
        params: [Type.I32],
        result: Type.I64,
        code: c(0x34)
    }
    export const load32_u: Test = {
        text: "i64.load32_u",
        params: [Type.I32],
        result: Type.I64,
        code: c(0x35)
    }
}
export module i32 {
    export const store: Test = {
        text: "i32.store",
        params: [Type.I32, Type.I32],
        result: null,
        code: c(0x36)
    }
}
export module i64 {
    export const store: Test = {
        text: "i64.store",
        params: [Type.I32, Type.I64],
        result: null,
        code: c(0x37)
    }
}
export module f32 {
    export const store: Test = {
        text: "f32.store",
        params: [Type.I32, Type.F32],
        result: null,
        code: c(0x38)
    }
}
export module f64 {
    export const store: Test = {
        text: "f64.store",
        params: [Type.I32, Type.F64],
        result: null,
        code: c(0x39)
    }
}
export module i32 {
    export const store8: Test = {
        text: "i32.store8",
        params: [Type.I32, Type.I32],
        result: null,
        code: c(0x3a)
    }
    export const store16: Test = {
        text: "i32.store16",
        params: [Type.I32, Type.I32],
        result: null,
        code: c(0x3b)
    }
}
export module i64 {
    export const store8: Test = {
        text: "i64.store8",
        params: [Type.I32, Type.I64],
        result: null,
        code: c(0x3c)
    }
    export const store16: Test = {
        text: "i64.store16",
        params: [Type.I32, Type.I64],
        result: null,
        code: c(0x3d)
    }
    export const store32: Test = {
        text: "i64.store32",
        params: [Type.I32, Type.I64],
        result: null,
        code: c(0x3e)
    }
}
export module memory {
    export const size: Test = {
        text: "memory.size",
        params: [],
        result: Type.I32,
        code: c(0x3f)
    }
    export const grow: Test = {
        text: "memory.grow",
        params: [Type.I32],
        result: Type.I32,
        code: c(0x40)
    }
}
export module i32 {
    export const Const: Test = {
        text: "i32.const",
        params: [],
        result: Type.I32,
        code: c(0x41)
    }
}
export module i64 {
    export const Const: Test = {
        text: "i64.const",
        params: [],
        result: Type.I64,
        code: c(0x42)
    }
}
export module f32 {
    export const Const: Test = {
        text: "f32.const",
        params: [],
        result: Type.F32,
        code: c(0x43)
    }
}
export module f64 {
    export const Const: Test = {
        text: "f64.const",
        params: [],
        result: Type.F64,
        code: c(0x44)
    }
}
export module i32 {
    export const eqz: Test = {
        text: "i32.eqz",
        params: [Type.I32],
        result: Type.I32,
        code: c(0x45)
    }
    export const eq: Test = {
        text: "i32.eq",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x46)
    }
    export const ne: Test = {
        text: "i32.ne",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x47)
    }
    export const lt_s: Test = {
        text: "i32.lt_s",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x48)
    }
    export const lt_u: Test = {
        text: "i32.lt_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x49)
    }
    export const gt_s: Test = {
        text: "i32.gt_s",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x4a)
    }
    export const gt_u: Test = {
        text: "i32.gt_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x4b)
    }
    export const le_s: Test = {
        text: "i32.le_s",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x4c)
    }
    export const le_u: Test = {
        text: "i32.le_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x4d)
    }
    export const ge_s: Test = {
        text: "i32.ge_s",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x4e)
    }
    export const ge_u: Test = {
        text: "i32.ge_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x4f)
    }
}
export module i64 {
    export const eqz: Test = {
        text: "i64.eqz",
        params: [Type.I64],
        result: Type.I32,
        code: c(0x50)
    }
    export const eq: Test = {
        text: "i64.eq",
        params: [Type.I64, Type.I64],
        result: Type.I32,
        code: c(0x51)
    }
    export const ne: Test = {
        text: "i64.ne",
        params: [Type.I64, Type.I64],
        result: Type.I32,
        code: c(0x52)
    }
    export const lt_s: Test = {
        text: "i64.lt_s",
        params: [Type.I64, Type.I64],
        result: Type.I32,
        code: c(0x53)
    }
    export const lt_u: Test = {
        text: "i64.lt_u",
        params: [Type.I64, Type.I64],
        result: Type.I32,
        code: c(0x54)
    }
    export const gt_s: Test = {
        text: "i64.gt_s",
        params: [Type.I64, Type.I64],
        result: Type.I32,
        code: c(0x55)
    }
    export const gt_u: Test = {
        text: "i64.gt_u",
        params: [Type.I64, Type.I64],
        result: Type.I32,
        code: c(0x56)
    }
    export const le_s: Test = {
        text: "i64.le_s",
        params: [Type.I64, Type.I64],
        result: Type.I32,
        code: c(0x57)
    }
    export const le_u: Test = {
        text: "i64.le_u",
        params: [Type.I64, Type.I64],
        result: Type.I32,
        code: c(0x58)
    }
    export const ge_s: Test = {
        text: "i64.ge_s",
        params: [Type.I64, Type.I64],
        result: Type.I32,
        code: c(0x59)
    }
    export const ge_u: Test = {
        text: "i64.ge_u",
        params: [Type.I64, Type.I64],
        result: Type.I32,
        code: c(0x5a)
    }
}
export module f32 {
    export const eq: Test = {
        text: "f32.eq",
        params: [Type.F32, Type.F32],
        result: Type.I32,
        code: c(0x5b)
    }
    export const ne: Test = {
        text: "f32.ne",
        params: [Type.F32, Type.F32],
        result: Type.I32,
        code: c(0x5c)
    }
    export const lt: Test = {
        text: "f32.lt",
        params: [Type.F32, Type.F32],
        result: Type.I32,
        code: c(0x5d)
    }
    export const gt: Test = {
        text: "f32.gt",
        params: [Type.F32, Type.F32],
        result: Type.I32,
        code: c(0x5e)
    }
    export const le: Test = {
        text: "f32.le",
        params: [Type.F32, Type.F32],
        result: Type.I32,
        code: c(0x5f)
    }
    export const ge: Test = {
        text: "f32.ge",
        params: [Type.F32, Type.F32],
        result: Type.I32,
        code: c(0x60)
    }
}
export module f64 {
    export const eq: Test = {
        text: "f64.eq",
        params: [Type.F64, Type.F64],
        result: Type.I32,
        code: c(0x61)
    }
    export const ne: Test = {
        text: "f64.ne",
        params: [Type.F64, Type.F64],
        result: Type.I32,
        code: c(0x62)
    }
    export const lt: Test = {
        text: "f64.lt",
        params: [Type.F64, Type.F64],
        result: Type.I32,
        code: c(0x63)
    }
    export const gt: Test = {
        text: "f64.gt",
        params: [Type.F64, Type.F64],
        result: Type.I32,
        code: c(0x64)
    }
    export const le: Test = {
        text: "f64.le",
        params: [Type.F64, Type.F64],
        result: Type.I32,
        code: c(0x65)
    }
    export const ge: Test = {
        text: "f64.ge",
        params: [Type.F64, Type.F64],
        result: Type.I32,
        code: c(0x66)
    }
}
export module i32 {
    export const clz: Test = {
        text: "i32.clz",
        params: [Type.I32],
        result: Type.I32,
        code: c(0x67)
    }
    export const ctz: Test = {
        text: "i32.ctz",
        params: [Type.I32],
        result: Type.I32,
        code: c(0x68)
    }
    export const popcnt: Test = {
        text: "i32.popcnt",
        params: [Type.I32],
        result: Type.I32,
        code: c(0x69)
    }
    export const add: Test = {
        text: "i32.add",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x6a)
    }
    export const sub: Test = {
        text: "i32.sub",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x6b)
    }
    export const mul: Test = {
        text: "i32.mul",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x6c)
    }
    export const div_s: Test = {
        text: "i32.div_s",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x6d)
    }
    export const div_u: Test = {
        text: "i32.div_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x6e)
    }
    export const rem_s: Test = {
        text: "i32.rem_s",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x6f)
    }
    export const rem_u: Test = {
        text: "i32.rem_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x70)
    }
    export const and: Test = {
        text: "i32.and",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x71)
    }
    export const or: Test = {
        text: "i32.or",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x72)
    }
    export const xor: Test = {
        text: "i32.xor",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x73)
    }
    export const shl: Test = {
        text: "i32.shl",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x74)
    }
    export const shr_s: Test = {
        text: "i32.shr_s",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x75)
    }
    export const shr_u: Test = {
        text: "i32.shr_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x76)
    }
    export const rotl: Test = {
        text: "i32.rotl",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x77)
    }
    export const rotr: Test = {
        text: "i32.rotr",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0x78)
    }
}
export module i64 {
    export const clz: Test = {
        text: "i64.clz",
        params: [Type.I64],
        result: Type.I64,
        code: c(0x79)
    }
    export const ctz: Test = {
        text: "i64.ctz",
        params: [Type.I64],
        result: Type.I64,
        code: c(0x7a)
    }
    export const popcnt: Test = {
        text: "i64.popcnt",
        params: [Type.I64],
        result: Type.I64,
        code: c(0x7b)
    }
    export const add: Test = {
        text: "i64.add",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x7c)
    }
    export const sub: Test = {
        text: "i64.sub",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x7d)
    }
    export const mul: Test = {
        text: "i64.mul",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x7e)
    }
    export const div_s: Test = {
        text: "i64.div_s",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x7f)
    }
    export const div_u: Test = {
        text: "i64.div_u",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x80)
    }
    export const rem_s: Test = {
        text: "i64.rem_s",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x81)
    }
    export const rem_u: Test = {
        text: "i64.rem_u",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x82)
    }
    export const and: Test = {
        text: "i64.and",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x83)
    }
    export const or: Test = {
        text: "i64.or",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x84)
    }
    export const xor: Test = {
        text: "i64.xor",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x85)
    }
    export const shl: Test = {
        text: "i64.shl",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x86)
    }
    export const shr_s: Test = {
        text: "i64.shr_s",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x87)
    }
    export const shr_u: Test = {
        text: "i64.shr_u",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x88)
    }
    export const rotl: Test = {
        text: "i64.rotl",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x89)
    }
    export const rotr: Test = {
        text: "i64.rotr",
        params: [Type.I64, Type.I64],
        result: Type.I64,
        code: c(0x8a)
    }
}
export module f32 {
    export const abs: Test = {
        text: "f32.abs",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x8b)
    }
    export const neg: Test = {
        text: "f32.neg",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x8c)
    }
    export const ceil: Test = {
        text: "f32.ceil",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x8d)
    }
    export const floor: Test = {
        text: "f32.floor",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x8e)
    }
    export const trunc: Test = {
        text: "f32.trunc",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x8f)
    }
    export const nearest: Test = {
        text: "f32.nearest",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x90)
    }
    export const sqrt: Test = {
        text: "f32.sqrt",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x91)
    }
    export const add: Test = {
        text: "f32.add",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x92)
    }
    export const sub: Test = {
        text: "f32.sub",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x93)
    }
    export const mul: Test = {
        text: "f32.mul",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x94)
    }
    export const div: Test = {
        text: "f32.div",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x95)
    }
    export const min: Test = {
        text: "f32.min",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x96)
    }
    export const max: Test = {
        text: "f32.max",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x97)
    }
    export const copysign: Test = {
        text: "f32.copysign",
        params: [Type.F32, Type.F32],
        result: Type.F32,
        code: c(0x98)
    }
}
export module f64 {
    export const abs: Test = {
        text: "f64.abs",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0x99)
    }
    export const neg: Test = {
        text: "f64.neg",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0x9a)
    }
    export const ceil: Test = {
        text: "f64.ceil",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0x9b)
    }
    export const floor: Test = {
        text: "f64.floor",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0x9c)
    }
    export const trunc: Test = {
        text: "f64.trunc",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0x9d)
    }
    export const nearest: Test = {
        text: "f64.nearest",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0x9e)
    }
    export const sqrt: Test = {
        text: "f64.sqrt",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0x9f)
    }
    export const add: Test = {
        text: "f64.add",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0xa0)
    }
    export const sub: Test = {
        text: "f64.sub",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0xa1)
    }
    export const mul: Test = {
        text: "f64.mul",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0xa2)
    }
    export const div: Test = {
        text: "f64.div",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0xa3)
    }
    export const min: Test = {
        text: "f64.min",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0xa4)
    }
    export const max: Test = {
        text: "f64.max",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0xa5)
    }
    export const copysign: Test = {
        text: "f64.copysign",
        params: [Type.F64, Type.F64],
        result: Type.F64,
        code: c(0xa6)
    }
}
export module i32 {
    export const wrap_i64: Test = {
        text: "i32.wrap_i64",
        params: [Type.I64],
        result: Type.I32,
        code: c(0xa7)
    }
    export const trunc_f32_s: Test = {
        text: "i32.trunc_f32_s",
        params: [Type.F32],
        result: Type.I32,
        code: c(0xa8)
    }
    export const trunc_f32_u: Test = {
        text: "i32.trunc_f32_u",
        params: [Type.F32],
        result: Type.I32,
        code: c(0xa9)
    }
    export const trunc_f64_s: Test = {
        text: "i32.trunc_f64_s",
        params: [Type.F64],
        result: Type.I32,
        code: c(0xaa)
    }
    export const trunc_f64_u: Test = {
        text: "i32.trunc_f64_u",
        params: [Type.F64],
        result: Type.I32,
        code: c(0xab)
    }
}
export module i64 {
    export const extend_i32_s: Test = {
        text: "i64.extend_i32_s",
        params: [Type.I32],
        result: Type.I64,
        code: c(0xac)
    }
    export const extend_i32_u: Test = {
        text: "i64.extend_i32_u",
        params: [Type.I32],
        result: Type.I64,
        code: c(0xad)
    }
    export const trunc_f32_s: Test = {
        text: "i64.trunc_f32_s",
        params: [Type.F32],
        result: Type.I64,
        code: c(0xae)
    }
    export const trunc_f32_u: Test = {
        text: "i64.trunc_f32_u",
        params: [Type.F32],
        result: Type.I64,
        code: c(0xaf)
    }
    export const trunc_f64_s: Test = {
        text: "i64.trunc_f64_s",
        params: [Type.F64],
        result: Type.I64,
        code: c(0xb0)
    }
    export const trunc_f64_u: Test = {
        text: "i64.trunc_f64_u",
        params: [Type.F64],
        result: Type.I64,
        code: c(0xb1)
    }
}
export module f32 {
    export const convert_i32_s: Test = {
        text: "f32.convert_i32_s",
        params: [Type.I32],
        result: Type.F32,
        code: c(0xb2)
    }
    export const convert_i32_u: Test = {
        text: "f32.convert_i32_u",
        params: [Type.I32],
        result: Type.F32,
        code: c(0xb3)
    }
    export const convert_i64_s: Test = {
        text: "f32.convert_i64_s",
        params: [Type.I64],
        result: Type.F32,
        code: c(0xb4)
    }
    export const convert_i64_u: Test = {
        text: "f32.convert_i64_u",
        params: [Type.I64],
        result: Type.F32,
        code: c(0xb5)
    }
    export const demote_f64: Test = {
        text: "f32.demote_f64",
        params: [Type.F64],
        result: Type.F32,
        code: c(0xb6)
    }
}
export module f64 {
    export const convert_i32_s: Test = {
        text: "f64.convert_i32_s",
        params: [Type.I32],
        result: Type.F64,
        code: c(0xb7)
    }
    export const convert_i32_u: Test = {
        text: "f64.convert_i32_u",
        params: [Type.I32],
        result: Type.F64,
        code: c(0xb8)
    }
    export const convert_i64_s: Test = {
        text: "f64.convert_i64_s",
        params: [Type.I64],
        result: Type.F64,
        code: c(0xb9)
    }
    export const convert_i64_u: Test = {
        text: "f64.convert_i64_u",
        params: [Type.I64],
        result: Type.F64,
        code: c(0xba)
    }
    export const promote_f32: Test = {
        text: "f64.promote_f32",
        params: [Type.F32],
        result: Type.F64,
        code: c(0xbb)
    }
}
export module i32 {
    export const reinterpret_f32: Test = {
        text: "i32.reinterpret_f32",
        params: [Type.F32],
        result: Type.I32,
        code: c(0xbc)
    }
}
export module i64 {
    export const reinterpret_f64: Test = {
        text: "i64.reinterpret_f64",
        params: [Type.F64],
        result: Type.I64,
        code: c(0xbd)
    }
}
export module f32 {
    export const reinterpret_i32: Test = {
        text: "f32.reinterpret_i32",
        params: [Type.I32],
        result: Type.F32,
        code: c(0xbe)
    }
}
export module f64 {
    export const reinterpret_i64: Test = {
        text: "f64.reinterpret_i64",
        params: [Type.I64],
        result: Type.F64,
        code: c(0xbf)
    }
}
export module i32 {
    export const extend8_s: Test = {
        text: "i32.extend8_s",
        params: [Type.I32],
        result: Type.I32,
        code: c(0xC0)
    }
    export const extend16_s: Test = {
        text: "i32.extend16_s",
        params: [Type.I32],
        result: Type.I32,
        code: c(0xC1)
    }
}
export module i64 {
    export const extend8_s: Test = {
        text: "i64.extend8_s",
        params: [Type.I64],
        result: Type.I64,
        code: c(0xC2)
    }
    export const extend16_s: Test = {
        text: "i64.extend16_s",
        params: [Type.I64],
        result: Type.I64,
        code: c(0xC3)
    }
    export const extend32_s: Test = {
        text: "i64.extend32_s",
        params: [Type.I64],
        result: Type.I64,
        code: c(0xC4)
    }
}
export module i32 {
    export const trunc_sat_f32_s: Test = {
        text: "i32.trunc_sat_f32_s",
        params: [Type.F32],
        result: Type.I32,
        code: c(0xfc, 0x00)
    }
    export const trunc_sat_f32_u: Test = {
        text: "i32.trunc_sat_f32_u",
        params: [Type.F32],
        result: Type.I32,
        code: c(0xfc, 0x01)
    }
    export const trunc_sat_f64_s: Test = {
        text: "i32.trunc_sat_f64_s",
        params: [Type.F64],
        result: Type.I32,
        code: c(0xfc, 0x02)
    }
    export const trunc_sat_f64_u: Test = {
        text: "i32.trunc_sat_f64_u",
        params: [Type.F64],
        result: Type.I32,
        code: c(0xfc, 0x03)
    }
}
export module i64 {
    export const trunc_sat_f32_s: Test = {
        text: "i64.trunc_sat_f32_s",
        params: [Type.F32],
        result: Type.I64,
        code: c(0xfc, 0x04)
    }
    export const trunc_sat_f32_u: Test = {
        text: "i64.trunc_sat_f32_u",
        params: [Type.F32],
        result: Type.I64,
        code: c(0xfc, 0x05)
    }
    export const trunc_sat_f64_s: Test = {
        text: "i64.trunc_sat_f64_s",
        params: [Type.F64],
        result: Type.I64,
        code: c(0xfc, 0x06)
    }
    export const trunc_sat_f64_u: Test = {
        text: "i64.trunc_sat_f64_u",
        params: [Type.F64],
        result: Type.I64,
        code: c(0xfc, 0x07)
    }
}
export module memory {
    export const init: Test = {
        text: "memory.init",
        params: [Type.I32, Type.I32, Type.I32],
        result: null,
        code: c(0xfc, 0x08)
    }
}
export module data {
    export const drop: Test = {
        text: "data.drop",
        params: [],
        result: null,
        code: c(0xfc, 0x09)
    }
}
export module memory {
    export const copy: Test = {
        text: "memory.copy",
        params: [Type.I32, Type.I32, Type.I32],
        result: null,
        code: c(0xfc, 0x0a)
    }
    export const fill: Test = {
        text: "memory.fill",
        params: [Type.I32, Type.I32, Type.I32],
        result: null,
        code: c(0xfc, 0x0b)
    }
}
export module table {
    export const init: Test = {
        text: "table.init",
        params: [Type.I32, Type.I32, Type.I32],
        result: null,
        code: c(0xfc, 0x0c)
    }
}
export module elem {
    export const drop: Test = {
        text: "elem.drop",
        params: [],
        result: null,
        code: c(0xfc, 0x0d)
    }
}
export module table {
    export const copy: Test = {
        text: "table.copy",
        params: [Type.I32, Type.I32, Type.I32],
        result: null,
        code: c(0xfc, 0x0e)
    }
    export const get: Test = {
        text: "table.get",
        params: [Type.I32],
        result: null,
        code: c(0x25)
    }
    export const set: Test = {
        text: "table.set",
        params: [Type.I32],
        result: null,
        code: c(0x26)
    }
    export const grow: Test = {
        text: "table.grow",
        params: [Type.I32],
        result: null,
        code: c(0xfc, 0x0f)
    }
    export const size: Test = {
        text: "table.size",
        params: [],
        result: null,
        code: c(0xfc, 0x10)
    }
    export const fill: Test = {
        text: "table.fill",
        params: [Type.I32, Type.I32],
        result: null,
        code: c(0xfc, 0x11)
    }
}
export module ref {
    export const Null: Test = {
        text: "ref.null",
        params: [],
        result: null,
        code: c(0xd0)
    }
    export const is_null: Test = {
        text: "ref.is_null",
        params: [],
        result: null,
        code: c(0xd1)
    }
    export const func: Test = {
        text: "ref.func",
        params: [],
        result: null,
        code: c(0xd2)
    }
}
export module v128 {
    export const load: Test = {
        text: "v128.load",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x00)
    }
}
export module i16x8 {
    export const load8x8_s: Test = {
        text: "i16x8.load8x8_s",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x01)
    }
    export const load8x8_u: Test = {
        text: "i16x8.load8x8_u",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x02)
    }
}
export module i32x4 {
    export const load16x4_s: Test = {
        text: "i32x4.load16x4_s",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x03)
    }
    export const load16x4_u: Test = {
        text: "i32x4.load16x4_u",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x04)
    }
}
export module i64x2 {
    export const load32x2_s: Test = {
        text: "i64x2.load32x2_s",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x05)
    }
    export const load32x2_u: Test = {
        text: "i64x2.load32x2_u",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x06)
    }
}
export module v8x16 {
    export const load_splat: Test = {
        text: "v8x16.load_splat",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x07)
    }
}
export module v16x8 {
    export const load_splat: Test = {
        text: "v16x8.load_splat",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x08)
    }
}
export module v32x4 {
    export const load_splat: Test = {
        text: "v32x4.load_splat",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x09)
    }
}
export module v64x2 {
    export const load_splat: Test = {
        text: "v64x2.load_splat",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x0a)
    }
}
export module v128 {
    export const store: Test = {
        text: "v128.store",
        params: [Type.I32, Type.V128],
        result: null,
        code: c(0xfd, 0x0b)
    }
    export const Const: Test = {
        text: "v128.const",
        params: [],
        result: Type.V128,
        code: c(0xfd, 0x0c)
    }
}
export module v8x16 {
    export const shuffle: Test = {
        text: "v8x16.shuffle",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x0d)
    }
    export const swizzle: Test = {
        text: "v8x16.swizzle",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x0e)
    }
}
export module i8x16 {
    export const splat: Test = {
        text: "i8x16.splat",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x0f)
    }
}
export module i16x8 {
    export const splat: Test = {
        text: "i16x8.splat",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x10)
    }
}
export module i32x4 {
    export const splat: Test = {
        text: "i32x4.splat",
        params: [Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x11)
    }
}
export module i64x2 {
    export const splat: Test = {
        text: "i64x2.splat",
        params: [Type.I64],
        result: Type.V128,
        code: c(0xfd, 0x12)
    }
}
export module f32x4 {
    export const splat: Test = {
        text: "f32x4.splat",
        params: [Type.F32],
        result: Type.V128,
        code: c(0xfd, 0x13)
    }
}
export module f64x2 {
    export const splat: Test = {
        text: "f64x2.splat",
        params: [Type.F64],
        result: Type.V128,
        code: c(0xfd, 0x14)
    }
}
export module i8x16 {
    export const extract_lane_s: Test = {
        text: "i8x16.extract_lane_s",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x15)
    }
    export const extract_lane_u: Test = {
        text: "i8x16.extract_lane_u",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x16)
    }
    export const replace_lane: Test = {
        text: "i8x16.replace_lane",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x17)
    }
}
export module i16x8 {
    export const extract_lane_s: Test = {
        text: "i16x8.extract_lane_s",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x18)
    }
    export const extract_lane_u: Test = {
        text: "i16x8.extract_lane_u",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x19)
    }
    export const replace_lane: Test = {
        text: "i16x8.replace_lane",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x1a)
    }
}
export module i32x4 {
    export const extract_lane: Test = {
        text: "i32x4.extract_lane",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x1b)
    }
    export const replace_lane: Test = {
        text: "i32x4.replace_lane",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x1c)
    }
}
export module i64x2 {
    export const extract_lane: Test = {
        text: "i64x2.extract_lane",
        params: [Type.V128],
        result: Type.I64,
        code: c(0xfd, 0x1d)
    }
    export const replace_lane: Test = {
        text: "i64x2.replace_lane",
        params: [Type.V128, Type.I64],
        result: Type.V128,
        code: c(0xfd, 0x1e)
    }
}
export module f32x4 {
    export const extract_lane: Test = {
        text: "f32x4.extract_lane",
        params: [Type.V128],
        result: Type.F32,
        code: c(0xfd, 0x1f)
    }
    export const replace_lane: Test = {
        text: "f32x4.replace_lane",
        params: [Type.V128, Type.F32],
        result: Type.V128,
        code: c(0xfd, 0x20)
    }
}
export module f64x2 {
    export const extract_lane: Test = {
        text: "f64x2.extract_lane",
        params: [Type.V128],
        result: Type.F64,
        code: c(0xfd, 0x21)
    }
    export const replace_lane: Test = {
        text: "f64x2.replace_lane",
        params: [Type.V128, Type.F64],
        result: Type.V128,
        code: c(0xfd, 0x22)
    }
}
export module i8x16 {
    export const eq: Test = {
        text: "i8x16.eq",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x23)
    }
    export const ne: Test = {
        text: "i8x16.ne",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x24)
    }
    export const lt_s: Test = {
        text: "i8x16.lt_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x25)
    }
    export const lt_u: Test = {
        text: "i8x16.lt_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x26)
    }
    export const gt_s: Test = {
        text: "i8x16.gt_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x27)
    }
    export const gt_u: Test = {
        text: "i8x16.gt_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x28)
    }
    export const le_s: Test = {
        text: "i8x16.le_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x29)
    }
    export const le_u: Test = {
        text: "i8x16.le_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x2a)
    }
    export const ge_s: Test = {
        text: "i8x16.ge_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x2b)
    }
    export const ge_u: Test = {
        text: "i8x16.ge_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x2c)
    }
}
export module i16x8 {
    export const eq: Test = {
        text: "i16x8.eq",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x2d)
    }
    export const ne: Test = {
        text: "i16x8.ne",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x2e)
    }
    export const lt_s: Test = {
        text: "i16x8.lt_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x2f)
    }
    export const lt_u: Test = {
        text: "i16x8.lt_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x30)
    }
    export const gt_s: Test = {
        text: "i16x8.gt_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x31)
    }
    export const gt_u: Test = {
        text: "i16x8.gt_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x32)
    }
    export const le_s: Test = {
        text: "i16x8.le_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x33)
    }
    export const le_u: Test = {
        text: "i16x8.le_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x34)
    }
    export const ge_s: Test = {
        text: "i16x8.ge_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x35)
    }
    export const ge_u: Test = {
        text: "i16x8.ge_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x36)
    }
}
export module i32x4 {
    export const eq: Test = {
        text: "i32x4.eq",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x37)
    }
    export const ne: Test = {
        text: "i32x4.ne",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x38)
    }
    export const lt_s: Test = {
        text: "i32x4.lt_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x39)
    }
    export const lt_u: Test = {
        text: "i32x4.lt_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x3a)
    }
    export const gt_s: Test = {
        text: "i32x4.gt_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x3b)
    }
    export const gt_u: Test = {
        text: "i32x4.gt_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x3c)
    }
    export const le_s: Test = {
        text: "i32x4.le_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x3d)
    }
    export const le_u: Test = {
        text: "i32x4.le_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x3e)
    }
    export const ge_s: Test = {
        text: "i32x4.ge_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x3f)
    }
    export const ge_u: Test = {
        text: "i32x4.ge_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x40)
    }
}
export module f32x4 {
    export const eq: Test = {
        text: "f32x4.eq",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x41)
    }
    export const ne: Test = {
        text: "f32x4.ne",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x42)
    }
    export const lt: Test = {
        text: "f32x4.lt",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x43)
    }
    export const gt: Test = {
        text: "f32x4.gt",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x44)
    }
    export const le: Test = {
        text: "f32x4.le",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x45)
    }
    export const ge: Test = {
        text: "f32x4.ge",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x46)
    }
}
export module f64x2 {
    export const eq: Test = {
        text: "f64x2.eq",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x47)
    }
    export const ne: Test = {
        text: "f64x2.ne",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x48)
    }
    export const lt: Test = {
        text: "f64x2.lt",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x49)
    }
    export const gt: Test = {
        text: "f64x2.gt",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x4a)
    }
    export const le: Test = {
        text: "f64x2.le",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x4b)
    }
    export const ge: Test = {
        text: "f64x2.ge",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x4c)
    }
}
export module v128 {
    export const not: Test = {
        text: "v128.not",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x4d)
    }
    export const and: Test = {
        text: "v128.and",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x4e)
    }
    export const andnot: Test = {
        text: "v128.andnot",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x4f)
    }
    export const or: Test = {
        text: "v128.or",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x50)
    }
    export const xor: Test = {
        text: "v128.xor",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x51)
    }
    export const bitselect: Test = {
        text: "v128.bitselect",
        params: [Type.V128, Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x52)
    }
}
export module i8x16 {
    export const abs: Test = {
        text: "i8x16.abs",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x60)
    }
    export const neg: Test = {
        text: "i8x16.neg",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x61)
    }
    export const any_true: Test = {
        text: "i8x16.any_true",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x62)
    }
    export const all_true: Test = {
        text: "i8x16.all_true",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x63)
    }
    export const bitmask: Test = {
        text: "i8x16.bitmask",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x64)
    }
    export const narrow_i16x8_s: Test = {
        text: "i8x16.narrow_i16x8_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x65)
    }
    export const narrow_i16x8_u: Test = {
        text: "i8x16.narrow_i16x8_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x66)
    }
    export const shl: Test = {
        text: "i8x16.shl",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x6b)
    }
    export const shr_s: Test = {
        text: "i8x16.shr_s",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x6c)
    }
    export const shr_u: Test = {
        text: "i8x16.shr_u",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x6d)
    }
    export const add: Test = {
        text: "i8x16.add",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x6e)
    }
    export const add_saturate_s: Test = {
        text: "i8x16.add_saturate_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x6f)
    }
    export const add_saturate_u: Test = {
        text: "i8x16.add_saturate_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x70)
    }
    export const sub: Test = {
        text: "i8x16.sub",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x71)
    }
    export const sub_saturate_s: Test = {
        text: "i8x16.sub_saturate_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x72)
    }
    export const sub_saturate_u: Test = {
        text: "i8x16.sub_saturate_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x73)
    }
    export const min_s: Test = {
        text: "i8x16.min_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x76)
    }
    export const min_u: Test = {
        text: "i8x16.min_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x77)
    }
    export const max_s: Test = {
        text: "i8x16.max_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x78)
    }
    export const max_u: Test = {
        text: "i8x16.max_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x79)
    }
    export const avgr_u: Test = {
        text: "i8x16.avgr_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x7b)
    }
}
export module i16x8 {
    export const abs: Test = {
        text: "i16x8.abs",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x80)
    }
    export const neg: Test = {
        text: "i16x8.neg",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x81)
    }
    export const any_true: Test = {
        text: "i16x8.any_true",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x82)
    }
    export const all_true: Test = {
        text: "i16x8.all_true",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x83)
    }
    export const bitmask: Test = {
        text: "i16x8.bitmask",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0x84)
    }
    export const narrow_i32x4_s: Test = {
        text: "i16x8.narrow_i32x4_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x85)
    }
    export const narrow_i32x4_u: Test = {
        text: "i16x8.narrow_i32x4_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x86)
    }
    export const widen_low_i8x16_s: Test = {
        text: "i16x8.widen_low_i8x16_s",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x87)
    }
    export const widen_high_i8x16_s: Test = {
        text: "i16x8.widen_high_i8x16_s",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x88)
    }
    export const widen_low_i8x16_u: Test = {
        text: "i16x8.widen_low_i8x16_u",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x89)
    }
    export const widen_high_i8x16_u: Test = {
        text: "i16x8.widen_high_i8x16_u",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x8a)
    }
    export const shl: Test = {
        text: "i16x8.shl",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x8b)
    }
    export const shr_s: Test = {
        text: "i16x8.shr_s",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x8c)
    }
    export const shr_u: Test = {
        text: "i16x8.shr_u",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0x8d)
    }
    export const add: Test = {
        text: "i16x8.add",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x8e)
    }
    export const add_saturate_s: Test = {
        text: "i16x8.add_saturate_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x8f)
    }
    export const add_saturate_u: Test = {
        text: "i16x8.add_saturate_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x90)
    }
    export const sub: Test = {
        text: "i16x8.sub",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x91)
    }
    export const sub_saturate_s: Test = {
        text: "i16x8.sub_saturate_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x92)
    }
    export const sub_saturate_u: Test = {
        text: "i16x8.sub_saturate_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x93)
    }
    export const mul: Test = {
        text: "i16x8.mul",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x95)
    }
    export const min_s: Test = {
        text: "i16x8.min_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x96)
    }
    export const min_u: Test = {
        text: "i16x8.min_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x97)
    }
    export const max_s: Test = {
        text: "i16x8.max_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x98)
    }
    export const max_u: Test = {
        text: "i16x8.max_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x99)
    }
    export const avgr_u: Test = {
        text: "i16x8.avgr_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0x9b)
    }
}
export module i32x4 {
    export const abs: Test = {
        text: "i32x4.abs",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xa0)
    }
    export const neg: Test = {
        text: "i32x4.neg",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xa1)
    }
    export const any_true: Test = {
        text: "i32x4.any_true",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0xa2)
    }
    export const all_true: Test = {
        text: "i32x4.all_true",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0xa3)
    }
    export const bitmask: Test = {
        text: "i32x4.bitmask",
        params: [Type.V128],
        result: Type.I32,
        code: c(0xfd, 0xa4)
    }
    export const widen_low_i16x8_s: Test = {
        text: "i32x4.widen_low_i16x8_s",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xa7)
    }
    export const widen_high_i16x8_s: Test = {
        text: "i32x4.widen_high_i16x8_s",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xa8)
    }
    export const widen_low_i16x8_u: Test = {
        text: "i32x4.widen_low_i16x8_u",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xa9)
    }
    export const widen_high_i16x8_u: Test = {
        text: "i32x4.widen_high_i16x8_u",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xaa)
    }
    export const shl: Test = {
        text: "i32x4.shl",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0xab)
    }
    export const shr_s: Test = {
        text: "i32x4.shr_s",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0xac)
    }
    export const shr_u: Test = {
        text: "i32x4.shr_u",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0xad)
    }
    export const add: Test = {
        text: "i32x4.add",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xae)
    }
    export const sub: Test = {
        text: "i32x4.sub",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xb1)
    }
    export const mul: Test = {
        text: "i32x4.mul",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xb5)
    }
    export const min_s: Test = {
        text: "i32x4.min_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xb6)
    }
    export const min_u: Test = {
        text: "i32x4.min_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xb7)
    }
    export const max_s: Test = {
        text: "i32x4.max_s",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xb8)
    }
    export const max_u: Test = {
        text: "i32x4.max_u",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xb9)
    }
}
export module i64x2 {
    export const neg: Test = {
        text: "i64x2.neg",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xc1)
    }
    export const shl: Test = {
        text: "i64x2.shl",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0xcb)
    }
    export const shr_s: Test = {
        text: "i64x2.shr_s",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0xcc)
    }
    export const shr_u: Test = {
        text: "i64x2.shr_u",
        params: [Type.V128, Type.I32],
        result: Type.V128,
        code: c(0xfd, 0xcd)
    }
    export const add: Test = {
        text: "i64x2.add",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xce)
    }
    export const sub: Test = {
        text: "i64x2.sub",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xd1)
    }
    export const mul: Test = {
        text: "i64x2.mul",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xd5)
    }
}
export module f32x4 {
    export const abs: Test = {
        text: "f32x4.abs",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xe0)
    }
    export const neg: Test = {
        text: "f32x4.neg",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xe1)
    }
    export const sqrt: Test = {
        text: "f32x4.sqrt",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xe3)
    }
    export const add: Test = {
        text: "f32x4.add",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xe4)
    }
    export const sub: Test = {
        text: "f32x4.sub",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xe5)
    }
    export const mul: Test = {
        text: "f32x4.mul",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xe6)
    }
    export const div: Test = {
        text: "f32x4.div",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xe7)
    }
    export const min: Test = {
        text: "f32x4.min",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xe8)
    }
    export const max: Test = {
        text: "f32x4.max",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xe9)
    }
}
export module f64x2 {
    export const abs: Test = {
        text: "f64x2.abs",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xec)
    }
    export const neg: Test = {
        text: "f64x2.neg",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xed)
    }
    export const sqrt: Test = {
        text: "f64x2.sqrt",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xef)
    }
    export const add: Test = {
        text: "f64x2.add",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xf0)
    }
    export const sub: Test = {
        text: "f64x2.sub",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xf1)
    }
    export const mul: Test = {
        text: "f64x2.mul",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xf2)
    }
    export const div: Test = {
        text: "f64x2.div",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xf3)
    }
    export const min: Test = {
        text: "f64x2.min",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xf4)
    }
    export const max: Test = {
        text: "f64x2.max",
        params: [Type.V128, Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xf5)
    }
}
export module i32x4 {
    export const trunc_sat_f32x4_s: Test = {
        text: "i32x4.trunc_sat_f32x4_s",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xf8)
    }
    export const trunc_sat_f32x4_u: Test = {
        text: "i32x4.trunc_sat_f32x4_u",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xf9)
    }
}
export module f32x4 {
    export const convert_i32x4_s: Test = {
        text: "f32x4.convert_i32x4_s",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xfa)
    }
    export const convert_i32x4_u: Test = {
        text: "f32x4.convert_i32x4_u",
        params: [Type.V128],
        result: Type.V128,
        code: c(0xfd, 0xfb)
    }
}
export module atomic {
    export const notify: Test = {
        text: "atomic.notify",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x00)
    }
}
export module i32.atomic {
    export const wait: Test = {
        text: "i32.atomic.wait",
        params: [Type.I32, Type.I32, Type.I64],
        result: Type.I32,
        code: c(0xfe, 0x01)
    }
}
export module i64.atomic {
    export const wait: Test = {
        text: "i64.atomic.wait",
        params: [Type.I32, Type.I64, Type.I64],
        result: Type.I32,
        code: c(0xfe, 0x02)
    }
}
export module atomic {
    export const fence: Test = {
        text: "atomic.fence",
        params: [],
        result: null,
        code: c(0xfe, 0x03)
    }
}
export module i32.atomic {
    export const load: Test = {
        text: "i32.atomic.load",
        params: [Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x10)
    }
}
export module i64.atomic {
    export const load: Test = {
        text: "i64.atomic.load",
        params: [Type.I32],
        result: Type.I64,
        code: c(0xfe, 0x11)
    }
}
export module i32.atomic {
    export const load8_u: Test = {
        text: "i32.atomic.load8_u",
        params: [Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x12)
    }
    export const load16_u: Test = {
        text: "i32.atomic.load16_u",
        params: [Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x13)
    }
}
export module i64.atomic {
    export const load8_u: Test = {
        text: "i64.atomic.load8_u",
        params: [Type.I32],
        result: Type.I64,
        code: c(0xfe, 0x14)
    }
    export const load16_u: Test = {
        text: "i64.atomic.load16_u",
        params: [Type.I32],
        result: Type.I64,
        code: c(0xfe, 0x15)
    }
    export const load32_u: Test = {
        text: "i64.atomic.load32_u",
        params: [Type.I32],
        result: Type.I64,
        code: c(0xfe, 0x16)
    }
}
export module i32.atomic {
    export const store: Test = {
        text: "i32.atomic.store",
        params: [Type.I32, Type.I32],
        result: null,
        code: c(0xfe, 0x17)
    }
}
export module i64.atomic {
    export const store: Test = {
        text: "i64.atomic.store",
        params: [Type.I32, Type.I64],
        result: null,
        code: c(0xfe, 0x18)
    }
}
export module i32.atomic {
    export const store8: Test = {
        text: "i32.atomic.store8",
        params: [Type.I32, Type.I32],
        result: null,
        code: c(0xfe, 0x19)
    }
    export const store16: Test = {
        text: "i32.atomic.store16",
        params: [Type.I32, Type.I32],
        result: null,
        code: c(0xfe, 0x1a)
    }
}
export module i64.atomic {
    export const store8: Test = {
        text: "i64.atomic.store8",
        params: [Type.I32, Type.I64],
        result: null,
        code: c(0xfe, 0x1b)
    }
    export const store16: Test = {
        text: "i64.atomic.store16",
        params: [Type.I32, Type.I64],
        result: null,
        code: c(0xfe, 0x1c)
    }
    export const store32: Test = {
        text: "i64.atomic.store32",
        params: [Type.I32, Type.I64],
        result: null,
        code: c(0xfe, 0x1d)
    }
}
export module i32.atomic.rmw {
    export const add: Test = {
        text: "i32.atomic.rmw.add",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x1e)
    }
}
export module i64.atomic.rmw {
    export const add: Test = {
        text: "i64.atomic.rmw.add",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x1f)
    }
}
export module i32.atomic.rmw8 {
    export const add_u: Test = {
        text: "i32.atomic.rmw8.add_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x20)
    }
}
export module i32.atomic.rmw16 {
    export const add_u: Test = {
        text: "i32.atomic.rmw16.add_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x21)
    }
}
export module i64.atomic.rmw8 {
    export const add_u: Test = {
        text: "i64.atomic.rmw8.add_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x22)
    }
}
export module i64.atomic.rmw16 {
    export const add_u: Test = {
        text: "i64.atomic.rmw16.add_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x23)
    }
}
export module i64.atomic.rmw32 {
    export const add_u: Test = {
        text: "i64.atomic.rmw32.add_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x24)
    }
}
export module i32.atomic.rmw {
    export const sub: Test = {
        text: "i32.atomic.rmw.sub",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x25)
    }
}
export module i64.atomic.rmw {
    export const sub: Test = {
        text: "i64.atomic.rmw.sub",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x26)
    }
}
export module i32.atomic.rmw8 {
    export const sub_u: Test = {
        text: "i32.atomic.rmw8.sub_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x27)
    }
}
export module i32.atomic.rmw16 {
    export const sub_u: Test = {
        text: "i32.atomic.rmw16.sub_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x28)
    }
}
export module i64.atomic.rmw8 {
    export const sub_u: Test = {
        text: "i64.atomic.rmw8.sub_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x29)
    }
}
export module i64.atomic.rmw16 {
    export const sub_u: Test = {
        text: "i64.atomic.rmw16.sub_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x2a)
    }
}
export module i64.atomic.rmw32 {
    export const sub_u: Test = {
        text: "i64.atomic.rmw32.sub_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x2b)
    }
}
export module i32.atomic.rmw {
    export const and: Test = {
        text: "i32.atomic.rmw.and",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x2c)
    }
}
export module i64.atomic.rmw {
    export const and: Test = {
        text: "i64.atomic.rmw.and",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x2d)
    }
}
export module i32.atomic.rmw8 {
    export const and_u: Test = {
        text: "i32.atomic.rmw8.and_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x2e)
    }
}
export module i32.atomic.rmw16 {
    export const and_u: Test = {
        text: "i32.atomic.rmw16.and_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x2f)
    }
}
export module i64.atomic.rmw8 {
    export const and_u: Test = {
        text: "i64.atomic.rmw8.and_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x30)
    }
}
export module i64.atomic.rmw16 {
    export const and_u: Test = {
        text: "i64.atomic.rmw16.and_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x31)
    }
}
export module i64.atomic.rmw32 {
    export const and_u: Test = {
        text: "i64.atomic.rmw32.and_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x32)
    }
}
export module i32.atomic.rmw {
    export const or: Test = {
        text: "i32.atomic.rmw.or",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x33)
    }
}
export module i64.atomic.rmw {
    export const or: Test = {
        text: "i64.atomic.rmw.or",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x34)
    }
}
export module i32.atomic.rmw8 {
    export const or_u: Test = {
        text: "i32.atomic.rmw8.or_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x35)
    }
}
export module i32.atomic.rmw16 {
    export const or_u: Test = {
        text: "i32.atomic.rmw16.or_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x36)
    }
}
export module i64.atomic.rmw8 {
    export const or_u: Test = {
        text: "i64.atomic.rmw8.or_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x37)
    }
}
export module i64.atomic.rmw16 {
    export const or_u: Test = {
        text: "i64.atomic.rmw16.or_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x38)
    }
}
export module i64.atomic.rmw32 {
    export const or_u: Test = {
        text: "i64.atomic.rmw32.or_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x39)
    }
}
export module i32.atomic.rmw {
    export const xor: Test = {
        text: "i32.atomic.rmw.xor",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x3a)
    }
}
export module i64.atomic.rmw {
    export const xor: Test = {
        text: "i64.atomic.rmw.xor",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x3b)
    }
}
export module i32.atomic.rmw8 {
    export const xor_u: Test = {
        text: "i32.atomic.rmw8.xor_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x3c)
    }
}
export module i32.atomic.rmw16 {
    export const xor_u: Test = {
        text: "i32.atomic.rmw16.xor_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x3d)
    }
}
export module i64.atomic.rmw8 {
    export const xor_u: Test = {
        text: "i64.atomic.rmw8.xor_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x3e)
    }
}
export module i64.atomic.rmw16 {
    export const xor_u: Test = {
        text: "i64.atomic.rmw16.xor_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x3f)
    }
}
export module i64.atomic.rmw32 {
    export const xor_u: Test = {
        text: "i64.atomic.rmw32.xor_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x40)
    }
}
export module i32.atomic.rmw {
    export const xchg: Test = {
        text: "i32.atomic.rmw.xchg",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x41)
    }
}
export module i64.atomic.rmw {
    export const xchg: Test = {
        text: "i64.atomic.rmw.xchg",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x42)
    }
}
export module i32.atomic.rmw8 {
    export const xchg_u: Test = {
        text: "i32.atomic.rmw8.xchg_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x43)
    }
}
export module i32.atomic.rmw16 {
    export const xchg_u: Test = {
        text: "i32.atomic.rmw16.xchg_u",
        params: [Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x44)
    }
}
export module i64.atomic.rmw8 {
    export const xchg_u: Test = {
        text: "i64.atomic.rmw8.xchg_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x45)
    }
}
export module i64.atomic.rmw16 {
    export const xchg_u: Test = {
        text: "i64.atomic.rmw16.xchg_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x46)
    }
}
export module i64.atomic.rmw32 {
    export const xchg_u: Test = {
        text: "i64.atomic.rmw32.xchg_u",
        params: [Type.I32, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x47)
    }
}
export module i32.atomic.rmw {
    export const cmpxchg: Test = {
        text: "i32.atomic.rmw.cmpxchg",
        params: [Type.I32, Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x48)
    }
}
export module i64.atomic.rmw {
    export const cmpxchg: Test = {
        text: "i64.atomic.rmw.cmpxchg",
        params: [Type.I32, Type.I64, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x49)
    }
}
export module i32.atomic.rmw8 {
    export const cmpxchg_u: Test = {
        text: "i32.atomic.rmw8.cmpxchg_u",
        params: [Type.I32, Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x4a)
    }
}
export module i32.atomic.rmw16 {
    export const cmpxchg_u: Test = {
        text: "i32.atomic.rmw16.cmpxchg_u",
        params: [Type.I32, Type.I32, Type.I32],
        result: Type.I32,
        code: c(0xfe, 0x4b)
    }
}
export module i64.atomic.rmw8 {
    export const cmpxchg_u: Test = {
        text: "i64.atomic.rmw8.cmpxchg_u",
        params: [Type.I32, Type.I64, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x4c)
    }
}
export module i64.atomic.rmw16 {
    export const cmpxchg_u: Test = {
        text: "i64.atomic.rmw16.cmpxchg_u",
        params: [Type.I32, Type.I64, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x4d)
    }
}
export module i64.atomic.rmw32 {
    export const cmpxchg_u: Test = {
        text: "i64.atomic.rmw32.cmpxchg_u",
        params: [Type.I32, Type.I64, Type.I64],
        result: Type.I64,
        code: c(0xfe, 0x4e)
    }
}



export interface FunctionOptions {
    params?: { [name: string]: Type };
    returns?: Type[];
    locals?: { [name: string]: Type };
    codes?: any[];
}

export class Func {
    constructor(options: FunctionOptions) {

    }
    validate() {

    }
}