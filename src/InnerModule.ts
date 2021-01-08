import { combin, decodeObject, decodeUint, encodeObject, Offset } from './encode';
import { Env } from './Env';
import { Func } from './Func';
import { bufferToInstr } from './Instruction';
import { Module } from './Module';
import { Code, CodeSection, CustomSection, Data, DataNameSubSection, DataSection, Element, ElementNameSubSection, ElementSection, Export, ExportSection, FunctionExportDesc, FunctionImportDesc, FunctionNameSubSection, FunctionSection, FunctionType, Global, GlobalExportDesc, GlobalImportDesc, GlobalNameSubSection, GlobalSection, Import, ImportSection, IndirectNameAssociation, IndirectNameMap, InitedGlobal, LabelNameSubSection, Local, LocalNameSubSection, Memory, MemoryExportDesc, MemoryImportDesc, MemoryNameSubSection, MemorySection, ModuleNameSubSection, NameMap, NameMapSubSection, NameSubSection, Section, StartSection, Table, TableExportDesc, TableImportDesc, TableNameSubSection, TableSection, TypeNameSubSection, TypeSection } from './Section';
import { ElementType, FunctionOption, ImportExportType, isSameType, NameType, SectionType, Type, TypeOption } from './Type';

/**
 * 内用模块
 */
export class InnerModule {
    /**
     * 魔数："\0asm"
     */
    static magic = new Uint8Array([0x00, 0x61, 0x73, 0x6D]);
    /**
     * 版本：1
     */
    static version = new Uint8Array([0x01, 0x00, 0x00, 0x00]);

    /**
     * @param sections 模块的各个数据段
     */
    private constructor(private sections: Section[]) { }

    /**
     * 读取缓存生成InnerModule
     * @param buffer 缓存
     */
    static fromBuffer(buffer: ArrayBuffer): InnerModule {
        let offset: Offset = { value: 0 };

        this.checkMagic(buffer, offset);
        this.checkVersion(buffer, offset);

        let sections: Section[] = [];
        while (true) {
            if (buffer.byteLength === offset.value) break;

            let type = this.getSectionType(buffer, offset);
            let fn = sectionMap[type];
            let section: Section = decodeObject(buffer, offset, fn);
            sections.push(section);
        }
        return new InnerModule(sections);
    }

