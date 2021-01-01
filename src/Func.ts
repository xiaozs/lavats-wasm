import { BlockProxy, BlockInstruction } from './Instruction';
import { Stack } from "./Stack";
import { FunctionOption, Index, Type, TypeOption } from './Type';
import { Env } from "./Env";
import { combin } from './utils';

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

    getLocalTypes(): { count: number, type: Type }[] {
        let res: { count: number, type: Type }[] = [];
        let currentType: Type | undefined;
        let currentCount = 0;
        for (let local of this.options.locals ?? []) {
            let type = typeof local === "object" ? local.type : local;
            if (currentType !== type) {
                currentType && res.push({
                    count: currentCount,
                    type: currentType,
                })

                currentType = type;
                currentCount = 1;
            }
            currentCount++;
        }
        return res;
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

    toBuffer(): ArrayBuffer {
        let res: ArrayBuffer[] = [];
        for (let code of this.options.codes ?? []) {
            let buf = code.toBuffer();
            res.push(buf);
        }
        return combin(res);
    }
}
