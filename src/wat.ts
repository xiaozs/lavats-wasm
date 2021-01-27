import { RuleCollection, DelayAst, TerminalAst, OptionalAst, RepeatAst } from "lavats";
import { instructions } from "./Instruction";

/**
 * 获取所有指令的正则
 */
export function getInstrNameReg() {
    let excludeInstrs = ["block", "loop", "if", "else", "end"];
    let instrNames = [];
    for (let { name } of instructions) {
        let isExclude = excludeInstrs.includes(name);
        if (isExclude) continue;
        instrNames.push(name);
    }
    let regStr = instrNames.join("|").replace(/\./g, "\\.");
    return new RegExp(regStr);
}

let col = new RuleCollection();

let comment = col.terminal({ reg: /;;[^\r\n]*|\(;.*?;\)/, ignore: true });
let space = col.terminal({ reg: /\s+/, ignore: true });

let string = col.terminal(/"(?:\\\\|\\"|[^"\r\n])*"/);

let id = col.terminal(/\$[0-9A-Za-z!#$%&′*+-./:<=>?@\\^_`|~]+/);

let instrStr = col.terminal(getInstrNameReg());
let valtype = col.terminal(/i32|i64|f32|f64/);
let paramKey = col.terminal("param");
let resultKey = col.terminal("result");
let funcKey = col.terminal("func");
let elemtype = col.terminal(/anyfunc|funcref|externref|exnref/);
let mutKey = col.terminal("mut");
let typeKey = col.terminal("type");
let tableKey = col.terminal("table");
let memoryKey = col.terminal("memory");
let globalKey = col.terminal("global");
let localKey = col.terminal("local");
let importKey = col.terminal("import");
let exportKey = col.terminal("export");
let startKey = col.terminal("start");
let elemKey = col.terminal("elem");
let offsetKey = col.terminal("offset");
let dataKey = col.terminal("data");
let moduleKey = col.terminal("module");
let alignKey = col.terminal("align");
let blockKey = col.terminal("block");
let loopKey = col.terminal("loop");
let ifKey = col.terminal("if");
let elseKey = col.terminal("else");
let endKey = col.terminal("end");

let left = col.terminal("(");
let right = col.terminal(")");
let eq = col.terminal("=");

let inf = col.terminal("inf");
let nan = col.terminal("nan");
let nanHexStart = col.terminal("nan:0x");
let e = col.terminal(/[eE]/);
let p = col.terminal(/[pP]/);
let dot = col.terminal(".");
let underline = col.terminal("-");
let sign = col.terminal(/[+-]/);
let digit = col.terminal(/[0-9]/);
let hexdigit = col.terminal(/[0-9a-fA-F]/);
let hexStart = col.terminal("0x");

class Num extends DelayAst<[TerminalAst] | [Num, OptionalAst<[TerminalAst]>, TerminalAst]>{

}
let num = col.delay(Num);
num.defineBnf`${digit} | ${num} ${underline}? ${digit}`;

class Hexnum extends DelayAst<[TerminalAst] | [Hexnum, OptionalAst<[TerminalAst]>, TerminalAst]> {

}
let hexnum = col.delay(Hexnum);
hexnum.defineBnf`${hexdigit} | ${hexnum} ${underline}? ${hexdigit}`;

class Uint extends DelayAst<[Num] | [TerminalAst, Hexnum]> {

}
let uint = col.delay(Uint);
uint.defineBnf`${num} | ${hexStart} ${hexnum}`;

class Sint extends DelayAst<[OptionalAst<[TerminalAst]>, Num] | [OptionalAst<[TerminalAst]>, TerminalAst, Hexnum]>{

}
let sint = col.delay(Sint);
sint.defineBnf`${sign}? ${num} | ${sign}? ${hexStart} ${hexnum}`;

class Int extends DelayAst<[Uint] | [Sint]>{

}
let int = col.delay(Int);
int.defineBnf`${uint} | ${sint}`;

class Frac extends DelayAst<[TerminalAst] | [TerminalAst, OptionalAst<[TerminalAst]>, Frac]>{

}
let frac = col.delay(Frac);
frac.defineBnf`${digit} | ${digit} ${underline}? ${frac}`;

class Hexfrac extends DelayAst<[TerminalAst] | [TerminalAst, OptionalAst<[TerminalAst]>, Hexfrac]>{

}
let hexfrac = col.delay(Hexfrac);
hexfrac.defineBnf`${hexdigit} | ${hexdigit} ${underline}? ${hexfrac}`;

class Float extends DelayAst<
    [Num, OptionalAst<[TerminalAst]>] |
    [Num, TerminalAst, Frac] |
    [Num, OptionalAst<[TerminalAst]>, TerminalAst, OptionalAst<[TerminalAst]>, Num] |
    [Num, OptionalAst<[TerminalAst]>, Frac, TerminalAst, OptionalAst<[TerminalAst]>, Num]
    >{

}
let float = col.delay(Float);
float.defineBnf`
    ${num} ${dot}? | 
    ${num} ${dot}  ${frac} | 
    ${num} ${dot}?         ${e} ${sign}? ${num} | 
    ${num} ${dot}? ${frac} ${e} ${sign}? ${num}
`;

class Hexfloat extends DelayAst<
    [Hexnum, OptionalAst<[TerminalAst]>] |
    [Hexnum, TerminalAst, Hexfrac] |
    [Hexnum, OptionalAst<[TerminalAst]>, TerminalAst, OptionalAst<[TerminalAst]>, Num] |
    [Hexnum, OptionalAst<[TerminalAst]>, Hexfrac, TerminalAst, OptionalAst<[TerminalAst]>, Num]
    >{

}
let hexfloat = col.delay(Hexfloat);
hexfloat.defineBnf`
    ${hexnum} ${dot}? | 
    ${hexnum} ${dot}  ${hexfrac} | 
    ${hexnum} ${dot}?            ${p} ${sign}? ${num} | 
    ${hexnum} ${dot}? ${hexfrac} ${p} ${sign}? ${num}
`;

class FNmag extends DelayAst<[Float] | [Hexfloat] | [TerminalAst] | [TerminalAst] | [TerminalAst, Hexnum]>{

}
let fNmag = col.delay(FNmag);
fNmag.defineBnf`${float} | ${hexfloat} | ${inf} | ${nan} | ${nanHexStart} ${hexnum}`;

class FN extends DelayAst<[OptionalAst<[TerminalAst]>, FNmag]>{

}
let fN = col.delay(FN);
fN.defineBnf`${sign}? ${fNmag}`;

class Name extends DelayAst<[TerminalAst]>{

}
let name = col.delay(Name);
name.defineBnf`${string}`;

class Idx extends DelayAst<[Uint] | [TerminalAst]>{

}
let idx = col.delay(Idx);
idx.defineBnf`${uint} | ${id}`;

class Param extends DelayAst<[TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, TerminalAst, TerminalAst]>{

}
let param = col.delay(Param);
param.defineBnf`${left} ${paramKey} ${id}? ${valtype} ${right}`;

class AbbParams extends DelayAst<[TerminalAst, TerminalAst, RepeatAst<[TerminalAst]>, TerminalAst]>{

}
let abbParams = col.delay(AbbParams);
abbParams.defineBnf`${left} ${paramKey} ${valtype}* ${right}`;

class Result extends DelayAst<[TerminalAst, TerminalAst, TerminalAst, TerminalAst]>{

}
let result = col.delay(Result);
result.defineBnf`${left} ${resultKey} ${valtype} ${right}`;

class AbbResults extends DelayAst<[TerminalAst, TerminalAst, RepeatAst<[TerminalAst]>, TerminalAst]>{

}
let abbResults = col.delay(AbbResults);
abbResults.defineBnf`${left} ${resultKey} ${valtype}* ${right}`;

class Typeuse extends DelayAst<
    [TerminalAst, TerminalAst, TerminalAst, TerminalAst] |
    [RepeatAst<[Param | AbbParams]>, RepeatAst<[Result | AbbResults]>]
    >{

}
let typeuse = col.delay(Typeuse);
typeuse.defineBnf`
    ${left} ${typeKey} ${idx} ${right} |
    (${param} | ${abbParams})* (${result} | ${abbResults})*
`;

class Functype extends DelayAst<[TerminalAst, TerminalAst, RepeatAst<[Param | AbbParams]>, RepeatAst<[Result | AbbResults]>, TerminalAst]>{

}
let functype = col.delay(Functype);
functype.defineBnf`${left} ${funcKey} (${param} | ${abbParams})* (${result} | ${abbResults})* ${right}`;

class Limits extends DelayAst<[Uint] | [Uint, Uint]>{

}
let limits = col.delay(Limits);
limits.defineBnf`${uint} | ${uint} ${uint}`;

class Memtype extends DelayAst<[Limits]>{

}
let memtype = col.delay(Memtype);
memtype.defineBnf`${limits}`;

class Tabletype extends DelayAst<[Limits, TerminalAst]> {

}
let tabletype = col.delay(Tabletype);
tabletype.defineBnf`${limits} ${elemtype}`;

class Globaltype extends DelayAst<[TerminalAst] | [TerminalAst, TerminalAst, TerminalAst, TerminalAst]>{

}
let globaltype = col.delay(Globaltype);
globaltype.defineBnf`${valtype} | ${left} ${mutKey} ${valtype} ${right}`;


class Instr extends DelayAst<[Plaininstr | Blockinstr]>{

}
let instr = col.delay(Instr);

class Blocktype extends DelayAst<[Typeuse]> {

}
let blocktype = col.delay(Blocktype);
blocktype.defineBnf`${typeuse}`;

class Blockinstr extends DelayAst<
    [TerminalAst, OptionalAst<[TerminalAst]>, Blocktype, RepeatAst<[Instr]>, TerminalAst, OptionalAst<[TerminalAst]>] |
    [TerminalAst, OptionalAst<[TerminalAst]>, Blocktype, RepeatAst<[Instr]>, TerminalAst, OptionalAst<[TerminalAst]>, RepeatAst<[Instr]>, TerminalAst, OptionalAst<[TerminalAst]>]
    >{

}
let blockinstr = col.delay(Blockinstr);
blockinstr.defineBnf`
    ${blockKey} ${id}? ${blocktype} ${instr}* ${endKey}  ${id}? |
    ${loopKey}  ${id}? ${blocktype} ${instr}* ${endKey}  ${id}? |
    ${ifKey}    ${id}? ${blocktype} ${instr}* ${endKey}  ${id}? |
    ${ifKey}    ${id}? ${blocktype} ${instr}* ${elseKey} ${id}? ${instr}* ${endKey} ${id}?
`;

class Memarg extends DelayAst<[OptionalAst<[TerminalAst, TerminalAst, Uint]>, OptionalAst<[TerminalAst, TerminalAst, Uint]>]>{

}
let memarg = col.delay(Memarg);
memarg.defineBnf`(${offsetKey} ${eq} ${uint})? (${alignKey} ${eq} ${uint})?`;

class Imms extends DelayAst<[RepeatAst<[Int | FN | Idx | Memarg]>]>{

}
let imms = col.delay(Imms);
imms.defineBnf`(${int} | ${fN} | ${idx} | ${memarg})*`;

class Plaininstr extends DelayAst<[TerminalAst, Imms]> {

}
let plaininstr = col.delay(Plaininstr);
plaininstr.defineBnf`${instrStr} ${imms}`;

instr.defineBnf`${plaininstr} | ${blockinstr}`;

class Type extends DelayAst<[TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, Functype, TerminalAst]>{

}
let type = col.delay(Type);
type.defineBnf`${left} ${typeKey} ${id}? ${functype} ${right}`;

class Expr extends DelayAst<[RepeatAst<[Instr]>]>{

}
let expr = col.delay(Expr);
expr.defineBnf`${instr}*`;

class Importdesc extends DelayAst<
    [TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, Typeuse, TerminalAst] |
    [TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, Tabletype, TerminalAst] |
    [TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, Memtype, TerminalAst] |
    [TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, Globaltype, TerminalAst]
    >{

}
let importdesc = col.delay(Importdesc);
importdesc.defineBnf`
    ${left} ${typeKey}   ${id}? ${typeuse}    ${right} |
    ${left} ${tableKey}  ${id}? ${tabletype}  ${right} |
    ${left} ${memoryKey} ${id}? ${memtype}    ${right} |
    ${left} ${globalKey} ${id}? ${globaltype} ${right}
`;

class Import extends DelayAst<[TerminalAst, TerminalAst, TerminalAst, TerminalAst, Importdesc, TerminalAst]>{

}
let import_ = col.delay(Import);
import_.defineBnf`${left} ${importKey} ${name} ${name} ${importdesc} ${right}`;

class Local extends DelayAst<[TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, TerminalAst, TerminalAst]>{

}
let local = col.delay(Local);
local.defineBnf`${left} ${localKey} ${id}? ${valtype} ${right}`;

class AbbLocals extends DelayAst<[TerminalAst, TerminalAst, RepeatAst<[TerminalAst]>, TerminalAst]>{

}
let abbLocals = col.delay(AbbLocals);
abbLocals.defineBnf`${left} ${localKey} ${valtype}* ${right}`;

class InlineExport extends DelayAst<[TerminalAst, TerminalAst, TerminalAst, TerminalAst]>{

}
let inlineExport = col.delay(InlineExport);
inlineExport.defineBnf`${left} ${exportKey} ${name} ${right}`;

class InlineImport extends DelayAst<[TerminalAst, TerminalAst, TerminalAst, TerminalAst, TerminalAst]>{

}
let inlineImport = col.delay(InlineImport);
inlineImport.defineBnf`${left} ${importKey} ${name} ${name} ${right}`;

class Func extends DelayAst<
    [
        TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, OptionalAst<[InlineExport]>,
        Typeuse, RepeatAst<[Local | AbbResults]>, RepeatAst<[Instr]>, TerminalAst
    ] |
    [
        TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, OptionalAst<[InlineExport]>,
        InlineImport, Typeuse
    ]
    > {

}
let func = col.delay(Func);
func.defineBnf`
    ${left} ${funcKey} ${id}? ${inlineExport}? ${typeuse} (${local} | ${abbLocals})* ${instr}* ${right} |
    ${left} ${funcKey} ${id}? ${inlineExport}? ${inlineImport} ${typeuse}
`;

class InlineElem extends DelayAst<[TerminalAst, TerminalAst, RepeatAst<[Idx]>, TerminalAst]>{

}
let inlineElem = col.delay(InlineElem);
inlineElem.defineBnf`${left} ${elemKey} ${idx}* ${right}`;

class Table extends DelayAst<[TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, OptionalAst<[InlineExport]>, OptionalAst<[InlineImport]>, Tabletype, OptionalAst<[InlineElem]>, TerminalAst]>{

}
let table = col.delay(Table);
table.defineBnf`${left} ${tableKey} ${id}? ${inlineExport}? ${inlineImport}? ${tabletype} ${inlineElem}? ${right}`;
// todo, inlineElem 理解

class InlineData extends DelayAst<[TerminalAst, TerminalAst, RepeatAst<[TerminalAst]>, TerminalAst]>{

}
let inlineData = col.delay(InlineData);
inlineData.defineBnf`${left} ${dataKey} ${string}* ${right}`;

class Mem extends DelayAst<[TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, OptionalAst<[InlineExport]>, OptionalAst<[InlineImport]>, Memtype, OptionalAst<[InlineData]>, TerminalAst]>{

}
let mem = col.delay(Mem);
mem.defineBnf`${left} ${memoryKey} ${id}? ${inlineExport}? ${inlineImport}? ${memtype} ${inlineData}? ${right}`;
// todo, inlineData 理解

class Global extends DelayAst<
    [TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, OptionalAst<[InlineExport]>, Globaltype, Expr, TerminalAst] |
    [TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, OptionalAst<[InlineImport]>, Globaltype, TerminalAst]
    >{

}
let global = col.delay(Global);
global.defineBnf`
    ${left} ${globalKey} ${id}? ${inlineExport}? ${globaltype} ${expr} ${right} |
    ${left} ${globalKey} ${id}? ${inlineImport}  ${globaltype}         ${right}
`;

class Exportdesc extends DelayAst<
    [TerminalAst, TerminalAst, Idx, TerminalAst] |
    [TerminalAst, TerminalAst, Idx, TerminalAst] |
    [TerminalAst, TerminalAst, Idx, TerminalAst] |
    [TerminalAst, TerminalAst, Idx, TerminalAst]
    >{

}
let exportdesc = col.delay(Exportdesc);
exportdesc.defineBnf`
    ${left} ${funcKey}   ${idx} ${right} |
    ${left} ${tableKey}  ${idx} ${right} |
    ${left} ${memoryKey} ${idx} ${right} |
    ${left} ${globalKey} ${idx} ${right}
`;

class Export extends DelayAst<[TerminalAst, TerminalAst, TerminalAst, Importdesc, TerminalAst]>{

}
let export_ = col.delay(Export);
export_.defineBnf`${left} ${exportKey} ${name} ${importdesc} ${right}`;

class Start extends DelayAst<[TerminalAst, TerminalAst, Idx, TerminalAst]>{

}
let start = col.delay(Start);
start.defineBnf`${left} ${startKey} ${idx} ${right}`;

class Offset extends DelayAst<[TerminalAst, TerminalAst, Expr, TerminalAst] | [Expr]>{

}
let offset = col.delay(Offset);
offset.defineBnf`${left} ${offsetKey} ${expr} ${right} | ${expr}`;

class Elem extends DelayAst<[TerminalAst, TerminalAst, OptionalAst<[Idx]>, Offset, RepeatAst<[Idx]>, TerminalAst]>{

}
let elem = col.delay(Elem);
elem.defineBnf`${left} ${elemKey} ${idx}? ${offset} ${idx}* ${right}`;

class Data extends DelayAst<[TerminalAst, TerminalAst, OptionalAst<[Idx]>, RepeatAst<[TerminalAst]>, TerminalAst]>{

}
let data = col.delay(Data);
data.defineBnf`${left} ${dataKey} ${idx}? ${offset} ${string}* ${right}`;

class Modulefield extends DelayAst<[Type | Import, Func, Table, Mem, Global, Export, Start, Elem, Data]>{

}
let modulefield = col.delay(Modulefield);
modulefield.defineBnf`${type} | ${import_} | ${func} | ${table} | ${mem} | ${global} | ${export_} | ${start} | ${elem} | ${data}`;


class ModuleAst extends DelayAst<[TerminalAst, TerminalAst, OptionalAst<[TerminalAst]>, RepeatAst<[Modulefield]>, TerminalAst] | [RepeatAst<[Modulefield]>]> {

}
let module = col.delay(ModuleAst);
module.defineBnf`${left} ${moduleKey} ${id}? ${modulefield}* ${right} | ${modulefield}*`;

export let watParser = col.getParser(module);