    /**
     * 生成类型段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createTypeSection(module: Module, env: Env): TypeSection | undefined {
        if (!env.types.length) return;
        let functionTypes = env.types.map(it => {
            let type = new FunctionType();
            type.params = it.params ?? [];
            type.results = it.results ?? [];
            return type;
        })
        let res = new TypeSection();
        res.functionTypes = functionTypes;
        return res;
    }

    /**
     * 生成引入段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createImportSection(module: Module, env: Env): ImportSection | undefined {
        if (!module.import.length) return;
        let imports = module.import.map((it) => {
            let imp = new Import();
            imp.module = it.module;
            imp.name = it.importName;
            switch (it.type) {
                case ImportExportType.Function: {
                    let desc = new FunctionImportDesc();
                    let type2 = { params: it.params ?? [], results: it.results ?? [] };
                    desc.typeIndex = env.types.findIndex(type1 => isSameType(type1, type2));
                    imp.desc = desc;
                    return imp;
                }
                case ImportExportType.Global: {
                    let desc = new GlobalImportDesc();
                    desc.global = new Global();
                    desc.global.valueType = it.valueType;
                    desc.global.mutable = it.mutable ?? false;
                    imp.desc = desc;
                    return imp;
                }
                case ImportExportType.Memory: {
                    let desc = new MemoryImportDesc();
                    desc.memory = new Memory();
                    desc.memory.min = it.min;
                    let hasMax = it.max !== undefined;
                    desc.memory.hasMax = hasMax;
                    if (hasMax) {
                        desc.memory.max = it.max;
                    }
                    imp.desc = desc;
                    return imp;
                }
                case ImportExportType.Table: {
                    let desc = new TableImportDesc();
                    desc.table = new Table();
                    desc.table.elementType = ElementType.funcref;
                    let hasMax = it.max !== undefined;
                    desc.table.hasMax = hasMax;
                    if (hasMax) {
                        desc.table.max = it.max;
                    }
                    imp.desc = desc;
                    return imp;
                }
            }
        });
        let res = new ImportSection();
        res.imports = imports;
        return res;
    }

    /**
     * 生成函数段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createFunctionSection(module: Module, env: Env): FunctionSection | undefined {
        if (!module.function.length) return;
        let typeIndexes = module.function.map(it => {
            let type = it.getType();
            let typeIndex = env.types.findIndex(type1 => isSameType(type1, type));
            return typeIndex;
        });
        let res = new FunctionSection();
        res.typeIndexes = typeIndexes;
        return res;
    }

    /**
     * 生成表格段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createTableSection(module: Module, env: Env): TableSection | undefined {
        if (!module.table.length) return;
        let tables = module.table.map(it => {
            let table = new Table();
            table.elementType = ElementType.funcref;
            let hasMax = it.max !== undefined;
            table.hasMax = hasMax;
            table.min = it.min;
            if (hasMax) {
                table.max = it.max;
            }
            return table;
        })
        let res = new TableSection();
        res.tables = tables;
        return res;
    }

    /**
     * 生成内存段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createMemorySection(module: Module, env: Env): MemorySection | undefined {
        if (!module.memory.length) return;
        let memories = module.memory.map(it => {
            let memory = new Memory();
            let hasMax = it.max === undefined;
            memory.hasMax = hasMax;
            memory.min = it.min;
            if (hasMax) {
                memory.max = it.max;
            }
            return memory;
        })
        let res = new MemorySection();
        res.memories = memories;
        return res;
    }

    /**
     * 生成全局变量段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createGlobalSection(module: Module, env: Env): GlobalSection | undefined {
        if (!module.global.length) return;
        let globals = module.global.map(it => {
            let global = new InitedGlobal();
            global.mutable = it.mutable ?? false;
            global.valueType = it.valueType;
            global.init = it.init;
            return global;
        });
        let res = new GlobalSection();
        res.globals = globals;
        return res;
    }

    /**
     * 生成导出段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createExportSection(module: Module, env: Env): ExportSection | undefined {
        if (!module.export.length) return;
        let exports = module.export.map(it => {
            let exp = new Export();
            exp.name = it.exportName;
            switch (it.type) {
                case ImportExportType.Function: {
                    let desc = new FunctionExportDesc();
                    desc.index = env.findFunctionIndex(it.index)!;
                    exp.desc = desc;
                    return exp;
                }
                case ImportExportType.Global: {
                    let desc = new GlobalExportDesc();
                    desc.index = env.findGlobalIndex(it.index)!;
                    exp.desc = desc;
                    return exp;
                }
                case ImportExportType.Memory: {
                    let desc = new MemoryExportDesc();
                    desc.index = env.findMemoryIndex(it.index)!;
                    exp.desc = desc;
                    return exp;
                }
                case ImportExportType.Table: {
                    let desc = new TableExportDesc();
                    desc.index = env.findTableIndex(it.index)!;
                    exp.desc = desc;
                    return exp;
                }
            }
        });
        let res = new ExportSection();
        res.exports = exports;
        return res;
    }

    /**
     * 生成开始段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createStartSection(module: Module, env: Env): StartSection | undefined {
        if (!module.start) return;
        let res = new StartSection();
        res.functionIndex = env.findFunctionIndex(module.start)!;
        return res;
    }

    /**
     * 生成元素段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createElementSection(module: Module, env: Env): ElementSection | undefined {
        if (!module.element.length) return;
        let elements = module.element.map(it => {
            let elemet = new Element();
            elemet.tableIndex = env.findTableIndex(it.tableIndex)!;
            elemet.offset = it.offset;
            elemet.functionIndexes = it.functionIndexes.map(idx => env.findFunctionIndex(idx)!);
            return elemet;
        })
        let res = new ElementSection();
        res.elements = elements;
        return res;
    }

    /**
     * 生成代码段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createCodeSection(module: Module, env: Env): CodeSection | undefined {
        if (!module.function.length) return;
        let codes = module.function.map(it => {
            let code = new Code();
            let locals = it.getLocalTypesAndCount().map(it => {
                let local = new Local();
                local.count = it.count;
                local.type = it.type;
                return local;
            });
            code.locals = locals;
            code.expr = it.toBuffer(env);
            return code;
        });
        let res = new CodeSection();
        res.codes = codes;
        return res;
    }

    /**
     * 生成数据段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createDataSection(module: Module, env: Env): DataSection | undefined {
        if (!module.data.length) return;
        let datas = module.data.map(it => {
            let data = new Data();
            data.memoryIndex = env.findMemoryIndex(it.memoryIndex)!;
            data.offset = it.offset;
            data.init = it.init;
            return data;
        })
        let res = new DataSection();
        res.datas = datas;
        return res;
    }

    /**
     * 生成名称段
     * @param module 模块
     * @param env 环境上下文
     */
    private static createNameSection(module: Module, env: Env): CustomSection | undefined {
        let nameSection = NameSection.fromModule(module);
        let res = new CustomSection();
        res.name = "name";
        res.buffer = nameSection.toBuffer();
        return res;
    }

