import { BlockType, ImportExportType, InstructionType, Type } from './Type';
import type { CheckEnv, Func, TypeOption } from "./Module";
import type { Index } from './Code';

function encode(instrs: InstructionOption[]): InstructionOption[] {
    let res: InstructionOption[] = [];
    for (let it of instrs) {
        res.push({
            ...it,
            // todo
            code: it.code.length >= 2 ? [it.code[0]] : it.code,
        });
    }
    return res;
}

interface CheckOption {
    env: CheckEnv;
    stack: Stack;
    immediates: readonly any[];
    func: Func;
    linker: BlockLinker;
}

export interface NormalInstructionOption {
    readonly name: string;
    readonly code: readonly number[];
    readonly immediates: readonly InstructionType[];
    readonly params: readonly Type[];
    readonly results: readonly Type[];
}

export interface SpecialInstructionOption {
    readonly name: string;
    readonly code: readonly number[];
    readonly immediates: readonly InstructionType[];
    readonly check: (option: CheckOption) => void;
}

export type InstructionOption = NormalInstructionOption | SpecialInstructionOption;

export const instructions: readonly InstructionOption[] = encode([
    { name: "unreachable", code: [0x00], immediates: [], params: [], results: [] },
    { name: "nop", code: [0x01], immediates: [], params: [], results: [] },
    { name: "block", code: [0x02], immediates: [InstructionType.BlockType], check() { throw new Error("库代码有误") } },
    { name: "loop", code: [0x03], immediates: [InstructionType.BlockType], check() { throw new Error("库代码有误") } },
    { name: "if", code: [0x04], immediates: [InstructionType.BlockType], check() { throw new Error("库代码有误") } },
    {
        name: "br",
        code: [0x0C], immediates: [InstructionType.Index],
        check({ env, stack, immediates, linker }) {
            let labelIndex = immediates[0];
            let isValidate = linker.validateLabel(labelIndex);
            if (!isValidate) throw new Error(`无法找到label ${labelIndex}, 或label ${labelIndex} 超出界限`);

            let type = linker.getType(env);
            stack.checkStackTop(type.results, false);
        }
    },
    {
        name: "br_if",
        code: [0x0D], immediates: [InstructionType.Index],
        check({ env, stack, immediates, linker }) {
            let labelIndex = immediates[0];
            let isValidate = linker.validateLabel(labelIndex);
            if (!isValidate) throw new Error(`无法找到label ${labelIndex}, 或label ${labelIndex} 超出界限`);

            let top = stack.pop();
            if (!top) throw new Error(`空栈`);
            if (top !== Type.I32) throw new Error(`top0 参数的类型应该为 I32`);

            let type = linker.getType(env);
            stack.checkStackTop(type.results, false);
        }
    },
    {
        name: "br_table",
        code: [0x0E], immediates: [InstructionType.Array, InstructionType.Index],
        check({ env, stack, immediates, linker }) {
            let labelIndexes: Index[] = immediates[0];
            let defaultIndex: Index = immediates[1];
            let indexes = [...labelIndexes, defaultIndex];

            for (let idx of indexes) {
                let isValidate = linker.validateLabel(idx);
                if (!isValidate) throw new Error(`无法找到label ${idx}, 或label ${idx} 超出界限`);
            }

            let type = linker.getType(env);
            stack.checkStackTop(type.results, false);
        }
    },
    {
        name: "return",
        code: [0x0F], immediates: [],
        check({ env, stack, linker }) {
            let type = linker.getType(env);
            stack.checkStackTop(type.results, false);
        }
    },

    {
        name: "call",
        code: [0x10], immediates: [InstructionType.Index],
        check({ env, stack, immediates }) {
            let functionIndex = immediates[0];
            let func = env.find(ImportExportType.Function, functionIndex);
            if (!func) throw new Error(`无法找到func ${functionIndex}`);

            stack.checkStackTop(func.params);
            stack.push(...func.results);
        }
    },
    {
        name: "call_indirect",
        code: [0x11], immediates: [InstructionType.Index, InstructionType.Index],
        check({ env, stack, immediates }) {
            let typeIndex = immediates[0];
            let type = env.findType(typeIndex);
            if (!type) throw new Error(`无法找到type ${typeIndex}`);

            let tableIndex = immediates[1];
            let table = env.find(ImportExportType.Table, tableIndex);
            if (!table) throw new Error(`无法找到table ${tableIndex}`);

            let top = stack.pop();
            if (!top) throw new Error(`空栈`);
            if (top !== Type.I32) throw new Error(`top0 参数的类型应该为 I32`);

            stack.checkStackTop(type.params);
            stack.push(...type.results);
        }
    },

    {
        name: "drop",
        code: [0x1A], immediates: [],
        check({ stack }) {
            let top = stack.pop();
            if (!top) throw new Error(`空栈`);
        }
    },
    {
        name: "select",
        code: [0x1B], immediates: [],
        check({ stack }) {
            let top0 = stack.pop();
            let top1 = stack.pop();
            let top2 = stack.pop();

            if (!top0 || !top1 || !top2) throw new Error(`参数个数不足`);
            if (top0 !== Type.I32) throw new Error(`top0 参数的类型应该为 I32`);
            if (top1 !== top2) throw new Error(`top1 和 top2 的类型应该相等`);

            stack.push(top1);
        }
    },

    {
        name: "local.get",
        code: [0x20], immediates: [InstructionType.Index],
        check({ stack, immediates, func }) {
            let localIndex = immediates[0];
            let localType = func.getLocal(localIndex);
            if (!localType) throw new Error(`无法找到local ${localIndex}`);

            stack.push(localType);
        }
    },
    {
        name: "local.set",
        code: [0x21], immediates: [InstructionType.Index],
        check({ stack, immediates, func }) {
            let localIndex = immediates[0];
            let localType = func.getLocal(localIndex);
            if (!localType) throw new Error(`无法找到local ${localIndex}`);

            let top = stack.pop();
            if (!top) throw new Error(`空栈`);

            if (top !== localType) throw new Error(`类型不匹配`);
        }
    },
    {
        name: "local.tee",
        code: [0x22], immediates: [InstructionType.Index],
        check({ stack, immediates, func }) {
            let localIndex = immediates[0];
            let localType = func.getLocal(localIndex);
            if (!localType) throw new Error(`无法找到local ${localIndex}`);

            let top = stack.top;
            if (!top) throw new Error(`空栈`);

            if (top !== localType) throw new Error(`类型不匹配`);
        }
    },
    {
        name: "global.get",
        code: [0x23], immediates: [InstructionType.Index],
        check({ env, stack, immediates }) {
            let globalIndex = immediates[0];
            let global = env.find(ImportExportType.Global, globalIndex);
            if (!global) throw new Error(`无法找到global ${globalIndex}`);

            stack.push(global.globalType);
        }
    },
    {
        name: "global.set",
        code: [0x24], immediates: [InstructionType.Index],
        check({ env, stack, immediates }) {
            let globalIndex = immediates[0];
            let global = env.find(ImportExportType.Global, immediates[0]);
            if (!global) throw new Error(`无法找到global ${globalIndex}`);

            let top = stack.pop();
            if (!top) throw new Error(`空栈`);

            if (global.globalType !== top) throw new Error(`类型不匹配`);
        }
    },

    { name: "i32.load", code: [0x28], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I32] },
    { name: "i64.load", code: [0x29], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "f32.load", code: [0x2A], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.F32] },
    { name: "f64.load", code: [0x2B], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.F64] },
    { name: "i32.load8_s", code: [0x2C], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I32] },
    { name: "i32.load8_u", code: [0x2D], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I32] },
    { name: "i32.load16_s", code: [0x2E], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I32] },
    { name: "i32.load16_u", code: [0x2F], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I32] },

    { name: "i64.load8_s", code: [0x30], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "i64.load8_u", code: [0x31], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "i64.load16_s", code: [0x32], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "i64.load16_u", code: [0x33], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "i64.load32_s", code: [0x34], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "i64.load32_u", code: [0x35], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32], results: [Type.I64] },

    { name: "i32.store", code: [0x36], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32, Type.I32], results: [] },
    { name: "i64.store", code: [0x37], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32, Type.I64], results: [] },
    { name: "f32.store", code: [0x38], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32, Type.F32], results: [] },
    { name: "f64.store", code: [0x39], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32, Type.F64], results: [] },
    { name: "i32.store8", code: [0x3A], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32, Type.I32], results: [] },
    { name: "i32.store16", code: [0x3B], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32, Type.I32], results: [] },
    { name: "i64.store8", code: [0x3C], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32, Type.I64], results: [] },
    { name: "i64.store16", code: [0x3D], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32, Type.I64], results: [] },
    { name: "i64.store32", code: [0x3E], immediates: [InstructionType.I32, InstructionType.I32], params: [Type.I32, Type.I64], results: [] },

    { name: "memory.size", code: [0x3F], immediates: [InstructionType.Index], params: [], results: [Type.I32] },
    { name: "memory.grow", code: [0x40], immediates: [InstructionType.Index], params: [Type.I32], results: [Type.I32] },

    { name: "i32.const", code: [0x41], immediates: [InstructionType.I32], params: [], results: [Type.I32] },
    { name: "i64.const", code: [0x42], immediates: [InstructionType.I64], params: [], results: [Type.I64] },
    { name: "f32.const", code: [0x43], immediates: [InstructionType.F32], params: [], results: [Type.F32] },
    { name: "f64.const", code: [0x44], immediates: [InstructionType.F64], params: [], results: [Type.F64] },

    { name: "i32.eqz", code: [0x45], immediates: [], params: [Type.I32], results: [Type.I32] },
    { name: "i32.eq", code: [0x46], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.ne", code: [0x47], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.lt_s", code: [0x48], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.lt_u", code: [0x49], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.gt_s", code: [0x4A], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.gt_u", code: [0x4B], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.le_s", code: [0x4C], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.le_u", code: [0x4D], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.ge_s", code: [0x4E], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.ge_u", code: [0x4F], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },

    { name: "i64.eqz", code: [0x50], immediates: [], params: [Type.I64], results: [Type.I32] },
    { name: "i64.eq", code: [0x51], immediates: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.ne", code: [0x52], immediates: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.lt_s", code: [0x53], immediates: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.lt_u", code: [0x54], immediates: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.gt_s", code: [0x55], immediates: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.gt_u", code: [0x56], immediates: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.le_s", code: [0x57], immediates: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.le_u", code: [0x58], immediates: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.ge_s", code: [0x59], immediates: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.ge_u", code: [0x5A], immediates: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "f32.eq", code: [0x5B], immediates: [], params: [Type.F32], results: [Type.I32] },
    { name: "f32.ne", code: [0x5C], immediates: [], params: [Type.F32, Type.F32], results: [Type.I32] },
    { name: "f32.lt", code: [0x5D], immediates: [], params: [Type.F32, Type.F32], results: [Type.I32] },
    { name: "f32.gt", code: [0x5E], immediates: [], params: [Type.F32, Type.F32], results: [Type.I32] },
    { name: "f32.le", code: [0x5F], immediates: [], params: [Type.F32, Type.F32], results: [Type.I32] },

    { name: "f32.ge", code: [0x60], immediates: [], params: [Type.F32, Type.F32], results: [Type.I32] },
    { name: "f64.eq", code: [0x61], immediates: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "f64.ne", code: [0x62], immediates: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "f64.lt", code: [0x63], immediates: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "f64.gt", code: [0x64], immediates: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "f64.le", code: [0x65], immediates: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "f64.ge", code: [0x66], immediates: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "i32.clz", code: [0x67], immediates: [], params: [Type.I32], results: [Type.I32] },
    { name: "i32.ctz", code: [0x68], immediates: [], params: [Type.I32], results: [Type.I32] },
    { name: "i32.popcnt", code: [0x69], immediates: [], params: [Type.I32], results: [Type.I32] },
    { name: "i32.add", code: [0x6A], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.sub", code: [0x6B], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.mul", code: [0x6C], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.div_s", code: [0x6D], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.div_u", code: [0x6E], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.rem_s", code: [0x6F], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },

    { name: "i32.rem_u", code: [0x70], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.and", code: [0x71], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.or", code: [0x72], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.xor", code: [0x73], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.shl", code: [0x74], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.shr_s", code: [0x75], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.shr_u", code: [0x76], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.rotl", code: [0x77], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.rotr", code: [0x78], immediates: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i64.clz", code: [0x79], immediates: [], params: [Type.I64], results: [Type.I64] },
    { name: "i64.ctz", code: [0x7A], immediates: [], params: [Type.I64], results: [Type.I64] },
    { name: "i64.popcnt", code: [0x7B], immediates: [], params: [Type.I64], results: [Type.I64] },
    { name: "i64.add", code: [0x7C], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.sub", code: [0x7D], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.mul", code: [0x7E], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.div_s", code: [0x7F], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },

    { name: "i64.div_u", code: [0x80], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.rem_s", code: [0x81], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.rem_u", code: [0x82], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.and", code: [0x83], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.or", code: [0x84], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.xor", code: [0x85], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.shl", code: [0x86], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.shr_s", code: [0x87], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.shr_u", code: [0x88], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.rotl", code: [0x89], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.rotr", code: [0x8A], immediates: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "f32.abs", code: [0x8B], immediates: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.neg", code: [0x8C], immediates: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.ceil", code: [0x8D], immediates: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.floor", code: [0x8E], immediates: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.trunc", code: [0x8F], immediates: [], params: [Type.F32], results: [Type.F32] },

    { name: "f32.nearest", code: [0x90], immediates: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.sqrt", code: [0x91], immediates: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.add", code: [0x92], immediates: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.sub", code: [0x93], immediates: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.mul", code: [0x94], immediates: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.div", code: [0x95], immediates: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.min", code: [0x96], immediates: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.max", code: [0x97], immediates: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.copysign", code: [0x98], immediates: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f64.abs", code: [0x99], immediates: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.neg", code: [0x9A], immediates: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.ceil", code: [0x9B], immediates: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.floor", code: [0x9C], immediates: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.trunc", code: [0x9D], immediates: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.nearest", code: [0x9E], immediates: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.sqrt", code: [0x9F], immediates: [], params: [Type.F64], results: [Type.F64] },

    { name: "f64.add", code: [0xA0], immediates: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.sub", code: [0xA1], immediates: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.mul", code: [0xA2], immediates: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.div", code: [0xA3], immediates: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.min", code: [0xA4], immediates: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.max", code: [0xA5], immediates: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.copysign", code: [0xA6], immediates: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "i32.wrap_i64", code: [0xA7], immediates: [], params: [Type.I64], results: [Type.I32] },
    { name: "i32.trunc_f32_s", code: [0xA8], immediates: [], params: [Type.F32], results: [Type.I32] },
    { name: "i32.trunc_f32_u", code: [0xA9], immediates: [], params: [Type.F32], results: [Type.I32] },
    { name: "i32.trunc_f64_s", code: [0xAA], immediates: [], params: [Type.F64], results: [Type.I32] },
    { name: "i32.trunc_f64_u", code: [0xAB], immediates: [], params: [Type.F64], results: [Type.I32] },
    { name: "i64.extend_i32_s", code: [0xAC], immediates: [], params: [Type.I32], results: [Type.I64] },
    { name: "i64.extend_i32_u", code: [0xAD], immediates: [], params: [Type.I32], results: [Type.I64] },
    { name: "i64.trunc_f32_s", code: [0xAE], immediates: [], params: [Type.F32], results: [Type.I64] },
    { name: "i64.trunc_f32_u", code: [0xAF], immediates: [], params: [Type.F32], results: [Type.I64] },

    { name: "i64.trunc_f64_s", code: [0xB0], immediates: [], params: [Type.F64], results: [Type.I64] },
    { name: "i64.trunc_f64_u", code: [0xB1], immediates: [], params: [Type.F64], results: [Type.I64] },
    { name: "f32.convert_i32_s", code: [0xB2], immediates: [], params: [Type.I32], results: [Type.F32] },
    { name: "f32.convert_i32_u", code: [0xB3], immediates: [], params: [Type.I32], results: [Type.F32] },
    { name: "f32.convert_i64_s", code: [0xB4], immediates: [], params: [Type.I64], results: [Type.F32] },
    { name: "f32.convert_i64_u", code: [0xB5], immediates: [], params: [Type.I64], results: [Type.F32] },
    { name: "f32.demote_f64", code: [0xB6], immediates: [], params: [Type.F64], results: [Type.F32] },
    { name: "f64.convert_i32_s", code: [0xB7], immediates: [], params: [Type.I32], results: [Type.F64] },
    { name: "f64.convert_i32_u", code: [0xB8], immediates: [], params: [Type.I32], results: [Type.F64] },
    { name: "f64.convert_i64_s", code: [0xB9], immediates: [], params: [Type.I64], results: [Type.F64] },
    { name: "f64.convert_i64_u", code: [0xBA], immediates: [], params: [Type.I64], results: [Type.F64] },
    { name: "f64.promote_f32", code: [0xBB], immediates: [], params: [Type.F32], results: [Type.F64] },
    { name: "i32.reinterpret_f32", code: [0xBC], immediates: [], params: [Type.F32], results: [Type.I32] },
    { name: "i64.reinterpret_f64", code: [0xBD], immediates: [], params: [Type.F64], results: [Type.I64] },
    { name: "f32.reinterpret_i32", code: [0xBE], immediates: [], params: [Type.I32], results: [Type.F32] },
    { name: "f64.reinterpret_i64", code: [0xBF], immediates: [], params: [Type.I64], results: [Type.F64] },

    { name: "i32.extend8_s", code: [0xC0], immediates: [], params: [Type.I32], results: [Type.I32] },
    { name: "i32.extend16_s", code: [0xC1], immediates: [], params: [Type.I32], results: [Type.I32] },
    { name: "i64.extend8_s", code: [0xC2], immediates: [], params: [Type.I64], results: [Type.I64] },
    { name: "i64.extend16_s", code: [0xC3], immediates: [], params: [Type.I64], results: [Type.I64] },
    { name: "i64.extend32_s", code: [0xC4], immediates: [], params: [Type.I64], results: [Type.I64] },

    { name: "i32.trunc_sat_f32_s", code: [0xfc, 0x00], immediates: [], params: [Type.F32], results: [Type.I32] },
    { name: "i32.trunc_sat_f32_u", code: [0xfc, 0x01], immediates: [], params: [Type.F32], results: [Type.I32] },
    { name: "i32.trunc_sat_f64_s", code: [0xfc, 0x02], immediates: [], params: [Type.F64], results: [Type.I32] },
    { name: "i32.trunc_sat_f64_u", code: [0xfc, 0x03], immediates: [], params: [Type.F64], results: [Type.I32] },
    { name: "i64.trunc_sat_f32_s", code: [0xfc, 0x04], immediates: [], params: [Type.F32], results: [Type.I64] },
    { name: "i64.trunc_sat_f32_u", code: [0xfc, 0x05], immediates: [], params: [Type.F32], results: [Type.I64] },
    { name: "i64.trunc_sat_f64_s", code: [0xfc, 0x06], immediates: [], params: [Type.F64], results: [Type.I64] },
    { name: "i64.trunc_sat_f64_u", code: [0xfc, 0x07], immediates: [], params: [Type.F64], results: [Type.I64] },
]);

export const instructionSet = instructions.reduce((res, it) => {
    res[it.name] = it;
    return res;
}, {} as Record<string, InstructionOption>);

export class Stack {
    private data: Type[];
    constructor(data: Type[] = []) {
        this.data = [...data];
    }
    checkStackTop(types: readonly Type[], isPop = true) {
        let count = types.length;
        let input: Type[];
        if (isPop) {
            input = this.data.splice(this.data.length - count, count);
        } else {
            input = this.data.slice(this.data.length - count);
        }

        for (let i = 0; i < count; i++) {
            let it = input[i];
            let p = types[i];

            if (it !== p) throw new Error(`参数不匹配`);
        }
    }
    pop() {
        return this.data.pop();
    }
    push(...items: Type[]) {
        return this.data.push(...items);
    }
    get top() {
        return this.data[this.data.length - 1];
    }
    get length() {
        return this.data.length;
    }
    copy() {
        return new Stack(this.data);
    }
}

export class Instruction {
    constructor(
        private option: InstructionOption,
        protected immediates: readonly any[]
    ) { }

    check(env: CheckEnv, stack: Stack, func: Func, linker: BlockLinker) {
        if ("check" in this.option) {
            this.option.check({
                env,
                stack,
                immediates: this.immediates,
                func,
                linker
            });
        } else {
            stack.checkStackTop(this.option.params);
            stack.push(...this.option.results);
        }
    }
}

export abstract class BlockInstruction extends Instruction {
    getType(env: CheckEnv, blockType: BlockType | Index): TypeOption | undefined {
        switch (blockType) {
            case BlockType.I32: return { params: [], results: [Type.I32] };
            case BlockType.I64: return { params: [], results: [Type.I64] };
            case BlockType.F32: return { params: [], results: [Type.F32] };
            case BlockType.F64: return { params: [], results: [Type.F64] };
            case BlockType.V128: return { params: [], results: [Type.V128] };
            case BlockType.Empty: return { params: [], results: [] };
            default: return env.findType(blockType);
        }
    }
    abstract get name(): string | undefined;
    abstract get type(): BlockType | Index;
}

export interface BlockOption {
    name?: string;
    type: BlockType | Index;
    codes: Instruction[]
}
export class Block extends BlockInstruction {
    get name() {
        return this.blockOption.name;
    }
    get type() {
        return this.blockOption.type;
    }
    constructor(private blockOption: BlockOption) {
        super(instructionSet["block"], [blockOption.type]);
    }
    check(env: CheckEnv, stack: Stack, func: Func, linker: BlockLinker) {
        let blockType = this.immediates[0];
        let type = this.getType(env, blockType);
        if (!type) throw new Error(`type ${blockType}不存在`);

        stack.checkStackTop(type.params);

        let blockStack = new Stack(type.params);
        for (let code of this.blockOption.codes) {
            code.check(env, blockStack, func, linker.createSubLinker(this));
        }
        if (blockStack.length !== type.results.length) throw new Error("出参不匹配");
        blockStack.checkStackTop(type.results, false);

        stack.push(...type.results);
    }
}
export class LoopBlock extends BlockInstruction {
    get name() {
        return this.blockOption.name;
    }
    get type() {
        return this.blockOption.type;
    }
    constructor(private blockOption: BlockOption) {
        super(instructionSet["loop"], [blockOption.type]);
    }
    check(env: CheckEnv, stack: Stack, func: Func, linker: BlockLinker) {
        let blockType = this.immediates[0];
        let type = this.getType(env, blockType);
        if (!type) throw new Error(`type ${blockType}不存在`);

        stack.checkStackTop(type.params);

        let blockStack = new Stack(type.params);
        for (let code of this.blockOption.codes) {
            code.check(env, blockStack, func, linker.createSubLinker(this));
        }
        if (blockStack.length !== type.results.length) throw new Error("出参不匹配");
        blockStack.checkStackTop(type.results, false);

        stack.push(...type.results);
    }
}

export interface IfOption {
    name?: string;
    type: BlockType | Index;
    then: Instruction[];
    else?: Instruction[];
}
export class IfBlock extends BlockInstruction {
    get name() {
        return this.ifOption.name;
    }
    get type() {
        return this.ifOption.type;
    }
    constructor(private ifOption: IfOption) {
        super(instructionSet["if"], [ifOption.type]);
    }
    check(env: CheckEnv, stack: Stack, func: Func, linker: BlockLinker) {
        let blockType = this.immediates[0];
        let type = this.getType(env, blockType);
        if (!type) throw new Error(`type ${blockType}不存在`);

        let top = stack.pop();
        if (!top) throw new Error(`空栈`);
        if (top !== Type.I32) throw new Error(`top0 参数的类型应该为 I32`);

        stack.checkStackTop(type.params);

        let thenStack = new Stack(type.params);
        for (let code of this.ifOption.then) {
            code.check(env, thenStack, func, linker.createSubLinker(this));
        }
        if (thenStack.length !== type.results.length) throw new Error("出参不匹配");
        thenStack.checkStackTop(type.results, false);

        let elseStack = new Stack(type.params);
        for (let code of this.ifOption.else || []) {
            code.check(env, elseStack, func, linker.createSubLinker(this));
        }
        if (elseStack.length !== type.results.length) throw new Error("出参不匹配");
        elseStack.checkStackTop(type.results, false);

        stack.push(...type.results);
    }
    checkBranch(env: CheckEnv, stack: Stack, func: Func, linker: BlockLinker, codes: Instruction[]) {
        for (let code of codes) {
            code.check(env, stack, func, linker.createSubLinker(this));
        }
    }
}

export class BlockLinker {
    private parent?: BlockLinker;
    constructor(private instr: BlockInstruction | Func) { }
    createSubLinker(instr: BlockInstruction | Func) {
        let res = new BlockLinker(instr);
        res.parent = this;
        return res;
    }
    validateLabel(labelIndex: Index): boolean {
        if (typeof labelIndex === "string") {
            return this.validateName(labelIndex);
        } else {
            return this.validateIndex(labelIndex);
        }
    }
    getType(env: CheckEnv): TypeOption {
        if (this.instr instanceof BlockInstruction) {
            return this.instr.getType(env, this.instr.type)!;
        } else {
            return this.instr.getType();
        }
    }
    private validateIndex(index: number, currentIndex = 0): boolean {
        if (index === currentIndex) return true;
        if (this.parent) {
            return this.parent.validateIndex(index, currentIndex + 1);
        } else {
            return false;
        }
    }
    private validateName(name: string): boolean {
        if (this.instr.name === name) return true;
        if (this.parent) {
            return this.parent.validateName(name);
        } else {
            return false;
        }
    }
}