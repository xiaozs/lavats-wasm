import { decodeUint, decodeObject, Offset, encodeObject } from './encode';
import { Module } from './Module';
import { ElementType, ImportExportType, NameType, SectionType } from './Type';
import { CodeSection, CustomSection, DataNameSubSection, DataSection, ElementNameSubSection, ElementSection, Export, ExportSection, FunctionExportDesc, FunctionImportDesc, FunctionNameSubSection, FunctionSection, FunctionType, Global, GlobalExportDesc, GlobalImportDesc, GlobalNameSubSection, GlobalSection, Import, ImportDesc, ImportSection, InitedGlobal, LabelNameSubSection, LocalNameSubSection, Memory, MemoryExportDesc, MemoryImportDesc, MemoryNameSubSection, MemorySection, ModuleNameSubSection, NameSubSection, Section, StartSection, Table, TableExportDesc, TableImportDesc, TableNameSubSection, TableSection, TypeNameSubSection, TypeSection, Element, Code, Local, Data, NameMap, IndirectNameAssociation, IndirectNameMap } from './Section';
import { Env } from './Env';
import { combin } from './utils';

/**
 * 内用模块
 */

export class InnerModule {
    static magic = new Uint8Array([0x00, 0x61, 0x73, 0x6D]);
    static version = new Uint8Array([0x01, 0x00, 0x00, 0x00]);