    /**
     * 生成InnerModule
     * @param module 模块
     * @param env 环境上下文
     */
    static fromModule(module: Module, env: Env): InnerModule {
        let sections: (Section | undefined)[] = [
            this.createTypeSection(module, env),
            this.createImportSection(module, env),
            this.createFunctionSection(module, env),
            this.createTableSection(module, env),
            this.createMemorySection(module, env),
            this.createGlobalSection(module, env),
            this.createExportSection(module, env),
            this.createStartSection(module, env),
            this.createElementSection(module, env),
            this.createCodeSection(module, env),
            this.createDataSection(module, env),
            this.createNameSection(module, env)
        ];
        let secs = sections.filter(it => it) as Section[];
        let res = new InnerModule(secs);
        return res;
    }

    /**
     * 转换成为缓存
     */
    toBuffer(): ArrayBuffer {
        let res: ArrayBuffer[] = [
            InnerModule.magic,
            InnerModule.version
        ];
        for (let it of this.sections) {
            let buf = encodeObject(it);
            res.push(buf);
        }
        return combin(res);
    }

    /**
     * 转换为Module
     * @param module 模块
     * @param env 环境上下文
     */
    toModule(): Module {
        let [customSec] = this.getCustomSections("name") as [CustomSection?];
        let nameSec = customSec?.toNameSection();

        let type = this.typeSection?.getTypes(nameSec);
        let imports = this.importSection?.getImportOptions(type ?? []);
        let memory = this.memorySection?.getMemoryOptions();
        let data = this.dataSection?.getDataOptions(nameSec);
        let table = this.tableSection?.getTableOptions();
        let element = this.elementSection?.getElementOptions(nameSec);

        let global = this.globalSection?.getGlobalOptions();
        let functions = this.getFunctions(nameSec, type);

        let allFunctions = [...imports?.filter(it => it.type === ImportExportType.Function) ?? [], ...functions ?? []];
        let allTables = [...imports?.filter(it => it.type === ImportExportType.Table) ?? [], ...table ?? []];
        let allMemories = [...imports?.filter(it => it.type === ImportExportType.Memory) ?? [], ...memory ?? []];
        let allGlobals = [...imports?.filter(it => it.type === ImportExportType.Global) ?? [], ...global ?? []];

        this.setNamesOf(allFunctions, nameSec?.functionNameSubSection);
        this.setNamesOf(allTables, nameSec?.tableNameSubSection);
        this.setNamesOf(allMemories, nameSec?.memoryNameSubSection);
        this.setNamesOf(allGlobals, nameSec?.globalNameSubSection);

        let startIndex = this.startSection?.functionIndex;
        let start = startIndex !== undefined ? allFunctions[startIndex].name : startIndex;

        let exports = this.exportSection?.getExportOptions({
            functions: allFunctions,
            tables: allTables,
            memories: allMemories,
            globals: allGlobals,
        });

        let module = new Module({
            name: nameSec?.moduleNameSubSection?.name,
            memory: memory ?? [],
            data: data ?? [],
            table: table ?? [],
            element: element ?? [],
            import: imports ?? [],
            export: exports ?? [],
            type: (type ?? []).filter(it => it.name),
            global: global ?? [],
            function: functions ?? [],
            start
        });

        module.setImmediateIndexToName();

        return module;
    }

    /**
     * 通过名称子段，设置数组中元素的名称
     * @param arr 数组
     * @param subSection 名称子段
     */
    private setNamesOf(arr: { name?: string }[], subSection: NameMapSubSection | undefined) {
        for (let { index, name } of subSection?.names ?? []) {
            arr[index].name = name;
        }
    }

