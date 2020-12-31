import { decodeUint, decodeObject, Offset, encodeArray, combin, encodeObject } from './encode';
import { Module } from './Module';
import { NameType, SectionType } from './Type';
import { CodeSection, CustomSection, DataNameSubSection, DataSection, ElementNameSubSection, ElementSection, ExportSection, FunctionNameSubSection, FunctionSection, GlobalNameSubSection, GlobalSection, ImportSection, LabelNameSubSection, LocalNameSubSection, MemoryNameSubSection, MemorySection, ModuleNameSubSection, NameSubSection, Section, StartSection, TableNameSubSection, TableSection, TypeNameSubSection, TypeSection } from './Section';

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
    [SectionType.CustomSection]: CustomSection,
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