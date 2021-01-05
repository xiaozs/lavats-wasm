import { Env } from './Env';
import { FormatOption, ImportExportType, isF32, isF64, isI32, isI64, isU32, LimitOption, ModuleOption, Type, U32 } from './Type';
import { InnerModule } from "./InnerModule";
import { addIndent, typesToString } from './utils';

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
    toBuffer() {
        this.check();
        let env = new Env(this.option);
        let inner = InnerModule.fromModule(this, env);
        return inner.toBuffer();
    }
    static fromBuffer(buffer: ArrayBuffer) {
        return InnerModule.fromBuffer(buffer);
    }

    toString(opt?: FormatOption) {
        this.check();
        let defaultOpt: Required<FormatOption> = {
            indent: 4
        };

        let option: Required<FormatOption> = {
            ...defaultOpt,
            ...opt
        }

        return [
            this.name ? `(module $${this.name}` : `(module`,
            addIndent([
                this.importToString(),
                this.typeToString(),
                this.globalToString(),
                this.memoryToString(),
                this.dataToString(),
                this.tableToString(),
                this.elementToString(),
                this.functionToString(option),
                this.startToString(),
                this.exportToString(),
            ].join("\n"), " ", option.indent),
            ")"
        ].join("\n");
    }

    private typeToString(): string {
        let res: string[] = [];
        for (let type of this.type) {
            let name = type.name;
            let content = [
                name ? `(type $${name}` : `(type`,
                "(func",
                type.params?.length ? `(param ${typesToString(type.params)})` : "",
                type.results?.length ? `(result ${typesToString(type.results)})` : "",
                ")",
                ")"
            ].join(" ");
            res.push(content);
        }
        return res.join("\n");
    }

    private globalToString(): string {
        let res: string[] = [];
        for (let global of this.global) {
            let name = global.name;
            let type = typesToString([global.valueType]);
            let content = [
                name ? `(global $${name}` : `(global`,
                global.mutable ? `(mut ${type})` : type,
                `(${type}.const ${global.init})`,
                ")"
            ].join(" ");
            res.push(content);
        }
        return res.join("\n");
    }

    private importToString(): string {
        let res: string[] = [];
        for (let imp of this.import) {
            let name = imp.name;
            let module = imp.module.replace(/"/g, "\\\"");
            let importName = imp.importName.replace(/"/g, "\\\"");
            let content: string;
            switch (imp.type) {
                case ImportExportType.Function: {
                    content = [
                        name ? `(func $${name}` : `(func`,
                        imp.params?.length ? `(param ${typesToString(imp.params)})` : "",
                        imp.results?.length ? `(result ${typesToString(imp.results)})` : "",
                        ")"
                    ].join(" ");
                    break;
                }
                case ImportExportType.Table: {
                    content = [
                        name ? `(table $${name}` : `(table`,
                        imp.min,
                        imp.max ?? "",
                        "anyfunc",
                        ")"
                    ].join(" ");
                    break;
                }
                case ImportExportType.Memory: {
                    content = [
                        name ? `(memory $${name}` : `(memory`,
                        imp.min,
                        imp.max ?? "",
                        ")"
                    ].join(" ");
                    break;
                }
                case ImportExportType.Global: {
                    let type = typesToString([imp.valueType]);
                    content = [
                        name ? `(global $${name}` : `(global`,
                        imp.mutable ? `(mut ${type})` : type
                    ].join(" ");
                    break;
                }
            }

            let str = `(import "${module}" "${importName}" ${content})`
            res.push(str);
        }
        return res.join("\n");
    }
    private memoryToString(): string {
        let res: string[] = [];
        for (let mem of this.memory) {
            let name = mem.name;
            let content = [
                name ? `(memory $${name}` : `(memory`,
                mem.min,
                mem.max ?? "",
                ")"
            ].join(" ");
            res.push(content);
        }
        return res.join("\n");
    }
    private bufferToString(buffer: ArrayBuffer): string {
        let td = new TextDecoder();
        return td.decode(buffer).replace(/\W/g, $$ => {
            let txt = $$.charCodeAt(0).toString(16);
            return txt.length < 2 ? `\\0${txt}` : `\\${txt}`;
        })
    }
    private dataToString(): string {
        let res: string[] = [];
        for (let data of this.data) {
            let name = data.name;
            let txt = this.bufferToString(data.init);
            let content = [
                name ? `(data $${name}` : `(data`,
                typeof data.memoryIndex === "string" ? `(memory $${data.memoryIndex})` :
                    data.memoryIndex !== 0 ? `(memory ${data.memoryIndex})` : "",
                `(i32.const ${data.offset})`,
                // todo
                txt.length ? `"${txt}"` : "",
                ")"
            ].join(" ");
            res.push(content);
        }
        return res.join("\n");
    }
    private tableToString(): string {
        let res: string[] = [];
        for (let table of this.table) {
            let name = table.name;
            let content = [
                name ? `(table $${name}` : `(table`,
                table.min,
                table.max ?? "",
                "anyfunc",
                ")"
            ].join(" ");
            res.push(content);
        }
        return res.join("\n");
    }
    private elementToString(): string {
        let res: string[] = [];
        for (let elem of this.element) {
            let name = elem.name;
            let content = [
                name ? `(elem $${name}` : `(elem`,
                typeof elem.tableIndex === "string" ? `(table $${elem.tableIndex})` :
                    elem.tableIndex !== 0 ? `(table ${elem.tableIndex})` : "",
                `(i32.const ${elem.offset})`,
                elem.functionIndexes.map(it => typeof it === "string" ? `$${it}` : it).join(" "),
                ")"
            ].join(" ");
            res.push(content);
        }
        return res.join("\n");
    }

    private functionToString(option: Required<FormatOption>): string {
        let res: string[] = [];
        for (let func of this.function) {
            let content = func.toString(option);
            res.push(content);
        }
        return res.join("\n");
    }

    private startToString() {
        if (this.start !== undefined) {
            if (typeof this.start === "string") {
                let name = this.start;
                return `(start $${name})`;
            } else {
                return `(start ${this.start})`;
            }
        } else {
            return "";
        }
    }

    private exportToString(): string {
        let res: string[] = [];
        for (let exp of this.export) {
            let name = exp.exportName.replace(/"/g, "\\\"");
            let indexStr = typeof exp.index === "string" ? `$${exp.index}` : exp.index;

            let content: string;
            switch (exp.type) {
                case ImportExportType.Function: content = `(func ${indexStr})`; break;
                case ImportExportType.Table: content = `(table ${indexStr})`; break;
                case ImportExportType.Memory: content = `(memory ${indexStr})`; break;
                case ImportExportType.Global: content = `(global ${indexStr})`; break;
            }
            let str = `(export "${name}" ${content})`;
            res.push(str);
        }
        return res.join("\n");
    }

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