    /**
     * 生成模块的所有函数
     * @param nameSec 名称段
     * @param typeOptions 模块的所有类型
     */
    private getFunctions(nameSec: NameSection | undefined, typeOptions: TypeOption[] | undefined): Func[] {
        let types = this.typeSection?.functionTypes ?? [];
        let typeIndexes = this.functionSection?.typeIndexes ?? [];
        let codes = this.codeSection?.codes ?? [];

        let labelAssoArr = nameSec?.labelNameSubSection?.names.associations ?? [];

        let options: FunctionOption[] = [];
        for (let i = 0; i < codes.length; i++) {
            let typeIndex = typeIndexes[i];
            let type = types[typeIndex];
            let code = codes[i];

            let labelNames = labelAssoArr.find(it => it.index === i)?.names;

            let opt: FunctionOption = {
                params: [...type.params],
                results: [...type.results],
                locals: code.getLocalTypes(),
                codes: bufferToInstr(code.expr, labelNames, typeOptions)
            }
            options.push(opt);
        }

        let assoArr = nameSec?.localNameSubSection?.names.associations ?? [];
        for (let { index: functionIndex, names } of assoArr) {
            let opt = options[functionIndex];
            let vals = [...opt.params ?? [], ...opt.locals ?? []];
            for (let { index: localIndex, name } of names) {
                let type = vals[localIndex] as Type;
                vals[localIndex] = {
                    name,
                    type,
                }
            }
            let params = vals.slice(0, opt.params?.length);
            let locals = vals.slice(opt.params?.length);
            opt.params = params;
            opt.locals = locals;
        }
        return options.map(opt => new Func(opt));
    }

    /**
     * 检查magic
     * @param buffer 缓存
     * @param offset 偏移
     */
    private static checkMagic(buffer: ArrayBuffer, offset: Offset) {
        let length = InnerModule.magic.byteLength;
        let view = new Uint8Array(buffer);
        for (let i = 0; i < length; i++) {
            if (view[offset.value + i] !== InnerModule.magic[i])
                throw new Error(`magic 不符合`);
        }
        offset.value += length;
    }

    /**
     * 检查版本
     * @param buffer 缓存
     * @param offset 偏移
     */
    private static checkVersion(buffer: ArrayBuffer, offset: Offset) {
        let length = InnerModule.version.byteLength;
        let view = new Uint8Array(buffer);
        for (let i = 0; i < length; i++) {
            if (view[offset.value + i] !== InnerModule.version[i])
                throw new Error(`version 不符合`);
        }
        offset.value += length;
    }

    /**
     * 预判段的类型，不会修改offset
     * @param buffer 
     * @param offset 
     */
    private static getSectionType(buffer: ArrayBuffer, offset: Offset) {
        let org = offset.value;
        let type: SectionType = decodeUint(buffer, offset);
        offset.value = org;
        return type;
    }

    /**
     * 获取对应名称的自定义段
     * @param name 名称
     */
    getCustomSections(name?: string): CustomSection[] {
        let secArr = this.sections.filter(it => it.type === SectionType.CustomSection) as CustomSection[];
        if (name !== undefined) {
            return secArr;
        } else {
            return secArr.filter(it => it.name === name);
        }
    }
}

/**
 * 段类型 -> 段构造函数
 */
export let sectionMap = {
    [SectionType.CustomSection]: CustomSection,
    [SectionType.TypeSection]: TypeSection,
    [SectionType.ImportSection]: ImportSection,
    [SectionType.FunctionSection]: FunctionSection,
    [SectionType.TableSection]: TableSection,
    [SectionType.MemorySection]: MemorySection,
    [SectionType.GlobalSection]: GlobalSection,
    [SectionType.ExportSection]: ExportSection,
    [SectionType.StartSection]: StartSection,
    [SectionType.ElementSection]: ElementSection,
    [SectionType.CodeSection]: CodeSection,
    [SectionType.DataSection]: DataSection,
}

export interface InnerModule {
    /**
     * 类型段
     */
    readonly typeSection?: TypeSection;
    /**
     * 引入段
     */
    readonly importSection?: ImportSection;
    /**
     * 函数段
     */
    readonly functionSection?: FunctionSection;
    /**
     * 表格段
     */
    readonly tableSection?: TableSection;
    /**
     * 内存段
     */
    readonly memorySection?: MemorySection;
    /**
     * 全局变量段
     */
    readonly globalSection?: GlobalSection;
    /**
     * 导出段
     */
    readonly exportSection?: ExportSection;
    /**
     * 开始段
     */
    readonly startSection?: StartSection;
    /**
     * 元素段
     */
    readonly elementSection?: ElementSection;
    /**
     * 代码段
     */
    readonly codeSection?: CodeSection;
    /**
     * 数据段
     */
    readonly dataSection?: DataSection;
}
{
    // 给上面的每个段设置setter
    let keys = [
        "typeSection",
        "importSection",
        "functionSection",
        "tableSection",
        "memorySection",
        "globalSection",
        "exportSection",
        "startSection",
        "elementSection",
        "codeSection",
        "dataSection"
    ];

    let props: any = {};
    for (let key of keys) {
        let Key = key.replace(/^\w/, $$ => $$.toUpperCase()) as any;
        let value = SectionType[Key] as any;
        props[key] = {
            get() {
                return (this.sections as Section[]).find(it => it.type === value);
            }
        }
    }
    Object.defineProperties(InnerModule.prototype, props)
}

