import { ImportExportType, Module, Type } from "../src";

let m = new Module({
    name: "module",
    memory: [
        { "name": "memory", "min": 0 }
    ],
    data: [
        { "name": "data", "offset": 0, "memoryIndex": 0, "init": Buffer.alloc(10) }
    ],
    global: [
        { "name": "global", "globalType": Type.I32, "init": 0 }
    ],
    import: [
        { name: "test", "module": "js", "importName": "test", "type": ImportExportType.Memory, "min": 0 }
    ],
    export: [
        { "exportName": "js", "type": ImportExportType.Memory, index: "test" }
    ]
});
m.check();