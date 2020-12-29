import type { Func } from './Func';
import { GlobalOption, ImportExportType, Index, MemoryOption, ModuleOption, TableOption, TypeOption } from './Type';

/**
 * 环境上下文
 */
export class Env {
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
    private getType(): TypeOption[] {
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
        if (t1.params.length !== t2.params.length)
            return false;
        if (t1.results.length !== t2.params.length)
            return false;

        for (let i = 0; i < t1.params.length; i++) {
            let p1 = t1.params[i];
            let p2 = t2.params[i];
            if (p1 !== p2)
                return false;
        }

        for (let i = 0; i < t1.results.length; i++) {
            let r1 = t1.results[i];
            let r2 = t2.results[i];
            if (r1 !== r2)
                return false;
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
}
