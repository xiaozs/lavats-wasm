import { BlockType, InstructionType } from './Type';

function encode(instructionSet: Record<string, InstructionOption>): Record<string, InstructionOption> {
    let res: Record<string, InstructionOption> = {};
    for (let text in instructionSet) {
        let instr = instructionSet[text];
        let code = instr.code;
        res[text] = {
            ...instr,
            // todo
            code: code.length === 2 ? [code[0]] : code
        };
    }
    return res;
}

export interface NormalInstructionOption {
    code: number[];
    immediates: InstructionType[];
    operands: InstructionType[];
    returns: InstructionType[];
}

export interface SpecialInstructionOption {
    code: number[];
    immediates: InstructionType[];
    validate: () => boolean;
}

export type InstructionOption = NormalInstructionOption | SpecialInstructionOption;

export let instructionSet: Record<string, InstructionOption> = encode({
    "unreachable": { code: [0x00], immediates: [], validate: function () { return true; } },
    "nop": { code: [0x01], immediates: [], operands: [], returns: [] },
    "block": { code: [0x02], immediates: [InstructionType.BlockType], validate: function () { return true; } },
    "loop": { code: [0x03], immediates: [InstructionType.BlockType], validate: function () { return true; } },
    "if": { code: [0x04], immediates: [InstructionType.BlockType], validate: function () { return true; } },
    "br": { code: [0x0C], immediates: [InstructionType.Index], validate: function () { return true; } },
    "br_if": { code: [0x0D], immediates: [InstructionType.Index], validate: function () { return true; } },
    "br_table": { code: [0x0E], immediates: [InstructionType.Array, InstructionType.Index], validate: function () { return true; } },
    "return": { code: [0x0F], immediates: [], validate: function () { return true; } },

    "call": { code: [0x10], immediates: [InstructionType.Index], validate: function () { return true; } },
    "call_indirect": { code: [0x11], immediates: [InstructionType.Index, InstructionType.Index], validate: function () { return true; } },

    "drop": { code: [0x1A], immediates: [], validate: function () { return true; } },
    "select": { code: [0x1B], immediates: [], validate: function () { return true; } },

    "local.get": { code: [0x20], immediates: [InstructionType.Index], validate: function () { return true; } },
    "local.set": { code: [0x21], immediates: [InstructionType.Index], validate: function () { return true; } },
    "local.tee": { code: [0x22], immediates: [InstructionType.Index], validate: function () { return true; } },
    "global.get": { code: [0x23], immediates: [InstructionType.Index], validate: function () { return true; } },
    "global.set": { code: [0x24], immediates: [InstructionType.Index], validate: function () { return true; } },

    "i32.load": { code: [0x28], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I32] },
    "i64.load": { code: [0x29], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I64] },
    "f32.load": { code: [0x2A], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.F32] },
    "f64.load": { code: [0x2B], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.F64] },
    "i32.load8_s": { code: [0x2C], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I32] },
    "i32.load8_u": { code: [0x2D], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I32] },
    "i32.load16_s": { code: [0x2E], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I32] },
    "i32.load16_u": { code: [0x2F], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I32] },

    "i64.load8_s": { code: [0x30], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I64] },
    "i64.load8_u": { code: [0x31], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I64] },
    "i64.load16_s": { code: [0x32], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I64] },
    "i64.load16_u": { code: [0x33], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I64] },
    "i64.load32_s": { code: [0x34], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I64] },
    "i64.load32_u": { code: [0x35], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32], returns: [InstructionType.I64] },

    "i32.store": { code: [0x36], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32, InstructionType.I32], returns: [] },
    "i64.store": { code: [0x37], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32, InstructionType.I64], returns: [] },
    "f32.store": { code: [0x38], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32, InstructionType.F32], returns: [] },
    "f64.store": { code: [0x39], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32, InstructionType.F64], returns: [] },
    "i32.store8": { code: [0x3A], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32, InstructionType.I32], returns: [] },
    "i32.store16": { code: [0x3B], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32, InstructionType.I32], returns: [] },
    "i64.store8": { code: [0x3C], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32, InstructionType.I64], returns: [] },
    "i64.store16": { code: [0x3D], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32, InstructionType.I64], returns: [] },
    "i64.store32": { code: [0x3E], immediates: [InstructionType.I32, InstructionType.I32], operands: [InstructionType.I32, InstructionType.I64], returns: [] },

    "memory.size": { code: [0x3F], immediates: [InstructionType.Index], operands: [], returns: [InstructionType.I32] },
    "memory.grow": { code: [0x40], immediates: [InstructionType.Index], operands: [InstructionType.I32], returns: [InstructionType.I32] },

    "i32.const": { code: [0x41], immediates: [InstructionType.I32], operands: [], returns: [InstructionType.I32] },
    "i64.const": { code: [0x42], immediates: [InstructionType.I64], operands: [], returns: [InstructionType.I64] },
    "f32.const": { code: [0x43], immediates: [InstructionType.F32], operands: [], returns: [InstructionType.F32] },
    "f64.const": { code: [0x44], immediates: [InstructionType.F64], operands: [], returns: [InstructionType.F64] },

    "i32.eqz": { code: [0x45], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.I32] },
    "i32.eq": { code: [0x46], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.ne": { code: [0x47], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.lt_s": { code: [0x48], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.lt_u": { code: [0x49], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.gt_s": { code: [0x4A], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.gt_u": { code: [0x4B], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.le_s": { code: [0x4C], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.le_u": { code: [0x4D], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.ge_s": { code: [0x4E], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.ge_u": { code: [0x4F], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },

    "i64.eqz": { code: [0x50], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.I32] },
    "i64.eq": { code: [0x51], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I32] },
    "i64.ne": { code: [0x52], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I32] },
    "i64.lt_s": { code: [0x53], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I32] },
    "i64.lt_u": { code: [0x54], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I32] },
    "i64.gt_s": { code: [0x55], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I32] },
    "i64.gt_u": { code: [0x56], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I32] },
    "i64.le_s": { code: [0x57], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I32] },
    "i64.le_u": { code: [0x58], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I32] },
    "i64.ge_s": { code: [0x59], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I32] },
    "i64.ge_u": { code: [0x5A], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I32] },
    "f32.eq": { code: [0x5B], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.I32] },
    "f32.ne": { code: [0x5C], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.I32] },
    "f32.lt": { code: [0x5D], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.I32] },
    "f32.gt": { code: [0x5E], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.I32] },
    "f32.le": { code: [0x5F], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.I32] },

    "f32.ge": { code: [0x60], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.I32] },
    "f64.eq": { code: [0x61], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.I32] },
    "f64.ne": { code: [0x62], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.I32] },
    "f64.lt": { code: [0x63], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.I32] },
    "f64.gt": { code: [0x64], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.I32] },
    "f64.le": { code: [0x65], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.I32] },
    "f64.ge": { code: [0x66], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.I32] },
    "i32.clz": { code: [0x67], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.I32] },
    "i32.ctz": { code: [0x68], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.I32] },
    "i32.popcnt": { code: [0x69], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.I32] },
    "i32.add": { code: [0x6A], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.sub": { code: [0x6B], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.mul": { code: [0x6C], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.div_s": { code: [0x6D], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.div_u": { code: [0x6E], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.rem_s": { code: [0x6F], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },

    "i32.rem_u": { code: [0x70], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.and": { code: [0x71], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.or": { code: [0x72], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.xor": { code: [0x73], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.shl": { code: [0x74], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.shr_s": { code: [0x75], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.shr_u": { code: [0x76], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.rotl": { code: [0x77], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i32.rotr": { code: [0x78], immediates: [], operands: [InstructionType.I32, InstructionType.I32], returns: [InstructionType.I32] },
    "i64.clz": { code: [0x79], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.I64] },
    "i64.ctz": { code: [0x7A], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.I64] },
    "i64.popcnt": { code: [0x7B], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.I64] },
    "i64.add": { code: [0x7C], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.sub": { code: [0x7D], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.mul": { code: [0x7E], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.div_s": { code: [0x7F], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },

    "i64.div_u": { code: [0x80], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.rem_s": { code: [0x81], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.rem_u": { code: [0x82], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.and": { code: [0x83], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.or": { code: [0x84], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.xor": { code: [0x85], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.shl": { code: [0x86], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.shr_s": { code: [0x87], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.shr_u": { code: [0x88], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.rotl": { code: [0x89], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "i64.rotr": { code: [0x8A], immediates: [], operands: [InstructionType.I64, InstructionType.I64], returns: [InstructionType.I64] },
    "f32.abs": { code: [0x8B], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.F32] },
    "f32.neg": { code: [0x8C], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.F32] },
    "f32.ceil": { code: [0x8D], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.F32] },
    "f32.floor": { code: [0x8E], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.F32] },
    "f32.trunc": { code: [0x8F], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.F32] },

    "f32.nearest": { code: [0x90], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.F32] },
    "f32.sqrt": { code: [0x91], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.F32] },
    "f32.add": { code: [0x92], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.F32] },
    "f32.sub": { code: [0x93], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.F32] },
    "f32.mul": { code: [0x94], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.F32] },
    "f32.div": { code: [0x95], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.F32] },
    "f32.min": { code: [0x96], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.F32] },
    "f32.max": { code: [0x97], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.F32] },
    "f32.copysign": { code: [0x98], immediates: [], operands: [InstructionType.F32, InstructionType.F32], returns: [InstructionType.F32] },
    "f64.abs": { code: [0x99], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.F64] },
    "f64.neg": { code: [0x9A], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.F64] },
    "f64.ceil": { code: [0x9B], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.F64] },
    "f64.floor": { code: [0x9C], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.F64] },
    "f64.trunc": { code: [0x9D], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.F64] },
    "f64.nearest": { code: [0x9E], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.F64] },
    "f64.sqrt": { code: [0x9F], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.F64] },

    "f64.add": { code: [0xA0], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.F64] },
    "f64.sub": { code: [0xA1], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.F64] },
    "f64.mul": { code: [0xA2], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.F64] },
    "f64.div": { code: [0xA3], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.F64] },
    "f64.min": { code: [0xA4], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.F64] },
    "f64.max": { code: [0xA5], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.F64] },
    "f64.copysign": { code: [0xA6], immediates: [], operands: [InstructionType.F64, InstructionType.F64], returns: [InstructionType.F64] },
    "i32.wrap_i64": { code: [0xA7], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.I32] },
    "i32.trunc_f32_s": { code: [0xA8], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.I32] },
    "i32.trunc_f32_u": { code: [0xA9], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.I32] },
    "i32.trunc_f64_s": { code: [0xAA], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.I32] },
    "i32.trunc_f64_u": { code: [0xAB], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.I32] },
    "i64.extend_i32_s": { code: [0xAC], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.I64] },
    "i64.extend_i32_u": { code: [0xAD], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.I64] },
    "i64.trunc_f32_s": { code: [0xAE], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.I64] },
    "i64.trunc_f32_u": { code: [0xAF], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.I64] },

    "i64.trunc_f64_s": { code: [0xB0], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.I64] },
    "i64.trunc_f64_u": { code: [0xB1], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.I64] },
    "f32.convert_i32_s": { code: [0xB2], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.F32] },
    "f32.convert_i32_u": { code: [0xB3], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.F32] },
    "f32.convert_i64_s": { code: [0xB4], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.F32] },
    "f32.convert_i64_u": { code: [0xB5], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.F32] },
    "f32.demote_f64": { code: [0xB6], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.F32] },
    "f64.convert_i32_s": { code: [0xB7], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.F64] },
    "f64.convert_i32_u": { code: [0xB8], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.F64] },
    "f64.convert_i64_s": { code: [0xB9], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.F64] },
    "f64.convert_i64_u": { code: [0xBA], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.F64] },
    "f64.promote_f32": { code: [0xBB], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.F64] },
    "i32.reinterpret_f32": { code: [0xBC], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.I32] },
    "i64.reinterpret_f64": { code: [0xBD], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.I64] },
    "f32.reinterpret_i32": { code: [0xBE], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.F32] },
    "f64.reinterpret_i64": { code: [0xBF], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.F64] },

    "i32.extend8_s": { code: [0xC0], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.I32] },
    "i32.extend16_s": { code: [0xC1], immediates: [], operands: [InstructionType.I32], returns: [InstructionType.I32] },
    "i64.extend8_s": { code: [0xC2], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.I64] },
    "i64.extend16_s": { code: [0xC3], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.I64] },
    "i64.extend32_s": { code: [0xC4], immediates: [], operands: [InstructionType.I64], returns: [InstructionType.I64] },

    "i32.trunc_sat_f32_s": { code: [0xfc, 0x00], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.I32] },
    "i32.trunc_sat_f32_u": { code: [0xfc, 0x01], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.I32] },
    "i32.trunc_sat_f64_s": { code: [0xfc, 0x02], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.I32] },
    "i32.trunc_sat_f64_u": { code: [0xfc, 0x03], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.I32] },
    "i64.trunc_sat_f32_s": { code: [0xfc, 0x04], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.I64] },
    "i64.trunc_sat_f32_u": { code: [0xfc, 0x05], immediates: [], operands: [InstructionType.F32], returns: [InstructionType.I64] },
    "i64.trunc_sat_f64_s": { code: [0xfc, 0x06], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.I64] },
    "i64.trunc_sat_f64_u": { code: [0xfc, 0x07], immediates: [], operands: [InstructionType.F64], returns: [InstructionType.I64] },
});


export class Instruction {
    constructor(
        readonly option: InstructionOption,
        private immediates: readonly any[]
    ) { }
}

export interface BlockOption {
    type: BlockType | number;
    code: Instruction[]
}
export class Block extends Instruction {
    constructor(private blockOption: BlockOption) {
        super(instructionSet["block"], [blockOption.type]);
    }
}
export class LoopBlock extends Instruction {
    constructor(private blockOption: BlockOption) {
        super(instructionSet["loop"], [blockOption.type]);
    }
}

export interface IfOption {
    type: BlockType | number;
    if: Instruction[];
    else?: Instruction[];
}
export class IfBlock extends Instruction {
    constructor(private ifOption: IfOption) {
        super(instructionSet["if"], [ifOption.type]);
    }
}