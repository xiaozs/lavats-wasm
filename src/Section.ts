import { array, arrayInt, buf, expr, uint, notIgnore, numberMap, obj, objMap, size, str, sint, arraySint, decodeObject } from './encode';
import { NameSection } from './InnerModule';
import { ElementType, FuncType, ImportExportType, NameType, SectionType, Type, U32 } from './Type';

/**
 * 段
 */
export abstract class Section {
    @uint
    abstract readonly type: SectionType;
    @size
    readonly size!: number;
}

/**
 * 自定义段
 */
export class CustomSection extends Section {
    readonly type = SectionType.CustomSection;
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

    toNameSection(): NameSection {
        if (this.name !== "name") throw new Error("此段并非名称段");
        return NameSection.fromBuffer(this.buffer);
    }
}

/**
 * 函数类型
 */
export class FunctionType {
    @sint
    type = FuncType.func;
    @arraySint
    params!: Type[];
    @arraySint
    results!: Type[];
}

/**
 * 类型段
 */
export class TypeSection extends Section {
    readonly type = SectionType.TypeSection;
    @array(FunctionType)
    functionTypes!: FunctionType[];
}

/**
 * 导入描述
 */
export abstract class ImportDesc {
    @uint
    abstract type: ImportExportType;
}

/**
 * 导入函数描述
 */
export class FunctionImportDesc extends ImportDesc {
    type = ImportExportType.Function;
    @uint
    typeIndex!: U32;
}

/**
 * 表格
 */
export class Table {
    @sint
    elementType!: ElementType;
    @uint
    hasMax!: boolean;
    @uint
    min!: U32;
    @notIgnore("hasMax")
    @uint
    max?: U32;
}

/**
 * 导入表格描述
 */
export class TableImportDesc extends ImportDesc {
    type = ImportExportType.Table;
    @obj(Table)
    table!: Table;
}

/**
 * 内存
 */
export class Memory {
    @uint
    hasMax!: boolean;
    @uint
    min!: U32;
    @notIgnore("hasMax")
    @uint
    max?: U32;
}

/**
 * 导入内存描述
 */
export class MemoryImportDesc extends ImportDesc {
    type = ImportExportType.Memory;
    @obj(Memory)
    memory!: Memory;
}

/**
 * 全局变量
 */
export class Global {
    @sint
    valueType!: Type;
    @uint
    mutable!: boolean;
    @numberMap("valueType")
    init!: number;
}

/**
 * 导入全局变量描述
 */
export class GlobalImportDesc extends ImportDesc {
    type = ImportExportType.Global;
    @obj(Global)
    global!: Global;
}

/**
 * 导入项
 */
