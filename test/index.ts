import { readFile, readFileSync, writeFileSync } from "fs";
import { BlockType, Code, Func, ImportExportType, Module, Type, ElementType, data } from "../src";

import { InnerModule } from "../src/InnerModule";

let m = new Module({
    name: "module",
    // memory: [
    //     { "name": "memory", "min": 0 }
    // ],
    data: [
        { "name": "data", "offset": 0, "memoryIndex": 0, "init": data.i64(10).toBuffer() }
    ],
    table: [
        { "name": "table", "elementType": ElementType.funcref, "min": 0 }
    ],
    element: [
        { "name": "element", "tableIndex": 0, "offset": 0, functionIndexes: [] }
    ],
    import: [
        { name: "test", "module": "js", "importName": "test", "type": ImportExportType.Memory, "min": 0 }
    ],
    export: [
        { "exportName": "js", "type": ImportExportType.Memory, index: "test" }
    ],
    type: [
        { name: "ifBlock", params: [Type.I32], results: [] }
    ],
    global: [
        { "name": "global", "valueType": Type.I32, "init": 0 }
    ],
    start: "func",
    function: [
        new Func({
            name: "func",
            params: [{ type: Type.I32, name: "p1" }],
            locals: [{ type: Type.I32, name: "l1" }],
            codes: [
                Code.block({
                    label: "block",
                    type: BlockType.I32,
                    codes: [
                        Code.block({
                            label: "block2",
                            type: BlockType.Empty
                        }),
                        Code.i32.Const(50)
                    ]
                }),
                Code.i32.Const(10),
                Code.If({
                    label: "if",
                    type: "ifBlock",
                    then: [
                        Code.drop,
                        Code.Return
                    ],
                    else: [
                        Code.drop
                    ]
                })
            ]
        })
    ]
});
let mBuf = m.toBuffer();

// let buffer = readFileSync("./test/test.wasm");
// let buffer = writeFileSync("./test/test2.wasm", new Uint8Array(mBuf));
let test = InnerModule.fromBuffer(mBuf);
let nm = test.toModule();
let [customSec] = test.getCustomSections("name");
let nameSec = customSec?.toNameSection();
let buf = nameSec.toBuffer();
debugger;