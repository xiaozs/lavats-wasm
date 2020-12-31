import { readFile, readFileSync } from "fs";
import { BlockType, Code, Func, ImportExportType, Module, Type } from "../src";

import { InnerModule } from "../src/InnerModule";

// let m = new Module({
//     name: "module",
//     memory: [
//         { "name": "memory", "min": 0 }
//     ],
//     data: [
//         { "name": "data", "offset": 0, "memoryIndex": 0, "init": Buffer.alloc(10) }
//     ],
//     global: [
//         { "name": "global", "globalType": Type.I32, "init": 0 }
//     ],
//     import: [
//         { name: "test", "module": "js", "importName": "test", "type": ImportExportType.Memory, "min": 0 }
//     ],
//     export: [
//         { "exportName": "js", "type": ImportExportType.Memory, index: "test" }
//     ],
//     type: [
//         { name: "ifBlock", params: [Type.I32], results: [] }
//     ],
//     function: [
//         new Func({
//             codes: [
//                 Code.block({
//                     type: BlockType.I32,
//                     codes: [
//                         Code.i32.Const(50)
//                     ]
//                 }),
//                 Code.i32.Const(10),
//                 Code.If({
//                     type: "ifBlock",
//                     then: [
//                         Code.Return
//                     ],
//                     else: [
//                         Code.drop
//                     ]
//                 })
//             ]
//         })
//     ]
// });
// m.check();

let buffer = readFileSync("./test/test.wasm");
let test = InnerModule.fromBuffer(buffer);
let [customSec] = test.getCustomSections("name");
let nameSec = customSec?.toNameSection();
let buf = nameSec.toBuffer();
debugger;