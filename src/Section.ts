import { array, arrayUint, buf, expr, uint, notIgnore, exprMap, obj, objMap, size, str, sint, arraySint } from './encode';
import { NameSection } from './InnerModule';
import { DataOption, ElementOption, ElementType, ExportOption, FuncType, GlobalOption, ImportExportType, ImportOption, MemoryOption, NameType, SectionType, TableOption, Type, TypeOption, U32 } from './Type';

/**
 * 段
 */
export abstract class Section {
    /**
     * 段类型
     */
    @uint
    abstract readonly type: SectionType;
    /**
     * 段的大小
     */
    @size
    private size!: number;
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

    /**
     * 转化为NameSection
     */
    toNameSection(): NameSection {
        if (this.name !== "name") throw new Error("此段并非名称段");
        return NameSection.fromBuffer(this.buffer);
    }
}

/**
 * 函数类型
 */
export class FunctionType {
    /**
     * 类型
     */
    @sint
    type = FuncType.func;
    /**
     * 入参
     */
    @arraySint
    params!: Type[];
    /**
     * 结果
     */
    @arraySint
    results!: Type[];
}

/**
 * 类型段
 */
export class TypeSection extends Section {
    readonly type = SectionType.TypeSection;

    /**
     * 函数类型
     */
    @array(FunctionType)
    functionTypes!: FunctionType[];

    /**
     * 生成类型配置
     * @param nameSec 名称段
     */
    getTypes(nameSec?: NameSection): TypeOption[] {
        return this.functionTypes.map((it, i) => {
            return {
                name: nameSec?.typeNameSubSection?.names.find(it => it.index === i)?.name,
                params: it.params,
                results: it.results,
            }
        });
    }
}

/**
 * 导入描述
 */
export abstract class ImportDesc {
    /**
     * 导入类型
     */
    @uint
    abstract type: ImportExportType;
}

/**
 * 导入函数描述
 */
export class FunctionImportDesc extends ImportDesc {
    type = ImportExportType.Function;
    /**
     * 导入函数的类型的索引
     */
    @uint
    typeIndex!: U32;
}

/**
 * 表格
 */
export class Table {
    /**
     * 元素类型
     */
    @sint
    elementType!: ElementType;
    /**
     * 表格是否有最大值
     */
    @uint
    hasMax!: boolean;
    /**
     * 表格最小值
     */
    @uint
    min!: U32;
    /**
     * 表格最大值
     */
    @uint
    @notIgnore("hasMax")
    max?: U32;
}

/**
 * 导入表格描述
 */
export class TableImportDesc extends ImportDesc {
    type = ImportExportType.Table;

    /**
     * 表格配置
     */
    @obj(Table)
    table!: Table;
}

/**
 * 内存
 */
export class Memory {
    /**
     * 是否有最大值
     */
    @uint
    hasMax!: boolean;
    /**
     * 最小值
     */
    @uint
    min!: U32;
    /**
     * 最大值
     */
    @uint
    @notIgnore("hasMax")
    max?: U32;
}

/**
 * 导入内存描述
 */
export class MemoryImportDesc extends ImportDesc {
    type = ImportExportType.Memory;
    /**
     * 内存配置
     */
    @obj(Memory)
    memory!: Memory;
}

/**
 * 全局变量
 */
export class Global {
    /**
     * 变量类型
     */
    @sint
    valueType!: Type;
    /**
     * 是否可修改
     */
    @uint
    mutable!: boolean;
}

/**
 * 全局变量
 */
export class InitedGlobal extends Global {
    /**
     * 初始值
     */
    @exprMap("valueType")
    init!: number;
}

/**
 * 导入全局变量描述
 */
export class GlobalImportDesc extends ImportDesc {
    type = ImportExportType.Global;

    /**
     * 全局变量的配置
     */
    @obj(Global)
    global!: Global;
}

/**
 * 导入项
 */
export class Import {
    /**
     * 导出的模块名称
     */
    @str
    module!: string;
    /**
     * 导入的字段名称
     */
    @str
    name!: string;

    /**
     * 导入项的描述
     */
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

    /**
     * 导入项
     */
    @array(Import)
    imports!: Import[];

    /**
     * 获取导入项配置
     * @param types 所有函数类型
     */
    getImportOptions(types: TypeOption[]): ImportOption[] {
        return this.imports.map(it => {
            let common = {
                module: it.module,
                importName: it.name,
                type: it.desc.type,
            };

            switch (it.desc.type) {
                case ImportExportType.Function: {
                    let desc = it.desc as FunctionImportDesc;
                    let t = types[desc.typeIndex];
                    if (!t) throw new Error(`type ${desc.typeIndex}: 不存在该类型`);
                    return {
                        ...common,
                        params: t.params,
                        results: t.results,
                    }
                }
                case ImportExportType.Table: {
                    let desc = it.desc as TableImportDesc;
                    return {
                        ...common,
                        elementType: desc.table.elementType,
                        min: desc.table.min,
                        max: desc.table.max,
                    }
                }
                case ImportExportType.Memory: {
                    let desc = it.desc as MemoryImportDesc;
                    return {
                        ...common,
                        min: desc.memory.min,
                        max: desc.memory.max,
                    }
                }
                case ImportExportType.Global: {
                    let desc = it.desc as GlobalImportDesc;
                    return {
                        ...common,
                        valueType: desc.global.valueType,
                        mutable: desc.global.mutable,
                    }
                }
            }
        }) as ImportOption[];
    }
}

