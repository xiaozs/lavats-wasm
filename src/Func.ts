import { combin } from './encode';
import { Env } from "./Env";
import { BlockInstruction, BlockProxy, instructionSet } from './Instruction';
import { Stack } from "./Stack";
import { FormatOption, FunctionOption, Index, ToBufferOption, Type, TypeOption, U32 } from './Type';
import { expandItem, flatItem, itemName, typeToString } from './utils';

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
        let results = type.results ?? [];
        if (stack.length !== results.length) throw new Error("出参不匹配");
        stack.checkStackTop(results, false);
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

    /**
     * 获取局部变量的类型和个数
     */
    getLocalTypesAndCount(): LocalGroup[] {
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

    /**
     * 通过名称，查找局部变量的索引
     * @param localIndex 名称
     */
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

    /**
     * 获取所有标签名称
     */
    getLables(): (string | undefined)[] {
        let res: (string | undefined)[] = [];

        let blockInstrs = (this.options.codes ?? []).filter(it => it instanceof BlockInstruction) as BlockInstruction[];
        for (let it of blockInstrs) {
            res.push(...it.getLables());
        }

        return res;
    }

    /**
     * 转换为缓存
     * @param env 环境上下文
     */
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

    /**
     * 转换为wat字符串
     * @param option 格式化配置
     */
    toString(option: Required<FormatOption>): string {
        let params = this.options.params?.map(it => typeof it === "object" ?
            flatItem("param", itemName(it.name), typeToString(it.type)) :
            flatItem("param", typeToString(it))
        ) ?? [];

        let types = this.options.results?.map(typeToString) ?? [];
        let results = types.length ? flatItem("result", ...types) : "";

        let locals = this.options.locals?.map(it => typeof it === "object" ?
            flatItem("local", itemName(it.name), typeToString(it.type)) :
            flatItem("local", typeToString(it))
        ) ?? [];

        let codes = this.options.codes?.map(it => it.toString(option)) ?? [];

        return expandItem({
            option,
            header: [
                "func",
                itemName(this.name),
                ...params,
                results,
                ...locals,
            ],
            body: codes
        })
    }

    /**
     * 将指令中的索引立即数转换成为名称
     * @param env 环境上下文
     */
    setImmediateIndexToName(env: Env) {
        for (let code of this.options.codes ?? []) {
            let block = new BlockProxy(this);
            code.setImmediateIndexToName(env, block, this);
        }
    }

    /**
     * 通过索引，查找局部变量名称
     * @param idx 索引
     */
    findLocalName(idx: Index): Index {
        if (typeof idx === "string") {
            return idx;
        } else {
            let params = this.options.params || [];
            let locals = this.options.locals || [];
            let vals = [...params, ...locals];

            let names = vals.map(it => {
                if (typeof it === "object") {
                    return it.name;
                } else {
                    return undefined;
                }
            });

            return names[idx] ?? idx;
        }
    }

    /**
     * 获取所有块指令的签名
     */
    getBlockTypes() {
        return this.options.codes?.flatMap(it => it.getBlockTypes()) ?? [];
    }
}
