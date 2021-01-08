import type { Func } from './Func';
import { GlobalOption, ImportExportType, Index, IndexType, isSameType, MemoryOption, ModuleOption, TableOption, Type, TypeOption, U32 } from './Type';

/**
 * 环境上下文暴露出的字段
 */
type EnvKey = "functions" | "tables" | "memories" | "globals" | "types";

/**
 * 环境上下文
 */
export class Env {
    /**
     * 所有方法对应的签名
     */
    readonly functions = this.get(ImportExportType.Function);
    /**
     * 所有表格对应的配置
     */
    readonly tables = this.get(ImportExportType.Table);
    /**
     * 所有内存对应的配置
     */
    readonly memories = this.get(ImportExportType.Memory);
    /**
     * 所有全局变量对应的配置
     */
    readonly globals = this.get(ImportExportType.Global);
    /**
     * 所有方法类型
     */
    readonly types = this.getType();

    /**
     * 
     * @param option 模块的配置
     */
    constructor(private option: ModuleOption) { }

    /**
     * 通过索引，找到对应的配置
     * @param type 数据类型
     * @param index 索引
     */
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
        };
        let arr: { name?: string; }[] = typeMap[type];
        if (typeof index === "string") {
            return arr.find(it => it.name === index);
        } else {
            return arr[index];
        }
    }
    /**
     * 查找方法签名
     * @param index 索引
     */
    findFunction(index: Index): TypeOption | undefined {
        return this.find(ImportExportType.Function, index);
    }
    /**
     * 查找全局变量配置
     * @param index 索引
     */
    findGlobal(index: Index): Omit<GlobalOption, "init"> | undefined {
        return this.find(ImportExportType.Global, index);
    }
    /**
     * 查找内存配置
     * @param index 索引
     */
    findMemory(index: Index): MemoryOption | undefined {
        return this.find(ImportExportType.Memory, index);
    }
    /**
     * 查找表格配置
     * @param index 索引
     */
    findTable(index: Index): TableOption | undefined {
        return this.find(ImportExportType.Table, index);
    }
    /**
     * 查找方法类型
     * @param index 索引
     */
    findType(index: Index): TypeOption | undefined {
        if (typeof index === "string") {
            return this.types.find(it => it.name === index);
        } else {
            return this.types[index];
        }
    }

    /**
     * 通过名称，找到对应的索引
     * @param type 查找的配置的类型
     * @param index 名称
     */
    findIndex(type: IndexType.Function | IndexType.Table | IndexType.Memory | IndexType.Global | IndexType.Type, index: Index): U32 | undefined {
        if (typeof index === "string") {
            let map = {
                [IndexType.Function]: "functions",
                [IndexType.Table]: "tables",
                [IndexType.Memory]: "memories",
                [IndexType.Global]: "globals",
                [IndexType.Type]: "types",
            }
            let key = map[type] as EnvKey;
            return this[key].findIndex((it: any) => it.name === index);
        } else {
            return index;
        }
    }

    /**
     * 通过名称，找到方法的索引
     * @param index 名称
     */
    findFunctionIndex(index: Index): U32 | undefined {
        return this.findIndex(IndexType.Function, index);
    }

    /**
     * 通过名称，找到全局变量的索引
     * @param index 名称
     */
    findGlobalIndex(index: Index): U32 | undefined {
        return this.findIndex(IndexType.Global, index);
    }

    /**
     * 通过名称，找到内存的索引
     * @param index 名称
     */
    findMemoryIndex(index: Index): U32 | undefined {
        return this.findIndex(IndexType.Memory, index);
    }

    /**
     * 通过名称，找到表格的索引
     * @param index 名称
     */
    findTableIndex(index: Index): U32 | undefined {
        return this.findIndex(IndexType.Table, index);
    }

    /**
     * 通过名称，找到类型的索引
     * @param index 名称
     */
    findTypeIndex(index: Index): U32 | undefined {
        return this.findIndex(IndexType.Type, index);
    }

    /**
     * 获取所有方法的类型
     */
    private getType(): TypeOption[] {
        let types = [...this.option.type];

        let typeOptions = this.option.import.filter(it => it.type === ImportExportType.Function) as TypeOption[];
        let importFuncs = typeOptions.map(it => ({ params: it.params, results: it.results }));

        let funcTypes = this.functions.map(it => ({ ...it, name: undefined }));
        let blockTypes = this.option.function.flatMap(it => it.getBlockTypes());

        for (let it of [...importFuncs, ...funcTypes, ...blockTypes]) {
            let isInArr = types.some(t => isSameType(t, it));
            if (isInArr) continue;
            types.push(it);
        }

        return types;
    }

    /**
     * 获取相关类型的所有配置
     * @param type 数据类型
     */
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
        };
        let inners = nameMap[type];
        if (type === ImportExportType.Function) {
            let types = (inners as Func[]).map(it => it.getType());
            return [...imports, ...types];
        } else {
            return [...imports, ...inners];
        }
    }

    /**
     * 通过索引，找到对应的名称
     * @param indexType 索引的类型
     * @param idx 索引
     */
    findName(indexType: IndexType.Function | IndexType.Table | IndexType.Memory | IndexType.Global | IndexType.Type, idx: Index): Index {
        if (typeof idx === "string") {
            return idx;
        } else {
            let map = {
                [IndexType.Function]: "functions",
                [IndexType.Table]: "tables",
                [IndexType.Memory]: "memories",
                [IndexType.Global]: "globals",
                [IndexType.Type]: "types",
            }
            let key = map[indexType] as EnvKey;
            let res = this[key][idx];
            return res.name ?? idx;
        }
    }

    /**
     * 通过索引，找到方法的名称
     * @param idx 索引
     */
    findFunctionName(idx: Index): Index {
        return this.findName(IndexType.Function, idx);
    }
    /**
     * 通过索引，找到表格的名称
     * @param idx 索引
     */
    findTableName(idx: Index): Index {
        return this.findName(IndexType.Table, idx);
    }
    /**
     * 通过索引，找到内存的名称
     * @param idx 索引
     */
    findMemoryName(idx: Index): Index {
        return this.findName(IndexType.Memory, idx);
    }
    /**
     * 通过索引，找到全局变量的名称
     * @param idx 索引
     */
    findGlobalName(idx: Index): Index {
        return this.findName(IndexType.Global, idx);
    }
    /**
     * 通过索引，找到类型的名称
     * @param idx 索引
     */
    findTypeName(idx: Index): Index {
        return this.findName(IndexType.Type, idx);
    }
}
