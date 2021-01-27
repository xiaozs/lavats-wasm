import { readFile, readFileSync, writeFileSync } from "fs";
import { BlockType, Code, Func, ImportExportType, Module, Type, ElementType, data, DataType } from "../src";

import { InnerModule } from "../src/InnerModule";
import { watParser } from "../src/wat";

let m = new Module({
    name: "module",
    memory: [
        { name: "memory", min: 0 }
    ],
    data: [
        { name: "data", offset: 0, memoryIndex: 0, init: data.i64(10).string("test").i64(10).toBuffer() }
    ],
    table: [
        { name: "table", elementType: ElementType.funcref, min: 0 }
    ],
    element: [
        { name: "element", tableIndex: 0, offset: 0, functionIndexes: [0] }
    ],
    import: [
        { name: "test", module: "js", importName: "test", type: ImportExportType.Memory, min: 0 },
        { name: "imFunc", module: "js", importName: "imFunc", type: ImportExportType.Function }
    ],
    export: [
        { exportName: "js", type: ImportExportType.Memory, index: "test" }
    ],
    type: [
        { name: "ifBlock", params: [Type.I32], results: [] }
    ],
    global: [
        { name: "global", valueType: Type.I32, init: 0 }
    ],
    start: "start",
    function: [
        new Func({ name: "start" }),
        new Func({
            name: "func",
            params: [{ type: Type.I32, name: "p1" }],
            locals: [{ type: Type.I32, name: "l1" }],
            codes: [
                Code.block({
                    label: "block",
                    type: { results: [Type.I32] },
                    codes: [
                        Code.i32.Const(50)
                    ]
                }),
                Code.i32.Const(10),
                Code.If({
                    label: "if",
                    type: { params: [Type.I32] },
                    then: [
                        Code.drop,
                        Code.br(0)
                    ],
                    else: [
                        Code.drop
                    ]
                })
            ]
        })
    ],
    custom: [
        { name: "hello", buffer: data.string("hello").toBuffer() }
    ]
});
let mBuf = m.toBuffer();
let wat = m.toString();
console.log(wat);

// let buffer = readFileSync("./test/test.wasm");
// let buffer = writeFileSync("./test/test2.wasm", new Uint8Array(mBuf));
let test = InnerModule.fromBuffer(mBuf);
let nm = test.toModule();
wat = nm.toString();
console.log(wat)
let [customSec] = test.getCustomSections("name");
let nameSec = customSec?.toNameSection();
let buf = nameSec.toBuffer();
debugger;

let astRes = watParser.match(wat, false);

debugger