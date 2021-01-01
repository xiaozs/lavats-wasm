import { decodeUint, decodeObject, Offset, combin, encodeObject } from './encode';
import { Module } from './Module';
import { ElementType, ImportExportType, NameType, SectionType } from './Type';
import { CodeSection, CustomSection, DataNameSubSection, DataSection, ElementNameSubSection, ElementSection, Export, ExportSection, FunctionExportDesc, FunctionImportDesc, FunctionNameSubSection, FunctionSection, FunctionType, Global, GlobalExportDesc, GlobalImportDesc, GlobalNameSubSection, GlobalSection, Import, ImportDesc, ImportSection, InitedGlobal, LabelNameSubSection, LocalNameSubSection, Memory, MemoryExportDesc, MemoryImportDesc, MemoryNameSubSection, MemorySection, ModuleNameSubSection, NameSubSection, Section, StartSection, Table, TableExportDesc, TableImportDesc, TableNameSubSection, TableSection, TypeNameSubSection, TypeSection, Element, Code, Local, Data } from './Section';
import { Env } from './Env';

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
        let functionTypes = env.types.map(it => {
            let type = new FunctionType();
            type.params = it.params;
            type.results = it.results;
            return type;
        })
        if (!functionTypes.length) return;
        let res = new TypeSection();
        res.functionTypes = functionTypes;
        return res;
    }
    private static getImportSection(module: Module, env: Env): ImportSection | undefined {
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
        if (!imports.length) return;
        let res = new ImportSection();
        res.imports = imports;
        return res;
    }
    private static getFunctionSection(module: Module, env: Env): FunctionSection | undefined {
        let typeIndex = module.function.map(it => {
            let type = it.getType();
            let typeIndex = env.types.findIndex(type1 => env.isSameType(type1, type));
            return typeIndex;
        });
        if (!typeIndex.length) return;
        let res = new FunctionSection();
        res.typeIndex = typeIndex;
        return res;
    }
    private static getTableSection(module: Module, env: Env): TableSection | undefined {
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
        if (!tables.length) return;
        let res = new TableSection();
        res.tables = tables;
        return res;
    }
    private static getMemorySection(module: Module, env: Env): MemorySection | undefined {
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
        if (!memories.length) return;
        let res = new MemorySection();
        res.memories = memories;
        return res;
    }
    private static getGlobalSection(module: Module, env: Env): GlobalSection | undefined {
        let globals = module.global.map(it => {
            let global = new InitedGlobal();
            global.mutable = it.mutable ?? false;
            global.valueType = it.globalType;
            global.init = it.init;
            return global;
        });
        if (!globals.length) return;
        let res = new GlobalSection();
        res.globals = globals;
        return res;
    }
    private static getExportSection(module: Module, env: Env): ExportSection | undefined {
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
        if (!exports.length) return;
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
        let elements = module.element.map(it => {
            let elemet = new Element();
            elemet.tableIndex = env.findTableIndex(it.tableIndex)!;
            elemet.offset = it.offset;
            elemet.functionIndexes = it.functionIndexes.map(idx => env.findFunctionIndex(idx)!);
            return elemet;
        })
        if (!elements.length) return;
        let res = new ElementSection();
        res.elements = elements;
        return res;
    }
    private static getCodeSection(module: Module, env: Env): CodeSection | undefined {
        let codes = module.function.map(it => {
            let code = new Code();
            let locals = it.getLocalTypes().map(it => {
                let local = new Local();
                local.count = it.count;
                local.type = it.type;
                return local;
            });
            code.locals = locals;
            code.expr = it.toBuffer();
            return code;
        });
        if (!codes.length) return;
        let res = new CodeSection();
        res.codes = codes;
        return res;
    }
    private static getDataSection(module: Module, env: Env): DataSection | undefined {
        let datas = module.data.map(it => {
            let data = new Data();
            data.memoryIndex = env.findMemoryIndex(it.memoryIndex)!;
            data.offset = it.offset;
            data.init = it.init;
            return data;
        })
        if (!datas.length) return;
        let res = new DataSection();
        res.datas = datas;
        return res;
    }
    private static getCustomSection(module: Module, env: Env): DataSection | undefined {
        let nameSection = new NameSection();

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

export interface NameOption {

}

/**
 * 名称段
 */
export class NameSection {
    private constructor(private subSections: NameSubSection[]) { }
    static fromOption(option: NameOption) {
        let subSections: NameSubSection[] = [];
        // todo
        return new NameSection(subSections);
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