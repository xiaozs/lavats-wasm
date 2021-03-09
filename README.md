# lavats-wasm
lavats是一个由**typescript**写成的支持**umd**的**DSL式**的WebAssembly汇编器。

## 特色
* 支持**typescript**的```*.d.ts```文件
* 支持**umd**，可运行在**浏览器**和**nodejs**环境下
* 使用**DSL式**，可与js语言无缝衔接

## 支持
[规范提案](https://github.com/WebAssembly/proposals)

支持的提案：
- [x] MVP
- [x] [导入/导出可变全局变量提案](https://github.com/xiaozs/wasm/blob/master/%E5%8F%AF%E5%8F%98%E5%85%A8%E5%B1%80%E5%8F%98%E9%87%8F%EF%BC%88mutable-global%EF%BC%89.md)
- [x] [非陷入的Float到int转换](https://github.com/xiaozs/wasm/blob/master/%E9%9D%9E%E9%99%B7%E5%85%A5%E7%9A%84Float%E5%88%B0int%E8%BD%AC%E6%8D%A2%EF%BC%88nontrapping-float-to-int-conversion%EF%BC%89.md)
- [x] [带符号扩展操作符](https://github.com/xiaozs/wasm/blob/master/%E5%B8%A6%E7%AC%A6%E5%8F%B7%E6%89%A9%E5%B1%95%E6%93%8D%E4%BD%9C%E7%AC%A6%EF%BC%88sign-extension-ops%EF%BC%89.md)
- [x] [多值](https://github.com/xiaozs/wasm/blob/master/%E5%A4%9A%E5%80%BC%EF%BC%88multi-value%EF%BC%89.md)

## 安装
在命令行中输入：
```
npm install lavats-wasm
```

## 引入

### cmd
```javascript
var lavatsWasm = require("lavats-wasm");
```

### amd
```javascript
require(["lavats-wasm"], function(lavatsWasm) {

})
```
```javascript
define(["lavats-wasm"], function(lavatsWasm) {

})
```

### es6
```javascript
import * as lavatsWasm from "lavats-wasm";
```

### \<script>
```html
<script src="./node_modules/lavats/dist/index.js"></script>
<script>

lavatsWasm

</script>
```

## 使用

### 生成模块
```javascript
import { Module, Func, ImportExportType, data } from "lavats-wasm";

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
                        Code.block({
                            label: "block2",
                            codes: [
                                Code.call("imFunc"),
                            ]
                        }),
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
                }),
                Code.i32.Const(10),
                Code.If({
                    else: [
                        Code.nop
                    ]
                })
            ]
        })
    ],
    custom: [
        { name: "hello", buffer: data.string("hello").toBuffer() }
    ]
});
```

### Module转换为二进制
```javascript
let buf = m.toBuffer();    // Uint8Array(297) [0, 97, 115, 109, 1, 0, 0, 0, 1, 8, 2, 96, 1, 127, 0, ....
```

### 二进制转换为Module
```javascript
let newModule = Module.fromBuffer(buf);
```

### Module转换为字符串
```javascript
let wat = m.toString();

// (module $module
//     (type $ifBlock (func (param i32)))
//     (import "js" "test" (memory $test 0))
//     (import "js" "imFunc" (func $imFunc))
//     (global $global i32 (i32.const 0))
//     (memory $memory 0)
//     (data $data (i32.const 0) "\0a\00\00\00\00\00\00\00test\0a\00\00\00\00\00\00\00")
//     (table $table 0 anyfunc)
//     (elem $element (i32.const 0) 0)
//     (func $start
//     )
//     (func $func (param $p1 i32) (local $l1 i32)
//         block $block (result i32)
//             i32.const 50
//         end
//         i32.const 10
//         if $if (param i32)
//             drop
//             br 0
//         else
//             drop
//         end
//     )
//     (start $start)
//     (export "js" (memory $test))
// )
```

### 字符串转换为Module
请参考[lavats-wat](https://www.npmjs.com/package/lavats-wat)

### 模块校验
```javascript
// 会返回模块是否合法的boolean
let isValidate = m.validate();

// 当校验失败时，会抛出异常
m.check();
```