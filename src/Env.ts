import type { Func } from './Func';
import { GlobalOption, ImportExportType, Index, IndexType, MemoryOption, ModuleOption, TableOption, Type, TypeOption, U32 } from './Type';


type EnvKey = "functions" | "tables" | "memories" | "globals" | "types";
/**
 * 环境上下文
 */
export class Env {
    readonly functions = this.get(ImportExportType.Function);
    readonly tables = this.get(ImportExportType.Table);
    readonly memories = this.get(ImportExportType.Memory);
    readonly globals = this.get(ImportExportType.Global);
    readonly types = this.getType();

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
        };
        let arr: { name?: string; }[] = typeMap[type];
        if (typeof index === "string") {
            return arr.find(it => it.name === index);
        } else {
            return arr[index];
        }
    }
    findFunction(index: Index): TypeOption | undefined {
        return this.find(ImportExportType.Function, index);
    }
    findGlobal(index: Index): Omit<GlobalOption, "init"> | undefined {
        return this.find(ImportExportType.Global, index);
    }
    findMemory(index: Index): MemoryOption | undefined {
        return this.find(ImportExportType.Memory, index);
    }
    findTable(index: Index): TableOption | undefined {
        return this.find(ImportExportType.Table, index);
    }
    findType(index: Index): TypeOption | undefined {
        if (typeof index === "string") {
            return this.types.find(it => it.name === index);
        } else {
            return this.types[index];
        }
    }

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
    findFunctionIndex(index: Index): U32 | undefined {
        return this.findIndex(IndexType.Function, index);
    }
    findGlobalIndex(index: Index): U32 | undefined {
        return this.findIndex(IndexType.Global, index);
    }
    findMemoryIndex(index: Index): U32 | undefined {
        return this.findIndex(IndexType.Memory, index);
    }
    findTableIndex(index: Index): U32 | undefined {
        return this.findIndex(IndexType.Table, index);
    }
    findTypeIndex(index: Index): U32 | undefined {
        return this.findIndex(IndexType.Type, index);
    }

    private getType(): TypeOption[] {
        let types = [...this.option.type];

        let typeOptions = this.option.import.filter(it => it.type === ImportExportType.Function) as TypeOption[];
        let importFuncs = typeOptions.map(it => ({ params: it.params, results: it.results }));

        let funcTypes = this.functions.map(it => ({ ...it, name: undefined }));
        for (let it of [...funcTypes, ...importFuncs]) {
            let isInArr = types.some(t => this.isSameType(t, it));
            if (isInArr) continue;
            types.push(it);
        }

        return types;
    }
    isSameType(t1: TypeOption, t2: TypeOption) {
        let { params: t1Ps = [], results: t1Rs = [] } = t1;
        let { params: t2Ps = [], results: t2Rs = [] } = t2;

        if (t1Ps.length !== t2Ps.length) return false;
        if (t1Rs.length !== t2Rs.length) return false;

        for (let i = 0; i < t1Ps?.length ?? 0; i++) {
            let p1 = t1Ps[i];
            let p2 = t2Ps[i];
            if (p1 !== p2) return false;
        }

        for (let i = 0; i < t1Rs.length; i++) {
            let r1 = t1Rs[i];
            let r2 = t2Rs[i];
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
        };
        let inners = nameMap[type];
        if (type === ImportExportType.Function) {
            let types = (inners as Func[]).map(it => it.getType());
            return [...imports, ...types];
        } else {
            return [...imports, ...inners];
        }
    }

    indexToName(indexType: IndexType.Function | IndexType.Table | IndexType.Memory | IndexType.Global | IndexType.Type, idx: Index): Index {
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

    functionIndexToName(idx: Index): Index {
        return this.indexToName(IndexType.Function, idx);
    }
    tableIndexToName(idx: Index): Index {
        return this.indexToName(IndexType.Table, idx);
    }
    memoryIndexToName(idx: Index): Index {
        return this.indexToName(IndexType.Memory, idx);
    }
    globalIndexToName(idx: Index): Index {
        return this.indexToName(IndexType.Global, idx);
    }
    typeIndexToName(idx: Index): Index {
        return this.indexToName(IndexType.Type, idx);
    }
}
