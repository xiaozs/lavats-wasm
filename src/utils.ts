import { decodeArray, decodeF32, decodeF64, decodeSint, decodeUint, Offset, Writer } from "./encode";
import { Block, BlockInstruction, IfBlock, Instruction, instructions, LoopBlock } from './Instruction';
import { NameMap } from './Section';
import { ImmediateType, TypeOption } from './Type';

/**
 * 计算编码数值的长度
 * @param num 编码数值
 */
function getBtyeLength(num: number): number {
    if (num < 0) {
        num = ~num + 1;
    }

    let byteLength = 1;
    while (true) {
        let isEnd = num >> (7 * byteLength) === 0;
        if (isEnd) {
            return byteLength;
        } else {
            byteLength++;
        }
    }
}

/**
 * 对数值进行leb128编码
 * @param num 编码数值
 */
export function encodeInt(num: number): ArrayBuffer {
    let byteLength = getBtyeLength(num);
    let res = new Uint8Array(byteLength);

    for (let i = 0; i < byteLength; i++) {
        let u8 = num >> (7 * i);
        u8 &= 0b0111_1111;
        u8 |= 0b1000_0000;

        let isEnd = i === byteLength - 1;
        if (isEnd) {
            u8 &= ~0b1000_0000;
        }
        res[i] = u8;
    }

    return res.buffer;
}

/**
 * 判断两个类型之间的关系
 * @param subClass 子类型
 * @param baseClass 父类型
 */
export function isExtends(subClass: Function, baseClass: Function) {
    let current = subClass;
    do {
        if (current === baseClass) return true;
    } while (current = current.prototype.__proto__?.constructor);
    return false;
}

export function combin(buffers: ArrayBuffer[]) {
    let total = buffers.reduce((res, it) => res + it.byteLength, 0);
    let res = new Uint8Array(total);
    let i = 0;
    for (let buf of buffers) {
        buf = ArrayBuffer.isView(buf) ? buf.buffer : buf;
        let b = new Uint8Array(buf);
        for (let val of b) {
            res[i++] = val;
        }
    }
    return res.buffer;
}

export function encodeF32(num: number): ArrayBuffer {
    return new Float32Array([num]).buffer;
}

export function encodeF64(num: number): ArrayBuffer {
    return new Float64Array([num]).buffer;
}

export function encodeArray<T>(arr: T[], writer: Writer<T>): ArrayBuffer {
    let size = encodeInt(arr.length);
    let buffers: ArrayBuffer[] = [size];
    for (let it of arr) {
        let buf = writer(it);
        buffers.push(buf);
    }
    return combin(buffers);
}

function isStartWith(buffer: Uint8Array, offset: Offset, otherBuffer: ArrayBuffer) {
    let ob = new Uint8Array(otherBuffer);
    for (let i = 0; i < ob.length; i++) {
        if (buffer[offset.value + i] !== ob[i]) return false;
    }
    return true;
}

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

let blockMap: Record<string, new (opt: any) => BlockInstruction> = {
    "block": Block,
    "loop": LoopBlock,
    "if": IfBlock,
}

export function bufferToInstr(buffer: ArrayBuffer, labelNames: NameMap[] = [], typeOptions: TypeOption[] = []): Instruction[] {
    let view = new Uint8Array(buffer);
    let instrs: Instruction[] = [];
    let offset = { value: 0 };
    while (offset.value < view.byteLength) {
        for (let opt of instructions) {
            let isThisInstr = isStartWith(view, offset, opt.code);
            if (!isThisInstr) continue;
            offset.value += opt.code.byteLength;

            let imms: any[] = [];
            for (let immType of opt.immediates) {
                let fn = map[immType];
                let imm = fn(buffer, offset);
                imms.push(imm);
            }
            let instr = new Instruction(opt, imms);
            instrs.push(instr);
            break;
        }
    }

    let stack: { block?: Instruction, blockIndex?: number, codes: Instruction[] }[] = [{ codes: [] }];

    let blockIndex = 0;
    for (let instr of instrs) {
        let isBlock = ["block", "loop", "if"].includes(instr.name);
        let isEnd = instr.name === "end";

        if (isBlock) {
            stack.push({ block: instr, blockIndex: blockIndex++, codes: [] });
        }
        if (isEnd) {
            let { block, blockIndex, codes } = stack.pop()!;
            if (!block) return codes;

            let label = labelNames.find(it => it.index === blockIndex)?.name;

            let blockType = block.immediates[0];
            let type = typeOptions[blockType]?.name ?? blockType;

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
                    thenCodes = codes.splice(0, elseIndex);
                    elseCodes = codes.splice(elseIndex + 1);
                }

                instr = new IfBlock({ label, type, then: thenCodes, else: elseCodes });
            } else {
                instr = new fn({ label, type, codes });
            }
            let top = stack[stack.length - 1];
            top.codes.push(instr);
        }
    }

    throw new Error("库代码有误");
}