import { combin, decodeArray, decodeF32, decodeF64, decodeSint, decodeUint, encodeArray, encodeF32, encodeF64, encodeInt, Offset } from './encode';
import type { Env } from "./Env";
import type { Func } from "./Func";
import type { NameMap } from './Section';
import { Stack } from './Stack';
import { BlockOption, blockTypeMap, CheckOption, FormatOption, IfOption, ImmediateType, Index, IndexType, InstructionOption, isSameType, NormalInstructionOption, SpecialInstructionOption, ToBufferOption, Type, TypeOption, U32 } from './Type';
import { expandInstr, flatInstr, flatItem, itemName, typeToString } from './utils';

/**
 * 指令配置
 */
type InstrsOption = (Omit<NormalInstructionOption, "code"> | Omit<SpecialInstructionOption, "code">) & { code: number[] };

/**
 * 用于处理指令的code字段，该字段如果有第二个数，将第二个数编码为LEB128
 * @param instrs 指令
 */
function encode(instrs: InstrsOption[]): InstructionOption[] {
    let res: InstructionOption[] = [];
    for (let it of instrs) {
        let code = it.code;
        if (it.code.length >= 2) {
            let buffer = encodeInt(it.code[1]);
            let view = new Uint8Array(buffer);
            code = [code[0], ...view];
        }

        let buf = new Uint8Array(code).buffer;

        res.push({
            ...it,
            code: buf,
        });
    }
    return res;
}

/**
 * 所有指令
 */
