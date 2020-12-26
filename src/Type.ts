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

function isInt(val: number) {
    return ~~val === val;
}

export function isI8(val: number) {
    return isInt(val) && (-(2 ** 7) <= val && val <= 2 ** 7 - 1);
}
export function isI16(val: number) {
    return isInt(val) && (-(2 ** 15) <= val && val <= 2 ** 15 - 1);
}
export function isU32(val: number) {
    return isInt(val) && (0 <= val && val <= 2 ** 32);
}
export function isI32(val: number) {
    return isInt(val) && (-(2 ** 31) <= val && val <= 2 ** 31 - 1);
}
export function isI64(val: number) {
    return isInt(val);
}
export function isF32(val: number) {
    return true;
}
export function isF64(val: number) {
    return true;
}
export function isV128(val: V128) {
    switch (val.type) {
        case "v8x16": return val.value.length === 16 && val.value.every(it => isI8(it));
        case "v16x8": return val.value.length === 8 && val.value.every(it => isI16(it));
        case "v32x4": return val.value.length === 4 && val.value.every(it => isI32(it));
        case "v64x2": return val.value.length === 2 && val.value.every(it => isI64(it));
        default: return false;
    }
}
export function isBlockType(val: number | string) {
    if (typeof val === "string") return true;
    if (typeof val === "number") return BlockType[val] !== undefined || isIndex(val);
    return false;
}
export function isU32Array(val: number[]) {
    return val.every(it => isU32(it));
}
export function isIndex(val: number) {
    return isU32(val);
}

export enum Type {
    I32 = -0x01,
    I64 = -0x02,
    F32 = -0x03,
    F64 = -0x04,
    V128 = -0x05,
}

export enum InstructionType {
    I32 = -0x01,
    I64 = -0x02,
    F32 = -0x03,
    F64 = -0x04,
    V128 = -0x05,
    BlockType,
    Array,
    Index
}

export enum BlockType {
    I32 = -0x01,
    I64 = -0x02,
    F32 = -0x03,
    F64 = -0x04,
    V128 = -0x05,
    Empty = -0x40,
}

export enum ImportExportType {
    Function = 0x00,
    Table = 0x01,
    Memory = 0x02,
    Global = 0x03,
}

export enum ElementType {
    funcref = -0x10,
}

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