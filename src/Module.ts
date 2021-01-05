import { Env } from './Env';
import { ImportExportType, isF32, isF64, isI32, isI64, isU32, LimitOption, ModuleOption, Type, U32 } from './Type';
import { InnerModule } from "./InnerModule";

/**
 * 获取模块默认配置的函数
 */
function getDefaultOption(): Readonly<ModuleOption> {
    return {
        name: undefined,
        memory: [],
        data: [],
        table: [],
        element: [],
        import: [],
        export: [],
        type: [],
        global: [],
        function: [],
        start: undefined
    }
}

/**
 * 模块
 */
export class Module {
    /**
     * 模块的配置
     */
    private option: ModuleOption;

    /**
     * @param option 模块的配置
     */
    constructor(option: Partial<ModuleOption>) {
        this.option = Object.assign(getDefaultOption(), option);
    }

    /**
     * 验证模块是否合法，返回布尔值
     */
    validate(): boolean {
        try {
            this.check();
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 验证模块是否合法，非法时抛出异常
     */
    check() {
        this.checkNames();
        this.checkImport();
        this.checkTable();
        this.checkMemory();
        this.checkGlobal();

        let env = new Env(this.option);
        this.checkExport(env);
        this.checkStart(env);
        this.checkElement(env);
        this.checkFunction(env);
        this.checkData(env);
    }

    /**
     * 检查Limit配置项的辅助方法
     * @param param0 Limit配置
     */
    private checkLimit({ min, max }: LimitOption) {
        if (!isU32(min)) throw new Error("min不是u32");
        if (max !== undefined && !isU32(max)) throw new Error("max不是u32");
        if (max !== undefined && min > max) throw new Error("min > max");
    }

    /**
     * 检查Limit配置项的辅助方法
     * @param type 类型
     */
    private checkLimitOf(type: "table" | "memory") {
        let arr = this.option[type];
        for (let i = 0; i < arr.length; i++) {
            let it = arr[i];
            try {
                this.checkLimit(it);
            } catch (e) {
                throw new Error(`${type} ${i}: ${e.message}`);
            }
        }
    }

    /**
     * 检查命名冲突的方法
     */
    private checkNames() {
        for (let key in this.option) {
            let arr: { name?: string }[] = (this.option as any)[key];

            let isArray = Array.isArray(arr);
            if (!isArray) continue;

            let nameMap: Record<string, number> = {};
            for (let i = 0; i < arr.length; i++) {
                let it = arr[i];
                let name = it.name;
                if (!name) continue;

                let count = nameMap[name] = (nameMap[name] ?? 0) + 1;
                if (count >= 2) throw new Error(`${key} ${name}: 命名冲突`);
            }
        }
    }

    /**
     * 检查导入项的方法
     */
    private checkImport() {
        for (let i = 0; i < this.option.import.length; i++) {
            let it = this.option.import[i];
            switch (it.type) {
                case ImportExportType.Table:
                case ImportExportType.Memory:
                    try {
                        this.checkLimit(it);
                    } catch (e) {
                        throw new Error(`import ${i}: ${e.message}`);
                    }
            }
        }
    }

    /**
     * 检查表格项
     */
    private checkTable() {
        this.checkLimitOf("table");
    }

    /**
     * 检查内存项
     */
    private checkMemory() {
        this.checkLimitOf("memory");
    }

    /**
     * 检查全局变量项
     */
    private checkGlobal() {
        let fnMap = {
            [Type.I32]: isI32,
            [Type.I64]: isI64,
            [Type.F32]: isF32,
            [Type.F64]: isF64,
        }
        for (let i = 0; i < this.option.global.length; i++) {
            let it = this.option.global[i];
            let fn = fnMap[it.valueType];
            let isValidate = fn(it.init);
            if (!isValidate) {
                let type = Type[it.valueType];
                throw new Error(`global ${i}: 类型为${type}, 其值为${it.init}`);
            }
        }
    }

    /**
     * 检查导出项
     * @param env 环境上下文对象
     */
    private checkExport(env: Env) {
        let nameMap: Record<string, U32[]> = {};
        for (let i = 0; i < this.option.export.length; i++) {
            let it = this.option.export[i];
            let indexArr = nameMap[it.exportName] = nameMap[it.exportName] || [];
            indexArr.push(i);
        }

        for (let exportName in nameMap) {
            let indexArr = nameMap[exportName];
            if (indexArr.length < 2) continue;
            throw new Error(`export [${indexArr}]: 名称冲突 ${exportName}`);
        }

        for (let i = 0; i < this.option.export.length; i++) {
            let it = this.option.export[i];
            let obj = env.find(it.type, it.index);
            if (!obj) throw new Error(`export ${i}: 没找到导出对象`)
        }
    }

    /**
     * 检查开始函数
     * @param env 环境上下文对象
     */
    private checkStart(env: Env) {
        let { start } = this.option;
        if (start === undefined) return;
        let obj = env.findFunction(start);
        if (!obj) throw new Error(`start: 没找到func ${start}`)
    }

    /**
     * 检查元素项
     * @param env 环境上下文对象
     */
    private checkElement(env: Env) {
        for (let i = 0; i < this.option.element.length; i++) {
            let it = this.option.element[i];
            let table = env.findTable(it.tableIndex);
            if (!table) throw new Error(`elememt ${i}: 没找到table ${it.tableIndex}`);

            for (let idx of it.functionIndexes) {
                let func = env.findFunction(idx);
                if (!func) throw new Error(`elememt ${i}: 没找到func ${idx}`);
            }
        }
    }

    /**
     * 检查函数项
     * @param env 环境上下文对象
     */
    private checkFunction(env: Env) {
        for (let i = 0; i < this.option.function.length; i++) {
            let func = this.option.function[i];
            func.check(env);
        }
    }

    /**
     * 检查数据项
     * @param env 环境上下文对象
     */
    private checkData(env: Env) {
        for (let i = 0; i < this.option.data.length; i++) {
            let it = this.option.data[i];
            let memory = env.findMemory(it.memoryIndex);
            if (!memory) throw new Error(`data ${i}: 没找到memory ${it.memoryIndex}`);
        }
    }
    toBuffer() {
        this.check();
        let env = new Env(this.option);
        let inner = InnerModule.fromModule(this, env);
        return inner.toBuffer();
    }
    static fromBuffer(buffer: ArrayBuffer) {
        return InnerModule.fromBuffer(buffer);
    }
}

export interface Module extends ModuleOption { }

// 为模块添加各个项目的getter和setter

let keys = Object.keys(getDefaultOption());
let props: any = {};
for (let key of keys) {
    props[key] = {
        get() {
            return this.option[key];
        },
        set(val: any) {
            this.option[key] = val;
        }
    }
}
Object.defineProperties(Module.prototype, props);