export const instructions: readonly InstructionOption[] = encode([
    { name: "unreachable", code: [0x00], immediateTypes: [], params: [], results: [] },
    { name: "nop", code: [0x01], immediateTypes: [], params: [], results: [] },
    { name: "block", code: [0x02], immediateTypes: [ImmediateType.BlockType], check() { throw new Error("库代码有误") } },
    { name: "loop", code: [0x03], immediateTypes: [ImmediateType.BlockType], check() { throw new Error("库代码有误") } },
    { name: "if", code: [0x04], immediateTypes: [ImmediateType.BlockType], check() { throw new Error("库代码有误") } },
    { name: "else", code: [0x05], immediateTypes: [], params: [], results: [] },
    { name: "end", code: [0x0b], immediateTypes: [], params: [], results: [] },
    {
        name: "br",
        code: [0x0C], immediateTypes: [ImmediateType.Index],
        immediateIndexTypes: [IndexType.Label],
        check({ stack, immediates, block }) {
            let labelIndex = immediates[0];
            let isValidate = block.validateLabel(labelIndex);
            if (!isValidate) throw new Error(`无法找到label ${labelIndex}, 或label ${labelIndex} 超出界限`);

            let type = block.getType();
            stack.checkStackTop(type.results ?? [], false);
        }
    },
    {
        name: "br_if",
        code: [0x0D], immediateTypes: [ImmediateType.Index],
        immediateIndexTypes: [IndexType.Label],
        check({ stack, immediates, block }) {
            let labelIndex = immediates[0];
            let isValidate = block.validateLabel(labelIndex);
            if (!isValidate) throw new Error(`无法找到label ${labelIndex}, 或label ${labelIndex} 超出界限`);

            let top = stack.pop();
            if (!top) throw new Error(`空栈`);
            if (top !== Type.I32) throw new Error(`top0 参数的类型应该为 I32`);

            let type = block.getType();
            stack.checkStackTop(type.results ?? [], false);
        }
    },
    {
        name: "br_table",
        code: [0x0E], immediateTypes: [ImmediateType.IndexArray, ImmediateType.Index],
        immediateIndexTypes: [IndexType.Label, IndexType.Label],
        check({ stack, immediates, block }) {
            let labelIndexes: Index[] = immediates[0];
            let defaultIndex: Index = immediates[1];
            let indexes = [...labelIndexes, defaultIndex];

            for (let idx of indexes) {
                let isValidate = block.validateLabel(idx);
                if (!isValidate) throw new Error(`无法找到label ${idx}, 或label ${idx} 超出界限`);
            }

            let type = block.getType();
            stack.checkStackTop(type.results ?? [], false);
        }
    },
    {
        name: "return",
        code: [0x0F], immediateTypes: [],
        check({ stack, block }) {
            let type = block.getType();
            stack.checkStackTop(type.results ?? [], false);
        }
    },

    {
        name: "call",
        code: [0x10], immediateTypes: [ImmediateType.Index],
        immediateIndexTypes: [IndexType.Function],
        check({ env, stack, immediates }) {
            let functionIndex = immediates[0];
            let func = env.findFunction(functionIndex);
            if (!func) throw new Error(`无法找到func ${functionIndex}`);

            stack.checkStackTop(func.params ?? []);
            stack.push(...func.results ?? []);
        }
    },
    {
        name: "call_indirect",
        code: [0x11], immediateTypes: [ImmediateType.Index, ImmediateType.Index],
        immediateIndexTypes: [IndexType.Type, IndexType.Table],
        check({ env, stack, immediates }) {
            let typeIndex = immediates[0];
            let type = env.findType(typeIndex);
            if (!type) throw new Error(`无法找到type ${typeIndex}`);

            let tableIndex = immediates[1];
            let table = env.findTable(tableIndex);
            if (!table) throw new Error(`无法找到table ${tableIndex}`);

            let top = stack.pop();
            if (!top) throw new Error(`空栈`);
            if (top !== Type.I32) throw new Error(`top0 参数的类型应该为 I32`);

            stack.checkStackTop(type.params ?? []);
            stack.push(...type.results ?? []);
        }
    },

    {
        name: "drop",
        code: [0x1A], immediateTypes: [],
        check({ stack }) {
            let top = stack.pop();
            if (!top) throw new Error(`空栈`);
        }
    },
    {
        name: "select",
        code: [0x1B], immediateTypes: [],
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
        code: [0x20], immediateTypes: [ImmediateType.Index],
        immediateIndexTypes: [IndexType.Local],
        check({ stack, immediates, func }) {
            let localIndex = immediates[0];
            let localType = func.getLocalType(localIndex);
            if (!localType) throw new Error(`无法找到local ${localIndex}`);

            stack.push(localType);
        }
    },
    {
        name: "local.set",
        code: [0x21], immediateTypes: [ImmediateType.Index],
        immediateIndexTypes: [IndexType.Local],
        check({ stack, immediates, func }) {
            let localIndex = immediates[0];
            let localType = func.getLocalType(localIndex);
            if (!localType) throw new Error(`无法找到local ${localIndex}`);

            let top = stack.pop();
            if (!top) throw new Error(`空栈`);

            if (top !== localType) throw new Error(`类型不匹配`);
        }
    },
    {
        name: "local.tee",
        code: [0x22], immediateTypes: [ImmediateType.Index],
        immediateIndexTypes: [IndexType.Local],
        check({ stack, immediates, func }) {
            let localIndex = immediates[0];
            let localType = func.getLocalType(localIndex);
            if (!localType) throw new Error(`无法找到local ${localIndex}`);

            let top = stack.top;
            if (!top) throw new Error(`空栈`);

            if (top !== localType) throw new Error(`类型不匹配`);
        }
    },
    {
        name: "global.get",
        code: [0x23], immediateTypes: [ImmediateType.Index],
        immediateIndexTypes: [IndexType.Global],
        check({ env, stack, immediates }) {
            let globalIndex = immediates[0];
            let global = env.findGlobal(globalIndex);
            if (!global) throw new Error(`无法找到global ${globalIndex}`);

            stack.push(global.valueType);
        }
    },
    {
        name: "global.set",
        code: [0x24], immediateTypes: [ImmediateType.Index],
        immediateIndexTypes: [IndexType.Global],
        check({ env, stack, immediates }) {
            let globalIndex = immediates[0];
            let global = env.findGlobal(immediates[0]);
            if (!global) throw new Error(`无法找到global ${globalIndex}`);

            let top = stack.pop();
            if (!top) throw new Error(`空栈`);

            if (global.valueType !== top) throw new Error(`类型不匹配`);

            if (!global.mutable) throw new Error(`global ${globalIndex}: 无法修改`);
        }
    },

    { name: "i32.load", code: [0x28], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I32] },
    { name: "i64.load", code: [0x29], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "f32.load", code: [0x2A], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.F32] },
    { name: "f64.load", code: [0x2B], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.F64] },
    { name: "i32.load8_s", code: [0x2C], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I32] },
    { name: "i32.load8_u", code: [0x2D], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I32] },
    { name: "i32.load16_s", code: [0x2E], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I32] },
    { name: "i32.load16_u", code: [0x2F], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I32] },

    { name: "i64.load8_s", code: [0x30], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "i64.load8_u", code: [0x31], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "i64.load16_s", code: [0x32], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "i64.load16_u", code: [0x33], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "i64.load32_s", code: [0x34], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I64] },
    { name: "i64.load32_u", code: [0x35], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32], results: [Type.I64] },

    { name: "i32.store", code: [0x36], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32, Type.I32], results: [] },
    { name: "i64.store", code: [0x37], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32, Type.I64], results: [] },
    { name: "f32.store", code: [0x38], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32, Type.F32], results: [] },
    { name: "f64.store", code: [0x39], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32, Type.F64], results: [] },
    { name: "i32.store8", code: [0x3A], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32, Type.I32], results: [] },
    { name: "i32.store16", code: [0x3B], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32, Type.I32], results: [] },
    { name: "i64.store8", code: [0x3C], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32, Type.I64], results: [] },
    { name: "i64.store16", code: [0x3D], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32, Type.I64], results: [] },
    { name: "i64.store32", code: [0x3E], immediateTypes: [ImmediateType.I32, ImmediateType.I32], params: [Type.I32, Type.I64], results: [] },

    { name: "memory.size", code: [0x3F], immediateTypes: [ImmediateType.Index], immediateIndexTypes: [IndexType.Memory], params: [], results: [Type.I32] },
    { name: "memory.grow", code: [0x40], immediateTypes: [ImmediateType.Index], immediateIndexTypes: [IndexType.Memory], params: [Type.I32], results: [Type.I32] },

    { name: "i32.const", code: [0x41], immediateTypes: [ImmediateType.I32], params: [], results: [Type.I32] },
    { name: "i64.const", code: [0x42], immediateTypes: [ImmediateType.I64], params: [], results: [Type.I64] },
    { name: "f32.const", code: [0x43], immediateTypes: [ImmediateType.F32], params: [], results: [Type.F32] },
    { name: "f64.const", code: [0x44], immediateTypes: [ImmediateType.F64], params: [], results: [Type.F64] },

    { name: "i32.eqz", code: [0x45], immediateTypes: [], params: [Type.I32], results: [Type.I32] },
    { name: "i32.eq", code: [0x46], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.ne", code: [0x47], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.lt_s", code: [0x48], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.lt_u", code: [0x49], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.gt_s", code: [0x4A], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.gt_u", code: [0x4B], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.le_s", code: [0x4C], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.le_u", code: [0x4D], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.ge_s", code: [0x4E], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.ge_u", code: [0x4F], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },

    { name: "i64.eqz", code: [0x50], immediateTypes: [], params: [Type.I64], results: [Type.I32] },
    { name: "i64.eq", code: [0x51], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.ne", code: [0x52], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.lt_s", code: [0x53], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.lt_u", code: [0x54], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.gt_s", code: [0x55], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.gt_u", code: [0x56], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.le_s", code: [0x57], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.le_u", code: [0x58], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.ge_s", code: [0x59], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "i64.ge_u", code: [0x5A], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I32] },
    { name: "f32.eq", code: [0x5B], immediateTypes: [], params: [Type.F32], results: [Type.I32] },
    { name: "f32.ne", code: [0x5C], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.I32] },
    { name: "f32.lt", code: [0x5D], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.I32] },
    { name: "f32.gt", code: [0x5E], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.I32] },
    { name: "f32.le", code: [0x5F], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.I32] },

    { name: "f32.ge", code: [0x60], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.I32] },
    { name: "f64.eq", code: [0x61], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "f64.ne", code: [0x62], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "f64.lt", code: [0x63], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "f64.gt", code: [0x64], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "f64.le", code: [0x65], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "f64.ge", code: [0x66], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.I32] },
    { name: "i32.clz", code: [0x67], immediateTypes: [], params: [Type.I32], results: [Type.I32] },
    { name: "i32.ctz", code: [0x68], immediateTypes: [], params: [Type.I32], results: [Type.I32] },
    { name: "i32.popcnt", code: [0x69], immediateTypes: [], params: [Type.I32], results: [Type.I32] },
    { name: "i32.add", code: [0x6A], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.sub", code: [0x6B], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.mul", code: [0x6C], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.div_s", code: [0x6D], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.div_u", code: [0x6E], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.rem_s", code: [0x6F], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },

    { name: "i32.rem_u", code: [0x70], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.and", code: [0x71], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.or", code: [0x72], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.xor", code: [0x73], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.shl", code: [0x74], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.shr_s", code: [0x75], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.shr_u", code: [0x76], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.rotl", code: [0x77], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i32.rotr", code: [0x78], immediateTypes: [], params: [Type.I32, Type.I32], results: [Type.I32] },
    { name: "i64.clz", code: [0x79], immediateTypes: [], params: [Type.I64], results: [Type.I64] },
    { name: "i64.ctz", code: [0x7A], immediateTypes: [], params: [Type.I64], results: [Type.I64] },
    { name: "i64.popcnt", code: [0x7B], immediateTypes: [], params: [Type.I64], results: [Type.I64] },
    { name: "i64.add", code: [0x7C], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.sub", code: [0x7D], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.mul", code: [0x7E], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.div_s", code: [0x7F], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },

    { name: "i64.div_u", code: [0x80], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.rem_s", code: [0x81], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.rem_u", code: [0x82], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.and", code: [0x83], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.or", code: [0x84], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.xor", code: [0x85], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.shl", code: [0x86], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.shr_s", code: [0x87], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.shr_u", code: [0x88], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.rotl", code: [0x89], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "i64.rotr", code: [0x8A], immediateTypes: [], params: [Type.I64, Type.I64], results: [Type.I64] },
    { name: "f32.abs", code: [0x8B], immediateTypes: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.neg", code: [0x8C], immediateTypes: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.ceil", code: [0x8D], immediateTypes: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.floor", code: [0x8E], immediateTypes: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.trunc", code: [0x8F], immediateTypes: [], params: [Type.F32], results: [Type.F32] },

    { name: "f32.nearest", code: [0x90], immediateTypes: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.sqrt", code: [0x91], immediateTypes: [], params: [Type.F32], results: [Type.F32] },
    { name: "f32.add", code: [0x92], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.sub", code: [0x93], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.mul", code: [0x94], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.div", code: [0x95], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.min", code: [0x96], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.max", code: [0x97], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f32.copysign", code: [0x98], immediateTypes: [], params: [Type.F32, Type.F32], results: [Type.F32] },
    { name: "f64.abs", code: [0x99], immediateTypes: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.neg", code: [0x9A], immediateTypes: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.ceil", code: [0x9B], immediateTypes: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.floor", code: [0x9C], immediateTypes: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.trunc", code: [0x9D], immediateTypes: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.nearest", code: [0x9E], immediateTypes: [], params: [Type.F64], results: [Type.F64] },
    { name: "f64.sqrt", code: [0x9F], immediateTypes: [], params: [Type.F64], results: [Type.F64] },

    { name: "f64.add", code: [0xA0], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.sub", code: [0xA1], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.mul", code: [0xA2], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.div", code: [0xA3], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.min", code: [0xA4], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.max", code: [0xA5], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "f64.copysign", code: [0xA6], immediateTypes: [], params: [Type.F64, Type.F64], results: [Type.F64] },
    { name: "i32.wrap_i64", code: [0xA7], immediateTypes: [], params: [Type.I64], results: [Type.I32] },
    { name: "i32.trunc_f32_s", code: [0xA8], immediateTypes: [], params: [Type.F32], results: [Type.I32] },
    { name: "i32.trunc_f32_u", code: [0xA9], immediateTypes: [], params: [Type.F32], results: [Type.I32] },
    { name: "i32.trunc_f64_s", code: [0xAA], immediateTypes: [], params: [Type.F64], results: [Type.I32] },
    { name: "i32.trunc_f64_u", code: [0xAB], immediateTypes: [], params: [Type.F64], results: [Type.I32] },
    { name: "i64.extend_i32_s", code: [0xAC], immediateTypes: [], params: [Type.I32], results: [Type.I64] },
    { name: "i64.extend_i32_u", code: [0xAD], immediateTypes: [], params: [Type.I32], results: [Type.I64] },
    { name: "i64.trunc_f32_s", code: [0xAE], immediateTypes: [], params: [Type.F32], results: [Type.I64] },
    { name: "i64.trunc_f32_u", code: [0xAF], immediateTypes: [], params: [Type.F32], results: [Type.I64] },

    { name: "i64.trunc_f64_s", code: [0xB0], immediateTypes: [], params: [Type.F64], results: [Type.I64] },
    { name: "i64.trunc_f64_u", code: [0xB1], immediateTypes: [], params: [Type.F64], results: [Type.I64] },
    { name: "f32.convert_i32_s", code: [0xB2], immediateTypes: [], params: [Type.I32], results: [Type.F32] },
    { name: "f32.convert_i32_u", code: [0xB3], immediateTypes: [], params: [Type.I32], results: [Type.F32] },
    { name: "f32.convert_i64_s", code: [0xB4], immediateTypes: [], params: [Type.I64], results: [Type.F32] },
    { name: "f32.convert_i64_u", code: [0xB5], immediateTypes: [], params: [Type.I64], results: [Type.F32] },
    { name: "f32.demote_f64", code: [0xB6], immediateTypes: [], params: [Type.F64], results: [Type.F32] },
    { name: "f64.convert_i32_s", code: [0xB7], immediateTypes: [], params: [Type.I32], results: [Type.F64] },
    { name: "f64.convert_i32_u", code: [0xB8], immediateTypes: [], params: [Type.I32], results: [Type.F64] },
    { name: "f64.convert_i64_s", code: [0xB9], immediateTypes: [], params: [Type.I64], results: [Type.F64] },
    { name: "f64.convert_i64_u", code: [0xBA], immediateTypes: [], params: [Type.I64], results: [Type.F64] },
    { name: "f64.promote_f32", code: [0xBB], immediateTypes: [], params: [Type.F32], results: [Type.F64] },
    { name: "i32.reinterpret_f32", code: [0xBC], immediateTypes: [], params: [Type.F32], results: [Type.I32] },
    { name: "i64.reinterpret_f64", code: [0xBD], immediateTypes: [], params: [Type.F64], results: [Type.I64] },
    { name: "f32.reinterpret_i32", code: [0xBE], immediateTypes: [], params: [Type.I32], results: [Type.F32] },
    { name: "f64.reinterpret_i64", code: [0xBF], immediateTypes: [], params: [Type.I64], results: [Type.F64] },

    { name: "i32.extend8_s", code: [0xC0], immediateTypes: [], params: [Type.I32], results: [Type.I32] },
    { name: "i32.extend16_s", code: [0xC1], immediateTypes: [], params: [Type.I32], results: [Type.I32] },
    { name: "i64.extend8_s", code: [0xC2], immediateTypes: [], params: [Type.I64], results: [Type.I64] },
    { name: "i64.extend16_s", code: [0xC3], immediateTypes: [], params: [Type.I64], results: [Type.I64] },
    { name: "i64.extend32_s", code: [0xC4], immediateTypes: [], params: [Type.I64], results: [Type.I64] },

    { name: "i32.trunc_sat_f32_s", code: [0xfc, 0x00], immediateTypes: [], params: [Type.F32], results: [Type.I32] },
    { name: "i32.trunc_sat_f32_u", code: [0xfc, 0x01], immediateTypes: [], params: [Type.F32], results: [Type.I32] },
    { name: "i32.trunc_sat_f64_s", code: [0xfc, 0x02], immediateTypes: [], params: [Type.F64], results: [Type.I32] },
    { name: "i32.trunc_sat_f64_u", code: [0xfc, 0x03], immediateTypes: [], params: [Type.F64], results: [Type.I32] },
    { name: "i64.trunc_sat_f32_s", code: [0xfc, 0x04], immediateTypes: [], params: [Type.F32], results: [Type.I64] },
    { name: "i64.trunc_sat_f32_u", code: [0xfc, 0x05], immediateTypes: [], params: [Type.F32], results: [Type.I64] },
    { name: "i64.trunc_sat_f64_s", code: [0xfc, 0x06], immediateTypes: [], params: [Type.F64], results: [Type.I64] },
    { name: "i64.trunc_sat_f64_u", code: [0xfc, 0x07], immediateTypes: [], params: [Type.F64], results: [Type.I64] },
]);

/**
 * 所有指令的指点
 */
export const instructionSet = instructions.reduce((res, it) => {
    res[it.name] = it;
    return res;
}, {} as Record<string, InstructionOption>);

/**
 * 指令
 */
export class Instruction {
    /**
     * 指令名称
     */
    get name() {
        return this.instrOption.name;
    }

    /**
     * @param instrOption 指令配置项
     * @param immediates 指令的立即数
     */
    constructor(
        readonly instrOption: InstructionOption,
        public immediates: any[]
    ) { }

    /**
     * 检查指令类型是否和栈匹配，否则抛出异常
     * @param opt 检查配置项
     */
    check(opt: Omit<CheckOption, "immediates">) {
        if ("check" in this.instrOption) {
            this.instrOption.check({
                ...opt,
                immediates: this.immediates
            });
        } else {
            opt.stack.checkStackTop(this.instrOption.params);
            opt.stack.push(...this.instrOption.results);
        }
    }

    /**
     * 索引型立即数转换为缓存
     * @param opt 序列化配置项
     */
    private immediateIndexesToBuffer(opt: ToBufferOption) {
        let buffers: ArrayBuffer[] = [];
        let immTypes = this.instrOption.immediateTypes;
        let indexTypes = this.instrOption.immediateIndexTypes ?? [];
        for (let i = 0; i < indexTypes.length; i++) {
            let immType = immTypes[i];
            let idxType = indexTypes[i];
            let imm = this.immediates[i];

            if (immType === ImmediateType.IndexArray) {
                let buf = encodeArray(imm as Index[], it => this.indexToBuffer(idxType, opt, it));
                buffers.push(buf);
            } else {
                let buf = this.indexToBuffer(idxType, opt, imm);
                buffers.push(buf);
            }
        }
        return combin(buffers);
    }

    /**
     * 索引转化为缓存
     * @param type 索引类型
     * @param opt 序列化配置项
     * @param index 索引
     */
    private indexToBuffer(type: IndexType, opt: ToBufferOption, index: Index): ArrayBuffer {
        if (type === IndexType.Label) {
            let num = opt.block.findLabelIndex(index);
            return encodeInt(num);
        } else if (type === IndexType.Local) {
            let num = opt.func.findLocalIndex(index);
            return encodeInt(num);
        } else {
            let num = opt.env.findIndex(type, index)!;
            return encodeInt(num);
        }
    }

    /**
     * 普通立即数转换为缓存
     */
    private normalImmediatesToBuffer() {
        let map: any = {
            [ImmediateType.I32]: encodeInt,
            [ImmediateType.I64]: encodeInt,
            [ImmediateType.F32]: encodeF32,
            [ImmediateType.F64]: encodeF64,
            [ImmediateType.V128]: () => { throw new Error("todo") },
        }

        let buffers: ArrayBuffer[] = [];
        let immTypes = this.instrOption.immediateTypes;
        for (let i = 0; i < immTypes.length; i++) {
            let type = immTypes[i];
            let imm = this.immediates[i];
            let fn = map[type];
            if (!fn) throw new Error(`${this.name}: 立即数转换二进制出错`);
            let res = fn(imm);
            buffers.push(res);
        }
        return combin(buffers);
    }

    /**
     * 转换为缓存
     * @param opt 序列化配置项
     */
    toBuffer(opt: ToBufferOption): ArrayBuffer {
        let isIndex = this.instrOption.immediateIndexTypes?.length;
        let code = this.instrOption.code;
        let imms = isIndex ?
            this.immediateIndexesToBuffer(opt) :
            this.normalImmediatesToBuffer();
        return combin([code, imms]);
    }

    /**
     * 转换为wat字符串
     * @param option 格式化配置
     */
    toString(option: Required<FormatOption>): string {
        let imms: (Index | any)[] = [];
        for (let i = 0; i < this.immediates.length; i++) {
            let imm = this.immediates[i];
            let immType = this.instrOption.immediateTypes[i];

            switch (immType) {
                case ImmediateType.I32:
                case ImmediateType.I64:
                case ImmediateType.F32:
                case ImmediateType.F64:
                case ImmediateType.Index:
                    imm = typeof imm === "string" ? `$${imm}` : imm;
                    imms.push(imm);
                    break;
                case ImmediateType.IndexArray:
                    imm = imm.map((it: Index) => typeof it === "string" ? `$${it}` : it).join(" ");
                    imms.push(imm);
                    break;
                case ImmediateType.V128:
                    throw new Error("todo");
                    break;
                case ImmediateType.BlockType:
                    throw new Error("库代码有误");
            }
        }
        return flatInstr(this.instrOption.name, ...imms);
    }

    /**
     * 将指令中的索引型立即数转换为名称
     * @param env 环境上下文
     * @param block 块的代理
     * @param func 函数
     */
    setImmediateIndexToName(env: Env, block: BlockProxy, func: Func) {
        let indexTypes = this.instrOption.immediateIndexTypes;
        if (indexTypes?.length) {
            let map = {
                [IndexType.Function]: (imm: Index) => env.findFunctionName(imm),
                [IndexType.Table]: (imm: Index) => env.findTableName(imm),
                [IndexType.Memory]: (imm: Index) => env.findMemoryName(imm),
                [IndexType.Global]: (imm: Index) => env.findGlobalName(imm),
                [IndexType.Type]: (imm: Index) => env.findTypeName(imm),
                [IndexType.Label]: (imm: Index) => block.findlabelName(imm),
                [IndexType.Local]: (imm: Index) => func.findLocalName(imm),
            }

            let newImms: any[] = [];
            for (let i = 0; i < indexTypes.length; i++) {
                let imm = this.immediates[i];
                let idxType = indexTypes[i];
                let fn = map[idxType];

                let immType = this.instrOption.immediateTypes[i];
                if (immType === ImmediateType.IndexArray) {
                    let names = (imm as Index[]).map(it => fn(it));
                    newImms.push(names);
                } else {
                    let name = fn(imm);
                    newImms.push(name);
                }
            }
            this.immediates = newImms;
        }
    }

    /**
     * 获取块的签名
     */
    getBlockTypes(): TypeOption[] {
        return [];
    }
}

/**
 * 块类型指令
 */
export abstract class BlockInstruction extends Instruction {

    /**
     * 获取块类型的wat字符串
     */
    protected getTypeString(): string {
        let type = this.type;
        let params = type.params?.length ? flatItem("param", ...type.params.map(it => typeToString(it))) : "";
        let results = type.results?.length ? flatItem("result", ...type.results.map(it => typeToString(it))) : "";
        return flatInstr(params, results);
    }

    /**
     * 检查代码
     * @param opt 检查配置项
     * @param type 块类型
     * @param codes 代码
     */
    protected checkCode(opt: Omit<CheckOption, "immediates">, type: TypeOption, codes: Instruction[]) {
        let stack = new Stack(type.params);
        for (let code of codes) {
            code.check({
                ...opt,
                stack,
                block: opt.block.createSubBlock(this)
            });
        }
        let results = type.results ?? [];
        if (stack.length !== results.length) throw new Error("出参不匹配");
        stack.checkStackTop(results, false);
    }

    protected getTypeImmediate(env: Env) {
        for (let it of blockTypeMap) {
            let isThisType = isSameType(this.type, it.option);
            if (isThisType) return it.type;
        }

        let typeIndex = env.types.findIndex(it => isSameType(this.type, it));
        return typeIndex;
    }

    protected isBaseBlockType() {
        for (let it of blockTypeMap) {
            let isThisType = isSameType(this.type, it.option);
            if (isThisType) return true;
        }
        return false;
    }

    /**
     * 块的标签
     */
    abstract get label(): string | undefined;

    /**
     * 块的签名类型
     */
    abstract get type(): TypeOption;

    /**
     * 获取块内的所有标签名称
     */
    abstract getLables(): (string | undefined)[];

    abstract toString(option: Required<FormatOption>): string;
    abstract setImmediateIndexToName(env: Env, block: BlockProxy, func: Func): void;
    abstract getBlockTypes(): TypeOption[];
}

/**
 * 一般块级指令
 */
export abstract class NormalBlockInstruction extends BlockInstruction {
    /**
     * 
     */
    static instrOption = instructionSet["block"];

    /**
     * @param blockOption 块类型配置项
     */
    constructor(private blockOption: BlockOption) {
        super(NormalBlockInstruction.instrOption, [blockOption.type]);
    }

    get label() {
        return this.blockOption.label;
    }

    get type() {
        return this.blockOption.type ?? {};
    }

    /**
     * 检查指令类型是否和栈匹配，否则抛出异常
     * @param opt 检查配置项
     */
    check(opt: Omit<CheckOption, "immediates">) {
        let type = this.type;

        opt.stack.checkStackTop(type.params ?? []);

        this.checkCode(opt, type, this.blockOption.codes || []);

        opt.stack.push(...type.results ?? []);
    }

    toBuffer(opt: ToBufferOption): ArrayBuffer {
        opt = {
            ...opt,
            block: opt.block.createSubBlock(this)
        };
        let type = this.getTypeImmediate(opt.env);
        return combin([
            this.instrOption.code,
            encodeInt(type),
            ...(this.blockOption.codes ?? []).map(it => it.toBuffer(opt)),
            instructionSet["end"].code
        ]);
    }

    getLables(): (string | undefined)[] {
        let res: (string | undefined)[] = [];

        res.push(this.blockOption.label);

        let blockInstrs = (this.blockOption.codes ?? []).filter(it => it instanceof BlockInstruction) as BlockInstruction[];
        for (let it of blockInstrs) {
            res.push(...it.getLables());
        }

        return res;
    }

    toString(option: Required<FormatOption>): string {
        return expandInstr({
            option,
            header: [
                this.instrOption.name,
                itemName(this.blockOption.label),
                this.getTypeString(),
            ],
            body: this.blockOption.codes?.map(it => it.toString(option)) ?? [],
            end: "end"
        })
    }

    setImmediateIndexToName(env: Env, block: BlockProxy, func: Func) {
        for (let code of this.blockOption.codes ?? []) {
            block = block.createSubBlock(this);
            code.setImmediateIndexToName(env, block, func);
        }
    }

    getBlockTypes(): TypeOption[] {
        let type = this.isBaseBlockType() ? [] : [this.type];
        let subBlockTypes = (this.blockOption.codes ?? []).flatMap(it => it.getBlockTypes());
        return [
            ...type,
            ...subBlockTypes
        ]
    }
}

/**
 * Block指令
 */
export class Block extends NormalBlockInstruction {
    static instrOption = instructionSet["block"];
}

/**
 * Loop指令
 */
export class LoopBlock extends NormalBlockInstruction {
    static instrOption = instructionSet["loop"];
}

/**
 * If指令
 */
export class IfBlock extends BlockInstruction {

    get label() {
        return this.blockOption.label;
    }

    get type() {
        return this.blockOption.type ?? {};
    }

    /**
     * @param blockOption if块的配置项
     */
    constructor(private blockOption: IfOption) {
        super(instructionSet["if"], [blockOption.type]);
    }

    check(opt: Omit<CheckOption, "immediates">) {
        let type = this.type;

        let top = opt.stack.pop();
        if (!top) throw new Error(`空栈`);
        if (top !== Type.I32) throw new Error(`top0 参数的类型应该为 I32`);

        opt.stack.checkStackTop(type.params ?? []);

        this.checkCode(opt, type, this.blockOption.then || []);
        this.checkCode(opt, type, this.blockOption.else || []);

        opt.stack.push(...type.results ?? []);
    }

    toBuffer(opt: ToBufferOption): ArrayBuffer {
        opt = {
            ...opt,
            block: opt.block.createSubBlock(this)
        };

        let type = this.getTypeImmediate(opt.env);
        if (this.blockOption.else) {
            return combin([
                this.instrOption.code,
                encodeInt(type),
                ...(this.blockOption.then ?? []).map(it => it.toBuffer(opt)),
                instructionSet["else"].code,
                ...(this.blockOption.else ?? []).map(it => it.toBuffer(opt)),
                instructionSet["end"].code
            ]);
        } else {
            return combin([
                this.instrOption.code,
                encodeInt(type),
                ...(this.blockOption.then ?? []).map(it => it.toBuffer(opt)),
                instructionSet["end"].code
            ]);
        }
    }

    getLables(): (string | undefined)[] {
        let res: (string | undefined)[] = [];

        res.push(this.blockOption.label);

        let thenBlockInstrs = (this.blockOption.then ?? []).filter(it => it instanceof BlockInstruction) as BlockInstruction[];
        for (let it of thenBlockInstrs) {
            res.push(...it.getLables());
        }

        let elseBlockInstrs = (this.blockOption.then ?? []).filter(it => it instanceof BlockInstruction) as BlockInstruction[];
        for (let it of elseBlockInstrs) {
            res.push(...it.getLables());
        }

        return res;
    }

    toString(option: Required<FormatOption>): string {
        let header = [
            this.instrOption.name,
            itemName(this.blockOption.label),
            this.getTypeString(),
        ];

        let thenContent = this.blockOption.then?.map(it => it.toString(option)) ?? [];
        let elseContent = this.blockOption.else?.map(it => it.toString(option)) ?? [];

        if (elseContent.length) {
            let thenPart = expandInstr({
                option,
                header,
                body: thenContent,
                end: "else"
            })

            let elsePart = expandInstr({
                option,
                header: [],
                body: thenContent,
                end: "end"
            })

            return thenPart + elsePart;
        } else {
            return expandInstr({
                option,
                header,
                body: thenContent,
                end: "end"
            })
        }
    }

    setImmediateIndexToName(env: Env, block: BlockProxy, func: Func) {
        block = block.createSubBlock(this);

        for (let code of this.blockOption.then ?? []) {
            code.setImmediateIndexToName(env, block, func);
        }
        for (let code of this.blockOption.else ?? []) {
            code.setImmediateIndexToName(env, block, func);
        }
    }

    getBlockTypes(): TypeOption[] {
        let type = this.isBaseBlockType() ? [] : [this.type];
        let thenBlockTypes = (this.blockOption.then ?? []).flatMap(it => it.getBlockTypes());
        let elseBlockTypes = (this.blockOption.else ?? []).flatMap(it => it.getBlockTypes());
        return [
            ...type,
            ...thenBlockTypes,
            ...elseBlockTypes,
        ]
    }
}

/**
 * 块用于检查时候的代理
 */
export class BlockProxy {

    /**
     * 通过索引，查找标签名称
     * @param idx 
     */
    findlabelName(idx: Index): Index {
        if (typeof idx === "string") {
            return idx;
        } else {
            let block = this.getBlockByIndex(idx);
            if (block?.instr instanceof BlockInstruction) {
                return block.instr.label ?? idx;
            } else {
                return idx;
            }
        }
    }

    /**
     * 通过索引，查找BlockProxy
     * @param idx 索引
     * @param currentIndex 开始的索引
     */
    private getBlockByIndex(idx: U32, currentIndex = 0): BlockProxy | undefined {
        if (idx === currentIndex) return this;
        return this.parent?.getBlockByIndex(idx, currentIndex + 1);
    }

    /**
     * 父级块的代理
     */
    private parent?: BlockProxy;

    /**
     * @param instr 块指令或者是函数
     */
    constructor(private instr: BlockInstruction | Func) { }

    /**
     * 新增子块的代理
     * @param instr 块指令
     */
    createSubBlock(instr: BlockInstruction) {
        let res = new BlockProxy(instr);
        res.parent = this;
        return res;
    }

    /**
     * 获取当前块的签名类型
     */
    getType(): TypeOption {
        if (this.instr instanceof BlockInstruction) {
            return this.instr.type;
        } else {
            return this.instr.getType();
        }
    }

    /**
     * 验证label是否合法
     * @param labelIndex label的索引或者是名称
     */
    validateLabel(labelIndex: Index): boolean {
        if (typeof labelIndex === "string") {
            return this.validateName(labelIndex);
        } else {
            return this.validateIndex(labelIndex);
        }
    }

    /**
     * 返回label对应的索引
     * @param labelIndex label的索引或者是名称
     */
    findLabelIndex(labelIndex: Index): number {
        if (typeof labelIndex === "string") {
            return this.findLabelIndexByName(labelIndex)!;
        } else {
            return labelIndex;
        }
    }

    private findLabelIndexByName(name: string, currentIndex = 0): number | undefined {
        if (this.instr instanceof BlockInstruction && this.instr.label === name) return currentIndex;
        if (this.parent) {
            return this.parent.findLabelIndexByName(name, currentIndex + 1);
        }
    }

    /**
     * 验证索引是否合法
     * @param index 索引
     * @param currentIndex 当前层级的索引名称
     */
    private validateIndex(index: number, currentIndex = 0): boolean {
        if (index === currentIndex) return true;
        if (this.parent) {
            return this.parent.validateIndex(index, currentIndex + 1);
        } else {
            return false;
        }
    }

    /**
     * 验证名称是否合法
     * @param name 名称
     */
    private validateName(name: string): boolean {
        if (this.instr instanceof BlockInstruction && this.instr.label === name) return true;
        if (this.parent) {
            return this.parent.validateName(name);
        } else {
            return false;
        }
    }
}

/**
 * 判断 buffer 在 offset 处是否以 otherBuffer 开头
 * @param buffer 缓存
 * @param offset 偏移
 * @param otherBuffer 另一个缓存
 */
function isStartWith(buffer: Uint8Array, offset: Offset, otherBuffer: ArrayBuffer) {
    let ob = new Uint8Array(otherBuffer);
    for (let i = 0; i < ob.length; i++) {
        if (buffer[offset.value + i] !== ob[i]) return false;
    }
    return true;
}


/**
 * 立即数类型 -> 编码方式
 */
let map = {
    [ImmediateType.I32]: decodeUint,
    [ImmediateType.I64]: decodeUint,
    [ImmediateType.F32]: decodeF32,
    [ImmediateType.F64]: decodeF64,
    [ImmediateType.V128]: () => { throw new Error("todo") },
    [ImmediateType.BlockType]: decodeSint,
    [ImmediateType.IndexArray]: (buffer: ArrayBuffer, offset: Offset) => decodeArray(buffer, offset, decodeUint),
    [ImmediateType.Index]: decodeUint,
}

/**
 * 块指令名称 -> 块指令构造函数
 */
let blockMap: Record<string, new (opt: any) => BlockInstruction> = {
    "block": Block,
    "loop": LoopBlock,
    "if": IfBlock,
}

/**
 * 从缓存中生成对应的指令
 * @param buffer 缓存
 * @param labelNames 标签名
 * @param typeOptions 所有类型
 */
export function bufferToInstr(buffer: ArrayBuffer, labelNames: NameMap[] = [], typeOptions: TypeOption[] = []): Instruction[] {
    let view = new Uint8Array(buffer);
    let instrs: Instruction[] = [];
    let offset = { value: 0 };
    while (offset.value < view.byteLength) {
        let instrOpt = instructions.find(it => isStartWith(view, offset, it.code));
        if (!instrOpt) throw new Error(`未知指令 0x${offset.value.toString(16)}: 0x${view[offset.value].toString(16)} 0x${view[offset.value].toString(16)}`);
        offset.value += instrOpt.code.byteLength;

        let imms: any[] = [];
        for (let immType of instrOpt.immediateTypes) {
            let fn = map[immType];
            let imm = fn(buffer, offset);
            imms.push(imm);
        }

        let instr = new Instruction(instrOpt, imms);
        instrs.push(instr);
    }

    let stack: { block?: Instruction, blockIndex?: number, codes: Instruction[] }[] = [{ codes: [] }];

    let blockIndex = 0;
    for (let instr of instrs) {
        let isBlock = ["block", "loop", "if"].includes(instr.name);
        let isEnd = instr.name === "end";

        if (isBlock) {
            stack.push({ block: instr, blockIndex: blockIndex++, codes: [] });
        } else if (isEnd) {
            let { block, blockIndex, codes } = stack.pop()!;
            if (!block) return codes;

            let label = labelNames.find(it => it.index === blockIndex)?.name;

            let blockType = block.immediates[0];
            let type = typeOptions[blockType] ?? blockTypeMap.find(it => it.type === blockType)?.option;

            let fn = blockMap[block.name];
            let instr: BlockInstruction;
            if (block.name === "if") {
                let elseIndex = codes.findIndex(it => it.name === "else");
                let thenCodes: Instruction[];
                let elseCodes: Instruction[];

                if (elseIndex === -1) {
                    thenCodes = codes;
                    elseCodes = [];
                } else {
                    thenCodes = codes.slice(0, elseIndex);
                    elseCodes = codes.slice(elseIndex + 1);
                }

                instr = new IfBlock({ label, type, then: thenCodes, else: elseCodes });
            } else {
                instr = new fn({ label, type, codes });
            }
            let top = stack[stack.length - 1];
            top.codes.push(instr);
        } else {
            let top = stack[stack.length - 1];
            top.codes.push(instr);
        }
    }

    throw new Error("库代码有误");
}