/**
 * 函数段
 */
export class FunctionSection extends Section {
    readonly type = SectionType.FunctionSection;

    /**
     * 函数的类型的索引
     */
    @arrayUint
    typeIndexes!: U32[];
}

/**
 * 表格段
 */
export class TableSection extends Section {
    readonly type = SectionType.TableSection;

    /**
     * 表格
     */
    @array(Table)
    tables!: Table[];

    /**
     * 获取表格的配置
     */
    getTableOptions(): TableOption[] {
        return this.tables.map(it => {
            return {
                elementType: it.elementType,
                min: it.min,
                max: it.max,
            }
        })
    }
}

/**
 * 内存段
 */
export class MemorySection extends Section {
    readonly type = SectionType.MemorySection;

    /**
     * 内存
     */
    @array(Memory)
    memories!: Memory[];

    /**
     * 获取内存的配置
     */
    getMemoryOptions(): MemoryOption[] {
        return this.memories.map(it => {
            return {
                min: it.min,
                max: it.max,
            }
        })
    }
}

/**
 * 全局段
 */
export class GlobalSection extends Section {
    readonly type = SectionType.GlobalSection;

    /**
     * 全局变量
     */
    @array(InitedGlobal)
    globals!: InitedGlobal[];

    /**
     * 获取全局变量的配置
     */
    getGlobalOptions(): GlobalOption[] {
        return this.globals.map(it => {
            return {
                valueType: it.valueType,
                mutable: it.mutable,
                init: it.init
            } as GlobalOption;
        })
    }
}

/**
 * 导出描述
 */
export abstract class ExportDesc {
    /**
     * 导入项的类型
     */
    @uint
    abstract type: ImportExportType;
    /**
     * 导入项对应的索引
     */
    @uint
    index!: U32;
}

/**
 * 导出函数描述
 */
export class FunctionExportDesc extends ExportDesc {
    type = ImportExportType.Function;
}

/**
 * 导出表格描述
 */
export class TableExportDesc extends ExportDesc {
    type = ImportExportType.Table;
}

/**
 * 导出内存描述
 */
export class MemoryExportDesc extends ExportDesc {
    type = ImportExportType.Memory;
}

/**
 * 导出全局变量描述
 */
export class GlobalExportDesc extends ExportDesc {
    type = ImportExportType.Global;
}

/**
 * 导出项
 */
export class Export {
    /**
     * 导出的字段名称
     */
    @str
    name!: string;

    /**
     * 导出项的描述
     */
    @objMap({
        [ImportExportType.Function]: FunctionExportDesc,
        [ImportExportType.Table]: TableExportDesc,
        [ImportExportType.Memory]: MemoryExportDesc,
        [ImportExportType.Global]: GlobalExportDesc,
    })
    desc!: ExportDesc;
}

/**
 * 单个能导出的项目
 */
export interface IndexListItem {
    name?: string;
}

/**
 * 所有能导出的项目
 */
export interface IndexList {
    /**
     * 所有的函数
     */
    functions: IndexListItem[];
    /**
     * 所有的表格
     */
    tables: IndexListItem[];
    /**
     * 所有的内存
     */
    memories: IndexListItem[];
    /**
     * 所有的全局变量
     */
    globals: IndexListItem[];
}

/**
 * 导出段
 */
export class ExportSection extends Section {
    readonly type = SectionType.ExportSection;
    @array(Export)
    exports !: Export[];

    /**
     * 
     * @param opt 所有能导出的项目
     */
    getExportOptions(opt: IndexList): ExportOption[] {
        return this.exports.map(it => {
            let common = {
                exportName: it.name
            }
            let map = {
                [ImportExportType.Function]: "functions",
                [ImportExportType.Table]: "tables",
                [ImportExportType.Memory]: "memories",
                [ImportExportType.Global]: "globals",
            }

            let { type, index } = it.desc;
            let key = map[type] as keyof IndexList;
            let idx = opt[key][index].name ?? index;

            return {
                ...common,
                type,
                index: idx
            }
        });
    }
}

/**
 * 开始段
 */
export class StartSection extends Section {
    readonly type = SectionType.StartSection;

    /**
     * 函数的索引
     */
    @uint
    functionIndex!: U32;
}

/**
 * 元素项
 */
export class Element {
    /**
     * 表格的索引
     */
    @uint
    tableIndex!: U32;

    /**
     * 偏移
     */
    @expr(Type.I32)
    offset!: U32;

    /**
     * 写入的函数的索引
     */
    @arrayUint
    functionIndexes!: U32[];
}

/**
 * 元素段
 */
export class ElementSection extends Section {
    readonly type = SectionType.ElementSection;

