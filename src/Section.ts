import { array, arrayInt, buf, decodeUint, decodeObject, expr, int, notIgnore, numberMap, obj, objMap, Offset, size, str, sInt, arraySint } from './encode';
import type { Module } from './Module';
import { ElementType, FuncType, ImportExportType, SectionType, Type, U32 } from './Type';

/**
 * 段
 */
abstract class Section {
    /**
     * 段类型
     */
    abstract readonly type: SectionType;
    abstract readonly size: number;
}

/**
 * 自定义段
 */
class CustomSection extends Section {
    @int
    readonly type = SectionType.CustomSection;
    @size
    readonly size!: number;
    /**
     * 自定义段名称
     */
    @str
    name!: string;
    /**
     * 自定义段内容
     */
    @buf(false)
    buffer!: ArrayBuffer;
}

/**
 * 函数类型
 */
class FunctionType {
    @sInt
    type = FuncType.func;
    @arraySint
    params!: Type[];
    @arraySint
    results!: Type[];
}

/**
 * 类型段
 */
class TypeSection extends Section {
    @int
    readonly type = SectionType.TypeSection;
    @size
    readonly size!: number;
    @array(FunctionType)
    functionTypes!: FunctionType[];
}

/**
 * 导入描述
 */
abstract class ImportDesc {
    abstract type: ImportExportType;
}

/**
 * 导入函数描述
 */
class FunctionImportDesc extends ImportDesc {
    @int
    type = ImportExportType.Function;
    @int
    typeIndex!: U32;
}

/**
 * 表格
 */
class Table {
    @sInt
    elementType!: ElementType;
    @int
    hasMax!: boolean;
    @int
    min!: U32;
    @notIgnore("hasMax")
    @int
    max?: U32;
}

/**
 * 导入表格描述
 */
class TableImportDesc extends ImportDesc {
    @int
    type = ImportExportType.Table;
    @obj(Table)
    table!: Table;
}

/**
 * 内存
 */
class Memory {
    @int
    hasMax!: boolean;
    @int
    min!: U32;
    @notIgnore("hasMax")
    @int
    max?: U32;
}

/**
 * 导入内存描述
 */
class MemoryImportDesc extends ImportDesc {
    @int
    type = ImportExportType.Memory;
    @obj(Memory)
    memory!: Memory;
}

/**
 * 全局变量
 */
class Global {
    @sInt
    valueType!: Type;
    @int
    mutable!: boolean;
    @numberMap("valueType")
    init!: number;
}

/**
 * 导入全局变量描述
 */
class GlobalImportDesc extends ImportDesc {
    @int
    type = ImportExportType.Global;
    @obj(Global)
    global!: Global;
}

/**
 * 导入项
 */
class Import {
    @str
    module!: string;
    @str
    name!: string;

    @objMap({
        [ImportExportType.Function]: FunctionImportDesc,
        [ImportExportType.Table]: TableImportDesc,
        [ImportExportType.Memory]: MemoryImportDesc,
        [ImportExportType.Global]: GlobalImportDesc,
    })
    desc!: ImportDesc;
}

/**
 * 导入段
 */
class ImportSection extends Section {
    @int
    readonly type = SectionType.ImportSection;
    @size
    readonly size!: number;
    @array(Import)
    imports!: Import[];
}

/**
 * 函数段
 */
class FunctionSection extends Section {
    @int
    readonly type = SectionType.FunctionSection;
    @size
    readonly size!: number;
    @arrayInt
    typeIndex!: U32[];
}

/**
 * 表格段
 */
class TableSection extends Section {
    @int
    readonly type = SectionType.TableSection;
    @size
    readonly size!: number;
    @obj(Table)
    tables!: Table[];
}

/**
 * 内存段
 */
class MemorySection extends Section {
    @int
    readonly type = SectionType.MemorySection;
    @size
    readonly size!: number;
    @array(Memory)
    memories!: Memory[];
}

/**
 * 全局段
 */
class GlobalSection extends Section {
    @int
    readonly type = SectionType.GlobalSection;
    @size
    readonly size!: number;
    @array(Global)
    globals!: Global[];
}

/**
 * 导出描述
 */
