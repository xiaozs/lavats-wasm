import { Index } from './Code';
import { BlockLinker, Instruction, Stack } from './Instruction';
import { ImportExportType, F32, F64, I32, I64, Type, U32, ElementType, isU32, isI32, isI64, isF32, isF64 } from './Type';


export interface FunctionOption {
    name?: string;
    params?: ({ name: string, type: Type } | Type)[];
    results?: Type[];
    locals?: ({ name: string, type: Type } | Type)[];
    codes?: Instruction[];
}

export class Func {
    get name() {
        return this.options.name;
    }
    constructor(private options: FunctionOption) { }
    private checkNames() {
        let map: Record<string, number> = {};

        let params = this.options.params || [];
        let locals = this.options.locals || [];
        let vals = [...params, ...locals];

        for (let val of vals) {
            if (typeof val !== "object") continue;
            let name = val.name;
            let count = map[name] = (map[name] ?? 0) + 1;
            if (count >= 2) throw new Error(`local ${name}: 命名冲突`);
        }
    }
    check(env: CheckEnv) {
        this.checkNames();

        let type = this.getType();
        let stack = new Stack();
        let codes = this.options.codes || [];
        let linker = new BlockLinker(this);
        for (let code of codes) {
            code.check(env, stack, this, linker);
        }
        if (stack.length !== type.results.length) throw new Error("出参不匹配");
        stack.checkStackTop(type.results, false);
    }
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
    getLocal(index: Index): Type | undefined {
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
}

export interface MemoryOption {
    name?: string;
    min: U32;
    max?: U32;
}
export interface DataOption {
    name?: string;
    memoryIndex: Index;
    offset: U32;
    init: ArrayBuffer;
}
export interface TableOption {
    name?: string;
    elementType: ElementType;
    min: U32;
    max?: U32;
}
export interface ElementOption {
    name?: string;
    tableIndex: Index;
    offset: U32;
    functionIndexes: Index[];
}

export interface Limit {
    min: U32;
    max?: U32;
}

export type ImportOption =
    { name?: string, module: string, importName: string } &
    (
        | { type: ImportExportType.Function, params?: Type[], results?: Type[] }
        | { type: ImportExportType.Table, elementType: ElementType, min: U32, max?: U32 }
        | { type: ImportExportType.Memory, min: U32, max?: U32 }
        | { type: ImportExportType.Global, globalType: Type, mutable?: boolean }
    );

export interface ExportOption {
    exportName: string;
    type: ImportExportType;
    index: Index;
}
export interface TypeOption {
    name?: string;
    params: Type[];
    results: Type[];
}

export type GlobalOption =
    | { name?: string, globalType: Type.I32, mutable?: boolean, init: I32 }
    | { name?: string, globalType: Type.I64, mutable?: boolean, init: I64 }
    | { name?: string, globalType: Type.F32, mutable?: boolean, init: F32 }
    | { name?: string, globalType: Type.F64, mutable?: boolean, init: F64 }

export interface ModuleOption {
    name?: string;
    memory: MemoryOption[];
    data: DataOption[];
    table: TableOption[];
    element: ElementOption[];
    import: ImportOption[];
    export: ExportOption[];
    type: TypeOption[];
    global: GlobalOption[];
    function: Func[];
    start?: Index;
}

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

export class CheckEnv {
    private functions = this.get(ImportExportType.Function);
    private tables = this.get(ImportExportType.Table);
    private memories = this.get(ImportExportType.Memory);
    private globals = this.get(ImportExportType.Global);
    private types = this.getType();