/**
 * 名称段
 */
export class NameSection {
    /**
     * @param subSections 名称子段
     */
    private constructor(private subSections: NameSubSection[]) { }
    /**
     * 有模块生成名称段
     * @param module 模块
     */
    static fromModule(module: Module): NameSection {
        let secs = [
            this.createModuleNameSubSection(module),
            this.createNameSubSection(module, "function"),
            this.createLocalNameSubSection(module),
            this.createLabelNameSubSection(module),
            this.createNameSubSection(module, "type"),
            this.createNameSubSection(module, "table"),
            this.createNameSubSection(module, "memory"),
            this.createNameSubSection(module, "global"),
            this.createNameSubSection(module, "element"),
            this.createNameSubSection(module, "data")
        ];

        let subSections = secs.filter(it => it) as NameSubSection[];

        return new NameSection(subSections);
    }

    /**
     * 生成模块名子段
     * @param module 模块
     */
    private static createModuleNameSubSection(module: Module): ModuleNameSubSection | undefined {
        if (module.name) {
            let sec = new ModuleNameSubSection();
            sec.name = module.name;
            return sec;
        }
    }

    /**
     * 生成局部变量名称子段
     * @param module 模块
     */
    private static createLocalNameSubSection(module: Module): LocalNameSubSection | undefined {
        let associations: IndirectNameAssociation[] = [];
        for (let functionIndex = 0; functionIndex < module.function.length; functionIndex++) {
            let func = module.function[functionIndex];
            let params = func.options.params || [];
            let locals = func.options.locals || [];
            let vals = [...params, ...locals];

            let names: NameMap[] = [];
            for (let localIndex = 0; localIndex < vals.length; localIndex++) {
                let local = vals[localIndex];
                if (typeof local !== "object") continue;
                let nameMap = new NameMap();
                nameMap.index = localIndex;
                nameMap.name = local.name;
                names.push(nameMap);
            }
            if (names.length) {
                let assoc = new IndirectNameAssociation();
                assoc.index = functionIndex;
                assoc.names = names;
                associations.push(assoc);
            }
        }
        if (associations.length) {
            let sec = new LocalNameSubSection();
            let names = new IndirectNameMap();
            names.associations = associations;
            sec.names = names;
            return sec;
        }
    }

    /**
     * 生成标签名称子段
     * @param module 模块
     */
    private static createLabelNameSubSection(module: Module): LabelNameSubSection | undefined {
        let associations: IndirectNameAssociation[] = [];
        for (let functionIndex = 0; functionIndex < module.function.length; functionIndex++) {
            let func = module.function[functionIndex];
            let labels = func.getLables();

            let names: NameMap[] = [];
            for (let labelIndex = 0; labelIndex < labels.length; labelIndex++) {
                let label = labels[labelIndex];
                if (label === undefined) continue;
                let nameMap = new NameMap();
                nameMap.index = labelIndex;
                nameMap.name = label;
                names.push(nameMap);
            }
            if (names.length) {
                let assoc = new IndirectNameAssociation();
                assoc.index = functionIndex;
                assoc.names = names;
                associations.push(assoc);
            }
        }
        if (associations.length) {
            let sec = new LabelNameSubSection();
            let names = new IndirectNameMap();
            names.associations = associations;
            sec.names = names;
            return sec;
        }
    }

    /**
     * 生成名称子段
     * @param module 模块
     * @param type 子段类型
     */
    private static createNameSubSection(module: Module, type: "function" | "type" | "table" | "memory" | "global" | "element" | "data"): NameSubSection | undefined {
        let map: Record<string, [new () => NameSubSection & { names: NameMap[] }, ImportExportType?]> = {
            "function": [FunctionNameSubSection, ImportExportType.Function],
            "table": [TableNameSubSection, ImportExportType.Table],
            "memory": [MemoryNameSubSection, ImportExportType.Memory],
            "global": [GlobalNameSubSection, ImportExportType.Global],

            "type": [TypeNameSubSection],
            "element": [ElementNameSubSection],
            "data": [DataNameSubSection],
        }

        let names: NameMap[] = [];
        let [fn, importType] = map[type];

        let group: { name?: string }[] = [];
        if (importType !== undefined) {
            let imports = module.import.filter(it => it.type === importType);
            group = imports;
        }
        group.push(...module[type]);

        for (let i = 0; i < group.length; i++) {
            let it = group[i];
            if (!it.name) continue;
            let nameMap = new NameMap();
            nameMap.index = i;
            nameMap.name = it.name;
            names.push(nameMap);
        }
        if (names.length) {
            let sec = new fn();
            sec.names = names;
            return sec;
        }
    }

