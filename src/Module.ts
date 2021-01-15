import { Env } from './Env';
import { FormatOption, ImportExportType, isF32, isF64, isI32, isI64, isU32, LimitOption, ModuleOption, Type, U32 } from './Type';
import { InnerModule } from "./InnerModule";
import { expandItem, flatItem, typeToString, itemName, ImportExportName, bufferToString } from './utils';

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
        start: undefined,
        custom: []
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
        let func = env.findFunction(start);
        if (!func) throw new Error(`start: 没找到func ${start}`)

        if (func.params?.length) throw new Error(`start: func ${start} 不能有入参`);
        if (func.results?.length) throw new Error(`start: func ${start} 不能有返回值`);
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

    /**
     * 转换为缓存
     */
    toBuffer() {
        this.check();
        let env = new Env(this.option);
        let inner = InnerModule.fromModule(this, env);
        return inner.toBuffer();
    }

    /**
     * 通过缓存生成Module
     * @param buffer 缓存
     */
    static fromBuffer(buffer: ArrayBuffer) {
        let innerModule = InnerModule.fromBuffer(buffer);
        return innerModule.toModule();
    }

    /**
     * 转换为wat字符串
     * @param opt 格式化配置
     */
    toString(opt?: FormatOption) {
        this.check();
        let defaultOpt: Required<FormatOption> = {
            indent: 4,
            indentChar: " ",
        };

        let option: Required<FormatOption> = {
            ...defaultOpt,
            ...opt
        }

        return expandItem({
            option,
            header: ["module", itemName(this.name)],
            body: [
                ...this.typeToString(),
                ...this.importToString(),
                ...this.globalToString(),
                ...this.memoryToString(),
                ...this.dataToString(),
                ...this.tableToString(),
                ...this.elementToString(),
                ...this.functionToString(option),
                this.startToString(),
                ...this.exportToString(),
            ]
        })
    }

    /**
     * 转换类型为字符串
     */
    private typeToString(): string[] {
        return this.type.map(it => {
            let params = it.params?.length ? flatItem("param", ...it.params.map(it => typeToString(it))) : "";
            let results = it.results?.length ? flatItem("result", ...it.results.map(it => typeToString(it))) : "";
            let func = flatItem("func", params, results);
            return flatItem("type", itemName(it.name), func);
        })
    }

    /**
     * 转换全局变量为字符串
     */
    private globalToString(): string[] {
        return this.global.map(it => {
            let type = typeToString(it.valueType);
            let t = it.mutable ? `(mut ${type})` : type;
            let init = `(${type}.const ${it.init})`;
            return flatItem("global", itemName(it.name), t, init);
        });
    }

    /**
     * 转换引入为字符串
     */
    private importToString(): string[] {
        return this.import.map(it => {
            let content: string;
            switch (it.type) {
                case ImportExportType.Function: {
                    let params = it.params?.length ? flatItem("param", ...it.params.map(it => typeToString(it))) : "";
                    let results = it.results?.length ? flatItem("result", ...it.results.map(it => typeToString(it))) : "";
                    content = flatItem("func", itemName(it.name), params, results);
                    break;
                }
                case ImportExportType.Table: {
                    content = flatItem("table", itemName(it.name), it.min, it.max, "anyfunc");
                    break;
                }
                case ImportExportType.Memory: {
                    content = flatItem("memory", itemName(it.name), it.min, it.max);
                    break;
                }
                case ImportExportType.Global: {
                    let type = typeToString(it.valueType);
                    let t = it.mutable ? `(mut ${type})` : type;
                    content = flatItem("global", itemName(it.name), t);
                    break;
                }
            }
            return flatItem("import", ImportExportName(it.module), ImportExportName(it.importName), content);
        })
    }

    /**
     * 转换内存为字符串
     */
    private memoryToString(): string[] {
        return this.memory.map(it => flatItem("memory", itemName(it.name), it.min, it.max));
    }

    /**
     * 转换数据为字符串
     */
    private dataToString(): string[] {
        return this.data.map(it => {
            let memory: string;
            if (typeof it.memoryIndex === "object") {
                memory = flatItem("memory", itemName(it.memoryIndex));
            } else if (it.memoryIndex === 0) {
                memory = "";
            } else {
                memory = flatItem("memory", it.memoryIndex);
            }

            let offset = flatItem("i32.const", it.offset);
            let init = bufferToString(it.init);
            return flatItem("data", itemName(it.name), memory, offset, init);
        })
    }

    /**
     * 转换表格为字符串
     */
    private tableToString(): string[] {
        return this.table.map(it => flatItem("table", itemName(it.name), it.min, it.max, "anyfunc"));
    }

    /**
     * 转换元素为字符串
     */
    private elementToString(): string[] {
        return this.element.map(it => {
            let table: string;
            if (typeof it.tableIndex === "object") {
                table = flatItem("table", itemName(it.tableIndex));
            } else if (it.tableIndex === 0) {
                table = "";
            } else {
                table = flatItem("table", it.tableIndex);
            }

            let offset = flatItem("i32.const", it.offset);
            let indexes = it.functionIndexes.map(it => typeof it === "string" ? itemName(it) : it);
            return flatItem("elem", itemName(it.name), table, offset, ...indexes);
        });
    }

    /**
     * 转换函数为字符串
     * @param option 格式化配置
     */
    private functionToString(option: Required<FormatOption>): string[] {
        return this.function.map(it => it.toString(option));
    }

    /**
     * 转换开始为字符串
     */
    private startToString() {
        let start = this.start;
        if (start === undefined) {
            return "";
        } else if (typeof start === "string") {
            return flatItem("start", itemName(start));
        } else {
            return flatItem("start", start);
        }
    }

    /**
     * 转换导出为字符串
     */
    private exportToString(): string[] {
        let map = {
            [ImportExportType.Function]: "func",
            [ImportExportType.Table]: "table",
            [ImportExportType.Memory]: "memory",
            [ImportExportType.Global]: "global"
        }
        return this.export.map(it => {
            let type = map[it.type];
            let index = typeof it.index === "string" ? itemName(it.index) : it.index;
            let content = flatItem(type, index);
            return flatItem("export", ImportExportName(it.exportName), content);
        })
    }

    /**
     * 将指令中的索引立即数转换成为名称
     */
    setImmediateIndexToName() {
        let env = new Env(this);
        for (let func of this.function) {
            func.setImmediateIndexToName(env);
        }
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