import { BlockType, Func, Type } from "../src"
import { i32, If, Return } from "../src/Code"
let fn = new Func({
    returns: [Type.I32],
    codes: [
        i32.Const(100),
        i32.Const(100),
        i32.add,
        If({
            type: BlockType.I32,
            if: [
                i32.Const(1),
                Return
            ],
            else: [
                i32.Const(0),
                Return
            ]
        })
    ]
})