export class Import {
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
export class ImportSection extends Section {
    readonly type = SectionType.ImportSection;
    @array(Import)
    imports!: Import[];
}

/**
 * 函数段
 */
export class FunctionSection extends Section {
    readonly type = SectionType.FunctionSection;
    @arrayInt
    typeIndex!: U32[];
}

/**
 * 表格段
 */
export class TableSection extends Section {
    readonly type = SectionType.TableSection;
    @obj(Table)
    tables!: Table[];
}

/**
 * 内存段
 */
export class MemorySection extends Section {
    readonly type = SectionType.MemorySection;
    @array(Memory)
    memories!: Memory[];
}

/**
 * 全局段
 */
export class GlobalSection extends Section {
    readonly type = SectionType.GlobalSection;
    @array(Global)
    globals!: Global[];
}

/**
 * 导出描述
 */
export abstract class ExportDesc {
    @uint
    abstract type: ImportExportType;
}

/**
 * 导出函数描述
 */
export class FunctionExportDesc extends ExportDesc {
    type = ImportExportType.Function;
    @uint
    functionIndex!: U32;
}

/**
 * 导出表格描述
 */
export class TableExportDesc extends ExportDesc {
    type = ImportExportType.Table;
    @uint
    tableIndex!: U32;
}

/**
 * 导出内存描述
 */
export class MemoryExportDesc extends ExportDesc {
    type = ImportExportType.Memory;
    @uint
    memoryIndex!: U32;
}

/**
 * 导出全局变量描述
 */
export class GlobalExportDesc extends ExportDesc {
    type = ImportExportType.Global;
    @uint
    globalIndex!: U32;
}

/**
 * 导出项
 */
export class Export {
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
export class ExportSection extends Section {
    readonly type = SectionType.ExportSection;
    @array(Export)
    exports !: Export[];
}

/**
 * 开始段
 */
export class StartSection extends Section {
    readonly type = SectionType.StartSection;
    @uint
    functionIndex!: U32;
}

/**
 * 元素项
 */
export class Element {
    @uint
    tableIndex!: U32;
    @expr(Type.I32)
    offset!: U32;
    @arrayInt
    functionIndexes!: U32[];
}

/**
 * 元素段
 */
export class ElementSection extends Section {
    readonly type = SectionType.ElementSection;
    @array(Element)
    elements!: Element[];
}

/**
 * 局部变量
 */
export class Local {
    @uint
    count!: U32;
    @sint
    type!: Type;
}

/**
 * 代码项
 */
export class Code {
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
export class CodeSection extends Section {
    readonly type = SectionType.CodeSection;
    @array(Code)
    codes!: Code[];
}

/**
 * 数据项
 */
export class Data {
    @uint
    memoryIndex!: U32;
    @expr(Type.I32)
    offset!: U32;
    @buf()
    init!: ArrayBuffer;
}

/**
 * 数据段
 */
export class DataSection extends Section {
    readonly type = SectionType.DataSection;
    @array(Data)
    datas!: Data[];
}

/**
 * 名称子段
 */
export abstract class NameSubSection {
    @uint
    abstract readonly type: NameType;
    @size
    readonly size!: number;
}

/**
 * 名称映射
 */
export class NameMap {
    @uint
    index!: U32;
    @str
    name!: string;
}

/**
 * 简介名称关系
 */
export class IndirectNameAssociation {
    @uint
    index!: U32;
    @array(NameMap)
    names!: NameMap[];
}

/**
 * 间接名称映射
 */
export class IndirectNameMap {
    @array(IndirectNameAssociation)
    associations!: IndirectNameAssociation[];
}

/**
 * 模块名子段
 */
export class ModuleNameSubSection extends NameSubSection {
    readonly type = NameType.Module;
    @str
    name!: string;
}
/**
 * 函数名子段
 */
export class FunctionNameSubSection extends NameSubSection {
    readonly type = NameType.Function;
    @obj(NameMap)
    names!: NameMap;
}
/**
 * 局部变量名子段
 */
export class LocalNameSubSection extends NameSubSection {
    readonly type = NameType.Local;
    @obj(IndirectNameMap)
    names!: IndirectNameMap;
}
/**
 * 标签名子段
 */
export class LabelNameSubSection extends NameSubSection {
    readonly type = NameType.Label;
    // todo
    @buf(false)
    buffer!: ArrayBuffer;
}
/**
 * 类型名子段
 */
export class TypeNameSubSection extends NameSubSection {
    readonly type = NameType.Type;
    @obj(NameMap)
    names!: NameMap;
}
/**
 * 表格名子段
 */
export class TableNameSubSection extends NameSubSection {
    readonly type = NameType.Table;
    @obj(NameMap)
    names!: NameMap;
}
/**
 * 内存名子段
 */
export class MemoryNameSubSection extends NameSubSection {
    readonly type = NameType.Memory;
    @obj(NameMap)
    names!: NameMap;
}
/**
 * 全局变量名子段
 */
export class GlobalNameSubSection extends NameSubSection {
    readonly type = NameType.Global;
    @obj(NameMap)
    names!: NameMap;
}
/**
 * 元素名子段
 */
export class ElementNameSubSection extends NameSubSection {
    readonly type = NameType.Element;
    @obj(NameMap)
    names!: NameMap;
}
/**
 * 数据名子段
 */
export class DataNameSubSection extends NameSubSection {
    readonly type = NameType.Data;
    @obj(NameMap)
    names!: NameMap;
}