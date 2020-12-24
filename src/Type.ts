export type U32 = number;
export type I32 = number;
export type I64 = number;
export type F32 = number;
export type F64 = number;

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