    /**
     * 元素项
     */
    @array(Element)
    elements!: Element[];

    /**
     * 获取元素项配置
     * @param nameSec 名称段
     */
    getElementOptions(nameSec?: NameSection): ElementOption[] {
        return this.elements.map((it, i) => {
            return {
                name: nameSec?.elementNameSubSection?.names.find(it => it.index === i)?.name,
                tableIndex: it.tableIndex,
                offset: it.offset,
                functionIndexes: it.functionIndexes,
            }
        })
    }
}

/**
 * 局部变量
 */
export class Local {
    /**
     * 个数
     */
    @uint
    count!: U32;
    /**
     * 类型
     */
    @sint
    type!: Type;
}

/**
 * 代码项
 */
export class Code {
    /**
     * 代码项的大小
     */
    @size
    private size!: U32;

    /**
     * 局部变量
     */
    @array(Local)
    locals!: Local[];

    /**
     * 代码内容对应的缓存
     */
    @buf(false)
    expr!: ArrayBuffer;

    /**
     * 获取代码的局部变量类型
     */
    getLocalTypes() {
        let res: Type[] = [];
        for (let { count, type } of this.locals) {
            for (let i = 0; i < count; i++) {
                res.push(type);
            }
        }
        return res;
    }
}

/**
 * 代码段
 */
export class CodeSection extends Section {
    readonly type = SectionType.CodeSection;

    /**
     * 代码项
     */
    @array(Code)
    codes!: Code[];
}

/**
 * 数据项
 */
export class Data {
    /**
     * 内存的索引
     */
    @uint
    memoryIndex!: U32;

    /**
     * 偏移
     */
    @expr(Type.I32)
    offset!: U32;

    /**
     * 写入的数据内容
     */
    @buf()
    init!: ArrayBuffer;
}

/**
 * 数据段
 */
export class DataSection extends Section {
    readonly type = SectionType.DataSection;

    /**
     * 数据项
     */
    @array(Data)
    datas!: Data[];

    /**
     * 获取数据项配置
     * @param nameSec 名称段
     */
    getDataOptions(nameSec?: NameSection): DataOption[] {
        return this.datas.map((it, i) => {
            return {
                name: nameSec?.dataNameSubSection?.names.find(it => it.index === i)?.name,
                memoryIndex: it.memoryIndex,
                offset: it.offset,
                init: it.init,
            }
        });
    }
}

/**
 * 名称子段
 */
export abstract class NameSubSection {
    /**
     * 子段类型
     */
    @uint
    abstract readonly type: NameType;
    /**
     * 字段的大小
     */
    @size
    private size!: number;
}

/**
 * 名称映射
 */
export class NameMap {
    /**
     * 索引
     */
    @uint
    index!: U32;
    /**
     * 名称
     */
    @str
    name!: string;
}

/**
 * 间接名称关系
 */
export class IndirectNameAssociation {
    /**
     * 索引
     */
    @uint
    index!: U32;

    /**
     * 名称映射
     */
    @array(NameMap)
    names!: NameMap[];
}

/**
 * 间接名称映射
 */
export class IndirectNameMap {
    /**
     * 映射关系
     */
    @array(IndirectNameAssociation)
    associations!: IndirectNameAssociation[];
}

/**
 * 模块名子段
 */
export class ModuleNameSubSection extends NameSubSection {
    readonly type = NameType.Module;
    /**
     * 模块名
     */
    @str
    name!: string;
}

/**
 * 直接映射名称段
 */
export abstract class NameMapSubSection extends NameSubSection {
    /**
     * 名称映射
     */
    @array(NameMap)
    names!: NameMap[];
}

/**
 * 间接映射名称段
 */
export abstract class IndirectNameMapSubSection extends NameSubSection {
    /**
     * 间接名称映射
     */
    @obj(IndirectNameMap)
    names!: IndirectNameMap;
}

/**
 * 函数名子段
 */
export class FunctionNameSubSection extends NameMapSubSection {
    readonly type = NameType.Function;
}
/**
 * 局部变量名子段
 */
export class LocalNameSubSection extends IndirectNameMapSubSection {
    readonly type = NameType.Local;
}
/**
 * 标签名子段
 */
export class LabelNameSubSection extends IndirectNameMapSubSection {
    readonly type = NameType.Label;
}
/**
 * 类型名子段
 */
export class TypeNameSubSection extends NameMapSubSection {
    readonly type = NameType.Type;
}
/**
 * 表格名子段
 */
export class TableNameSubSection extends NameMapSubSection {
    readonly type = NameType.Table;
}
/**
 * 内存名子段
 */
export class MemoryNameSubSection extends NameMapSubSection {
    readonly type = NameType.Memory;
}
/**
 * 全局变量名子段
 */
export class GlobalNameSubSection extends NameMapSubSection {
    readonly type = NameType.Global;
}
/**
 * 元素名子段
 */
export class ElementNameSubSection extends NameMapSubSection {
    readonly type = NameType.Element;
}
/**
 * 数据名子段
 */
export class DataNameSubSection extends NameMapSubSection {
    readonly type = NameType.Data;
}