    constructor(private option: ModuleOption) { }
    find(type: ImportExportType.Function, index: Index): TypeOption | undefined;
    find(type: ImportExportType.Global, index: Index): Omit<GlobalOption, "init"> | undefined;
    find(type: ImportExportType.Memory, index: Index): MemoryOption | undefined;
    find(type: ImportExportType.Table, index: Index): TableOption | undefined;
    find(type: ImportExportType, index: Index): any | undefined;
    find(type: ImportExportType, index: Index) {
        let typeMap = {
            [ImportExportType.Function]: this.functions,
            [ImportExportType.Global]: this.globals,
            [ImportExportType.Memory]: this.memories,
            [ImportExportType.Table]: this.tables,
        }
        let arr: { name?: string }[] = typeMap[type];
        if (typeof index === "string") {
            return arr.find(it => it.name === index)
        } else {
            return arr[index];
        }
    }
    findType(index: Index): TypeOption | undefined {
        if (typeof index === "string") {
            return this.types.find(it => it.name === index)
        } else {
            return this.types[index];
        }
    }
    getType(): TypeOption[] {
        let types = this.option.type;

        let funcTypes = this.functions.map(it => ({ ...it, name: undefined }));
        for (let it of funcTypes) {
            let isInArr = types.some(t => this.isSameType(t, it));
            if (!isInArr) continue;

            types.push(it);
        }

        return types;
    }
    private isSameType(t1: TypeOption, t2: TypeOption) {
        if (t1.params.length !== t2.params.length) return false;
        if (t1.results.length !== t2.params.length) return false;

        for (let i = 0; i < t1.params.length; i++) {
            let p1 = t1.params[i];
            let p2 = t2.params[i];
            if (p1 !== p2) return false;
        }

        for (let i = 0; i < t1.results.length; i++) {
            let r1 = t1.results[i];
            let r2 = t2.results[i];
            if (r1 !== r2) return false;
        }

        return true;
    }
    private get(type: ImportExportType.Function): TypeOption[];
    private get(type: ImportExportType.Global): Omit<GlobalOption, "init">[];
    private get(type: ImportExportType.Memory): MemoryOption[];
    private get(type: ImportExportType.Table): TableOption[];
    private get(type: ImportExportType): any[] {
        let imports = this.option.import.filter(it => it.type === type);
        let nameMap = {
            [ImportExportType.Function]: this.option.function,
            [ImportExportType.Global]: this.option.global,
            [ImportExportType.Memory]: this.option.memory,
            [ImportExportType.Table]: this.option.table,
        }
        let inners = nameMap[type];
        if (type === ImportExportType.Function) {
            let types = (inners as Func[]).map(it => it.getType());
            return [...imports, ...types];
        } else {
            return [...imports, ...inners];
        }
    }
}

export class Module {
    private option: ModuleOption;
    constructor(option: Partial<ModuleOption>) {
        this.option = Object.assign(getDefaultOption(), option);
    }
    validate(): boolean {
        try {
            this.check();
            return true;
        } catch (e) {
            return false;
        }
    }

    check() {
        this.checkNames();
        this.checkImport();
        this.checkTable();
        this.checkMemory();
        this.checkGlobal();

        let env = new CheckEnv(this.option);
        this.checkExport(env);
        this.checkStart(env);
        this.checkElement(env);
        this.checkFunction(env);
        this.checkData(env);
    }
    private checkLimit({ min, max }: Limit) {
        if (!isU32(min)) throw new Error("min不是u32");
        if (max !== undefined && !isU32(max)) throw new Error("max不是u32");
        if (max !== undefined && min > max) throw new Error("min > max");
    }
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
    private checkTable() {
        this.checkLimitOf("table");
    }
    private checkMemory() {
        this.checkLimitOf("memory");
    }
    private checkGlobal() {
        let fnMap = {
            [Type.I32]: isI32,
            [Type.I64]: isI64,
            [Type.F32]: isF32,
            [Type.F64]: isF64,
        }
        for (let i = 0; i < this.option.global.length; i++) {
            let it = this.option.global[i];
            let fn = fnMap[it.globalType];
            let isValidate = fn(it.init);
            if (!isValidate) {
                let type = Type[it.globalType];
                throw new Error(`global ${i}: 类型为${type}, 其值为${it.init}`);
            }
        }
    }
    private checkExport(env: CheckEnv) {
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
    private checkStart(env: CheckEnv) {
        let { start } = this.option;
        if (start === undefined) return;
        let obj = env.find(ImportExportType.Function, start);
        if (!obj) throw new Error(`start: 没找到func ${start}`)
    }
    private checkElement(env: CheckEnv) {
        for (let i = 0; i < this.option.element.length; i++) {
            let it = this.option.element[i];
            let table = env.find(ImportExportType.Table, it.tableIndex);
            if (!table) throw new Error(`elememt ${i}: 没找到table ${it.tableIndex}`);

            for (let idx of it.functionIndexes) {
                let func = env.find(ImportExportType.Function, idx);
                if (!func) throw new Error(`elememt ${i}: 没找到func ${idx}`);
            }
        }
    }
    private checkFunction(env: CheckEnv) {
        for (let i = 0; i < this.option.function.length; i++) {
            let func = this.option.function[i];
            func.check(env);
        }
    }
    private checkData(env: CheckEnv) {
        for (let i = 0; i < this.option.data.length; i++) {
            let it = this.option.data[i];
            let memory = env.find(ImportExportType.Memory, it.memoryIndex);
            if (!memory) throw new Error(`data ${i}: 没找到memory ${it.memoryIndex}`);
        }
    }
    toBuffer(check = true) {
        check && this.check();
        // todo
    }
}

export interface Module extends ModuleOption { }

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