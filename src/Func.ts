import { BlockProxy, BlockInstruction, instructionSet } from './Instruction';
import { Stack } from "./Stack";
import { FunctionOption, Index, ToBufferOption, Type, TypeOption, U32 } from './Type';
import { Env } from "./Env";
import { combin } from './encode';

export interface LocalGroup {
    type: Type;
    count: U32;
}

/**
 * 函数
 */
export class Func {
    /**
     * 函数名称
     */
    get name() {
        return this.options.name;
    }
    set name(val) {
        this.options.name = val;
    }

    /**
     * @param options 函数配置
     */
    constructor(readonly options: FunctionOption) { }

    /**
     * 检查函数中的局部名称是否冲突
     */
    private checkNames() {
        let map: Record<string, number> = {};

        let params = this.options.params || [];
        let locals = this.options.locals || [];
        let vals = [...params, ...locals];

        for (let val of vals) {
            if (typeof val !== "object")
                continue;
            let name = val.name;
            let count = map[name] = (map[name] ?? 0) + 1;
            if (count >= 2)
                throw new Error(`local ${name}: 命名冲突`);
        }
    }

    /**
     * 检查函数是否合法，非法时抛出异常
     * @param env 环境上下文对象
     */
    check(env: Env) {
        this.checkNames();

        let type = this.getType();
        let stack = new Stack();
        let codes = this.options.codes || [];
        let block = new BlockProxy(this);
        for (let code of codes) {
            code.check({
                env,
                stack,
                func: this,
                block
            });
        }
        if (stack.length !== type.results.length) throw new Error("出参不匹配");
        stack.checkStackTop(type.results, false);
    }

    /**
     * 获取函数的签名类型
     */
    getType(): TypeOption {
        let { name, params = [], results = [] } = this.options;
        let res: Type[] = [];
        for (let p of params) {
            if (typeof p === "object") {
                res.push(p.type);
            } else {
                res.push(p);
            }
        }
        return { name, params: res, results };
    }

    getLocalTypes(): LocalGroup[] {
        let res: LocalGroup[] = [];
        let currentGroup: LocalGroup | undefined;
        for (let local of this.options.locals ?? []) {
            let type = typeof local === "object" ? local.type : local;
            if (currentGroup?.type !== type) {
                currentGroup = {
                    type,
                    count: 1,
                }
                res.push(currentGroup);
            } else {
                currentGroup.count++;
            }
        }
        return res;
    }

    findLocalIndex(localIndex: Index): number {
        if (typeof localIndex === "string") {
            let params = this.options.params || [];
            let locals = this.options.locals || [];
            let vals = [...params, ...locals];
            return vals.findIndex(it => typeof it === "object" && it.name === localIndex);
        } else {
            return localIndex;
        }
    }

    /**
     * 获取局部变量类型
     * @param index 索引，或者是名称
     */
    getLocalType(index: Index): Type | undefined {
        let map: Record<string, Type> = {};
        let arr: Type[] = [];

        let params = this.options.params || [];
        let locals = this.options.locals || [];
        let vals = [...params, ...locals];

        for (let val of vals) {
            if (typeof val === "object") {
                map[val.name] = val.type;
                arr.push(val.type);
            } else {
                arr.push(val);
            }
        }

        if (typeof index === "string") {
            return map[index];
        } else {
            return arr[index];
        }
    }

    getLables(): (string | undefined)[] {
        let res: (string | undefined)[] = [];

        let blockInstrs = (this.options.codes ?? []).filter(it => it instanceof BlockInstruction) as BlockInstruction[];
        for (let it of blockInstrs) {
            res.push(...it.getLables());
        }

        return res;
    }

    toBuffer(env: Env): ArrayBuffer {
        let opt: ToBufferOption = {
            env,
            func: this,
            block: new BlockProxy(this),
        }

        let res: ArrayBuffer[] = [];
        for (let code of this.options.codes ?? []) {
            let buf = code.toBuffer(opt);
            res.push(buf);
        }
        res.push(instructionSet["end"].code);
        return combin(res);
    }
}