    private constructor(private sections: Section[]) { }
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
    private static getTypeSection(module: Module, env: Env): TypeSection | undefined {
        if (!env.types.length) return;
        let functionTypes = env.types.map(it => {
            let type = new FunctionType();
            type.params = it.params;
            type.results = it.results;
            return type;
        })
        let res = new TypeSection();
        res.functionTypes = functionTypes;
        return res;
    }
    private static getImportSection(module: Module, env: Env): ImportSection | undefined {
        if (!module.import.length) return;
        let imports = module.import.map((it) => {
            let imp = new Import();
            imp.module = it.module;
            imp.name = it.importName;
            switch (it.type) {
                case ImportExportType.Function: {
                    let desc = new FunctionImportDesc();
                    let type2 = { params: it.params ?? [], results: it.results ?? [] };
                    desc.typeIndex = env.types.findIndex(type1 => env.isSameType(type1, type2));
                    imp.desc = desc;
                    return imp;
                }
                case ImportExportType.Global: {
                    let desc = new GlobalImportDesc();
                    desc.global = new Global();
                    desc.global.valueType = it.globalType;
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
    private static getFunctionSection(module: Module, env: Env): FunctionSection | undefined {
        if (!module.function.length) return;
        let typeIndexes = module.function.map(it => {
            let type = it.getType();
            let typeIndex = env.types.findIndex(type1 => env.isSameType(type1, type));
            return typeIndex;
        });
        let res = new FunctionSection();
        res.typeIndexes = typeIndexes;
        return res;
    }
    private static getTableSection(module: Module, env: Env): TableSection | undefined {
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
    private static getMemorySection(module: Module, env: Env): MemorySection | undefined {
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
    private static getGlobalSection(module: Module, env: Env): GlobalSection | undefined {
        if (!module.global.length) return;
        let globals = module.global.map(it => {
            let global = new InitedGlobal();
            global.mutable = it.mutable ?? false;
            global.valueType = it.globalType;
            global.init = it.init;
            return global;
        });
        let res = new GlobalSection();
        res.globals = globals;
        return res;
    }
    private static getExportSection(module: Module, env: Env): ExportSection | undefined {
        if (!module.export.length) return;
        let exports = module.export.map(it => {
            let exp = new Export();
            exp.name = it.exportName;
            switch (it.type) {
                case ImportExportType.Function: {
                    let desc = new FunctionExportDesc();
                    desc.functionIndex = env.findFunctionIndex(it.index)!;
                    exp.desc = desc;
                    return exp;
                }
                case ImportExportType.Global: {
                    let desc = new GlobalExportDesc();
                    desc.globalIndex = env.findGlobalIndex(it.index)!;
                    exp.desc = desc;
                    return exp;
                }
                case ImportExportType.Memory: {
                    let desc = new MemoryExportDesc();
                    desc.memoryIndex = env.findMemoryIndex(it.index)!;
                    exp.desc = desc;
                    return exp;
                }
                case ImportExportType.Table: {
                    let desc = new TableExportDesc();
                    desc.tableIndex = env.findTableIndex(it.index)!;
                    exp.desc = desc;
                    return exp;
                }
            }
        });
        let res = new ExportSection();
        res.exports = exports;
        return res;
    }
    private static getStartSection(module: Module, env: Env): StartSection | undefined {
        if (!module.start) return;
        let res = new StartSection();
        res.functionIndex = env.findFunctionIndex(module.start)!;
        return res;
    }
    private static getElementSection(module: Module, env: Env): ElementSection | undefined {
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
    private static getCodeSection(module: Module, env: Env): CodeSection | undefined {
        if (!module.function.length) return;
        let codes = module.function.map(it => {
            let code = new Code();
            let locals = it.getLocalTypes().map(it => {
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
    private static getDataSection(module: Module, env: Env): DataSection | undefined {
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
    private static getCustomSection(module: Module, env: Env): CustomSection | undefined {
        let nameSection = NameSection.fromModule(module);
        let res = new CustomSection();
        res.name = "name";
        res.buffer = nameSection.toBuffer();
        return res;
    }

    static fromModule(module: Module, env: Env): InnerModule {
        let sections: (Section | undefined)[] = [
            this.getTypeSection(module, env),
            this.getImportSection(module, env),
            this.getFunctionSection(module, env),
            this.getTableSection(module, env),
            this.getMemorySection(module, env),
            this.getGlobalSection(module, env),
            this.getExportSection(module, env),
            this.getStartSection(module, env),
            this.getElementSection(module, env),
            this.getCodeSection(module, env),
            this.getDataSection(module, env),
            this.getCustomSection(module, env)
        ];
        let secs = sections.filter(it => it) as Section[];
        let res = new InnerModule(secs);
        return res;
    }
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
    // toModule(): Module {
    //     // todo
    // }
    private static checkMagic(buffer: ArrayBuffer, offset: Offset) {
        let length = InnerModule.magic.byteLength;
        let view = new Uint8Array(buffer);
        for (let i = 0; i < length; i++) {
            if (view[offset.value + i] !== InnerModule.magic[i])
                throw new Error(`magic 不符合`);
        }
        offset.value += length;
    }
    private static checkVersion(buffer: ArrayBuffer, offset: Offset) {
        let length = InnerModule.version.byteLength;
        let view = new Uint8Array(buffer);
        for (let i = 0; i < length; i++) {
            if (view[offset.value + i] !== InnerModule.version[i])
                throw new Error(`version 不符合`);
        }
        offset.value += length;
    }
    private static getSectionType(buffer: ArrayBuffer, offset: Offset) {
        let org = offset.value;
        let type: SectionType = decodeUint(buffer, offset);
        offset.value = org;
        return type;
    }
    getCustomSections(name?: string): CustomSection[] {
        let secArr = this.sections.filter(it => it.type === SectionType.CustomSection) as CustomSection[];
        if (name !== undefined) {
            return secArr;
        } else {
            return secArr.filter(it => it.name === name);
        }
    }
}


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
    readonly typeSection?: TypeSection;
    readonly importSection?: ImportSection;
    readonly functionSection?: FunctionSection;
    readonly tableSection?: TableSection;
    readonly memorySection?: MemorySection;
    readonly globalSection?: GlobalSection;
    readonly exportSection?: ExportSection;
    readonly startSection?: StartSection;
    readonly elementSection?: ElementSection;
    readonly codeSection?: CodeSection;
    readonly dataSection?: DataSection;
}
{
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
    private constructor(private subSections: NameSubSection[]) { }
    static fromModule(module: Module): NameSection {
        let secs = [
            this.getModuleNameSubSection(module),
            this.getNameSubSection(module, "function"),
            this.getLocalNameSubSection(module),
            this.getLabelNameSubSection(module),
            this.getNameSubSection(module, "type"),
            this.getNameSubSection(module, "table"),
            this.getNameSubSection(module, "memory"),
            this.getNameSubSection(module, "global"),
            this.getNameSubSection(module, "element"),
            this.getNameSubSection(module, "data")
        ];

        let subSections = secs.filter(it => it) as NameSubSection[];

        return new NameSection(subSections);
    }

    private static getModuleNameSubSection(module: Module): ModuleNameSubSection | undefined {
        if (module.name) {
            let sec = new ModuleNameSubSection();
            sec.name = module.name;
            return sec;
        }
    }

    private static getLocalNameSubSection(module: Module): LocalNameSubSection | undefined {
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

    private static getLabelNameSubSection(module: Module): LabelNameSubSection | undefined {
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

    private static getNameSubSection(module: Module, type: "function" | "type" | "table" | "memory" | "global" | "element" | "data"): NameSubSection | undefined {
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
        if (importType) {
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

    private static getSubSectionType(buffer: ArrayBuffer, offset: Offset) {
        let org = offset.value;
        let type: NameType = decodeUint(buffer, offset);
        offset.value = org;
        return type;
    }
    toBuffer(): ArrayBuffer {
        let res: ArrayBuffer[] = [];
        for (let it of this.subSections) {
            let buf = encodeObject(it);
            res.push(buf);
        }
        return combin(res);
    }
    toCustomSection(): CustomSection {
        let res = new CustomSection();
        res.name = "name";
        res.buffer = this.toBuffer();
        return res;
    }
}

export interface NameSection {
    readonly moduleNameSubSection?: ModuleNameSubSection;
    readonly functionNameSubSection?: FunctionNameSubSection;
    readonly localNameSubSection?: LocalNameSubSection;
    readonly labelNameSubSection?: LabelNameSubSection;
    readonly typeNameSubSection?: TypeNameSubSection;
    readonly tableNameSubSection?: TableNameSubSection;
    readonly memoryNameSubSection?: MemoryNameSubSection;
    readonly globalNameSubSection?: GlobalNameSubSection;
    readonly elementNameSubSection?: ElementNameSubSection;
    readonly dataNameSubSection?: DataNameSubSection;
}

export let subSectionMap = {
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
        let Key = key.replace(/^\w/, $$ => $$.toUpperCase()) as any;
        let value = NameType[Key] as any;
        props[key] = {
            get() {
                return (this.subSections as Section[]).find(it => it.type === value);
            }
        }
    }
    Object.defineProperties(NameSection.prototype, props)
}