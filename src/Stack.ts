import { Type } from './Type';

/**
 * 堆栈
 */
export class Stack {
    /**
     * 堆栈数据
     */
    private data: Type[];

    /**
     * @param data 堆栈的初始数据
     */
    constructor(data: Type[] = []) {
        this.data = [...data];
    }

    /**
     * 比较栈顶元素类型，如果不同则抛出异常
     * @param types 待测试类型
     * @param isPop 是否弹出比较值
     */
    checkStackTop(types: readonly Type[], isPop = true) {
        let count = types.length;
        let input: Type[];
        if (isPop) {
            input = this.data.splice(this.data.length - count, count);
        } else {
            input = this.data.slice(this.data.length - count);
        }

        for (let i = 0; i < count; i++) {
            let it = input[i];
            let p = types[i];

            if (it !== p) throw new Error(`参数不匹配`);
        }
    }

    /**
     * 弹出栈顶元素
     */
    pop() {
        return this.data.pop();
    }

    /**
     * 类型压栈
     * @param items 类型
     */
    push(...items: Type[]) {
        return this.data.push(...items);
    }

    /**
     * 栈顶元素
     */
    get top() {
        return this.data[this.data.length - 1];
    }

    /**
     * 栈中元素个数
     */
    get length() {
        return this.data.length;
    }
}