    /**
     * 由缓存生成NameSection
     * @param buffer 缓存
     */
    static fromBuffer(buffer: ArrayBuffer): NameSection {
        let offset: Offset = { value: 0 };

        let subSections: NameSubSection[] = [];
        while (true) {
            if (buffer.byteLength === offset.value) break;

            let type = this.getSubSectionType(buffer, offset);
            let fn = subSectionMap[type];
            let section: NameSubSection = decodeObject(buffer, offset, fn);
            subSections.push(section);
        }
        return new NameSection(subSections);
    }

    /**
     * 预读子段类型，不会修改offset
     * @param buffer 缓存
     * @param offset 偏移
     */
    private static getSubSectionType(buffer: ArrayBuffer, offset: Offset) {
        let org = offset.value;
        let type: NameType = decodeUint(buffer, offset);
        offset.value = org;
        return type;
    }

    /**
     * 转换为缓存
     */
    toBuffer(): ArrayBuffer {
        let res: ArrayBuffer[] = [];
        for (let it of this.subSections) {
            let buf = encodeObject(it);
            res.push(buf);
        }
        return combin(res);
    }

    /**
     * 转换为自定义段
     */
    toCustomSection(): CustomSection {
        let res = new CustomSection();
        res.name = "name";
        res.buffer = this.toBuffer();
        return res;
    }
}

export interface NameSection {
    /**
     * 模块名子段
     */
    readonly moduleNameSubSection?: ModuleNameSubSection;
    /**
     * 函数名子段
     */
    readonly functionNameSubSection?: FunctionNameSubSection;
    /**
     * 局部变量名子段
     */
    readonly localNameSubSection?: LocalNameSubSection;
    /**
     * 标签名子段
     */
    readonly labelNameSubSection?: LabelNameSubSection;
    /**
     * 类型名子段
     */
    readonly typeNameSubSection?: TypeNameSubSection;
    /**
     * 表格名子段
     */
    readonly tableNameSubSection?: TableNameSubSection;
    /**
     * 内存名子段
     */
    readonly memoryNameSubSection?: MemoryNameSubSection;
    /**
     * 全局变量名子段
     */
    readonly globalNameSubSection?: GlobalNameSubSection;
    /**
     * 元素名子段
     */
    readonly elementNameSubSection?: ElementNameSubSection;
    /**
     * 数据名子段
     */
    readonly dataNameSubSection?: DataNameSubSection;
}

/**
 * 子段类型 -> 子段构造函数
 */
let subSectionMap = {
    [NameType.Module]: ModuleNameSubSection,
    [NameType.Function]: FunctionNameSubSection,
    [NameType.Local]: LocalNameSubSection,
    [NameType.Label]: LabelNameSubSection,
    [NameType.Type]: TypeNameSubSection,
    [NameType.Table]: TableNameSubSection,
    [NameType.Memory]: MemoryNameSubSection,
    [NameType.Global]: GlobalNameSubSection,
    [NameType.Element]: ElementNameSubSection,
    [NameType.Data]: DataNameSubSection,
};
{
    // 设置 NameSection 中每个子段的 getter
    let keys = [
        "moduleNameSubSection",
        "functionNameSubSection",
        "localNameSubSection",
        "labelNameSubSection",
        "typeNameSubSection",
        "tableNameSubSection",
        "memoryNameSubSection",
        "globalNameSubSection",
        "elementNameSubSection",
        "dataNameSubSection"
    ];

    let props: any = {};
    for (let key of keys) {
        let Key: any = key
            .replace(/^\w/, $$ => $$.toUpperCase())
            .replace("NameSubSection", "");

        let value = NameType[Key] as any;
        props[key] = {
            get() {
                return (this.subSections as Section[]).find(it => it.type === value);
            }
        }
    }
    Object.defineProperties(NameSection.prototype, props)
}