abstract class ExportDesc {
    abstract type: ImportExportType;
}

/**
 * 导出函数描述
 */
class FunctionExportDesc extends ExportDesc {
    @int
    type = ImportExportType.Function;
    @int
    functionIndex!: U32;
}

/**
 * 导出表格描述
 */
class TableExportDesc extends ExportDesc {
    @int
    type = ImportExportType.Table;
    @int
    tableIndex!: U32;
}

/**
 * 导出内存描述
 */
class MemoryExportDesc extends ExportDesc {
    @int
    type = ImportExportType.Memory;
    @int
    memoryIndex!: U32;
}

/**
 * 导出全局变量描述
 */
class GlobalExportDesc extends ExportDesc {
    @int
    type = ImportExportType.Global;
    @int
    globalIndex!: U32;
}

/**
 * 导出项
 */
class Export {
    @str
    name!: string;
    @objMap({
        [ImportExportType.Function]: FunctionExportDesc,
        [ImportExportType.Table]: TableExportDesc,
        [ImportExportType.Memory]: MemoryExportDesc,
        [ImportExportType.Global]: GlobalExportDesc,
    })
    desc!: ExportDesc;
}

/**
 * 导出段
 */
class ExportSection extends Section {
    @int
    readonly type = SectionType.ExportSection;
    @size
    readonly size!: number;
    @array(Export)
    exports !: Export[];
}

/**
 * 开始段
 */
class StartSection extends Section {
    @int
    readonly type = SectionType.StartSection;
    @size
    readonly size!: number;
    @int
    functionIndex!: U32;
}

/**
 * 元素项
 */
class Element {
    @int
    tableIndex!: U32;
    @expr(Type.I32)
    offset!: U32;
    @arrayInt
    functionIndexes!: U32[];
}

/**
 * 元素段
 */
class ElementSection extends Section {
    @int
    readonly type = SectionType.ElementSection;
    @size
    readonly size!: number;
    @array(Element)
    elements!: Element[];
}

/**
 * 局部变量
 */
class Local {
    @int
    count!: U32;
    @sInt
    type!: Type;
}

/**
 * 代码项
 */
class Code {
    @size
    private size!: U32;
    @array(Local)
    locals!: Local[];
    @buf(false)
    expr!: ArrayBuffer;
}

/**
 * 代码段
 */
class CodeSection extends Section {
    @int
    readonly type = SectionType.CodeSection;
    @size
    readonly size!: number;
    @array(Code)
    codes!: Code[];
}

/**
 * 数据项
 */
class Data {
    @int
    memoryIndex!: U32;
    @expr(Type.I32)
    offset!: U32;
    @buf()
    init!: ArrayBuffer;
}

/**
 * 数据段
 */
class DataSection extends Section {
    @int
    readonly type = SectionType.DataSection;
    @size
    readonly size!: number;
    @array(Data)
    datas!: Data[];
}


let sectionMap = {
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
    [SectionType.CustomSection]: CustomSection,
    [SectionType.DataSection]: DataSection,
}

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
    static fromModule(module: Module): InnerModule {
        let sections: Section[] = [
            // todo
        ];
        let res = new InnerModule(sections);
        return res;
    }
    toBuffer(): ArrayBuffer {
        // todo,
        throw new Error();
    }
    // toModule(): Module {

    // }
    private static checkMagic(buffer: ArrayBuffer, offset: Offset) {
        let length = InnerModule.magic.byteLength;
        let view = new Uint8Array(buffer);
        for (let i = 0; i < length; i++) {
            if (view[offset.value + i] !== InnerModule.magic[i]) throw new Error(`magic 不符合`);
        }
        offset.value += length
    }
    private static checkVersion(buffer: ArrayBuffer, offset: Offset) {
        let length = InnerModule.version.byteLength;
        let view = new Uint8Array(buffer);
        for (let i = 0; i < length; i++) {
            if (view[offset.value + i] !== InnerModule.version[i]) throw new Error(`version 不符合`);
        }
        offset.value += length
    }
    private static getSectionType(buffer: ArrayBuffer, offset: Offset) {
        let org = offset.value;
        let type: SectionType = decodeUint(buffer, offset);
        offset.value = org;
        return type;
    }
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

