/**
 * ES5 guard: easelbone's own sources, and the built bundle when there is
 * one, must not use syntax newer than ES5.
 *
 * The games that vendor easelbone ship it inside an ES5 bundle for older
 * browsers and TV webviews; one `let` or arrow function in here makes the
 * whole bundle a syntax error there. The build minifies with terser, which
 * keeps whatever syntax it is given, so the sources have to be ES5.
 *
 * Parses with the terser the build already uses and fails on any ES2015+
 * node (let/const, arrow functions, classes, template strings, spread and
 * destructuring, default arguments, for-of, generators, async/await).
 * Vendored libraries under app/scripts/vendor are not checked.
 *
 * Usage: node tools/es5-test.js
 */
var fs = require('fs');
var path = require('path');
var terser = require('terser');

var ROOT = path.join(__dirname, '..');
var SOURCES = path.join(ROOT, 'app', 'scripts', 'CatLab');
var BUNDLE = path.join(ROOT, 'dist', 'scripts', 'easelbone.js');

var MODERN = [
    ['AST_Let', 'let'],
    ['AST_Const', 'const'],
    ['AST_Arrow', 'arrow function'],
    ['AST_Class', 'class'],
    ['AST_TemplateString', 'template string'],
    ['AST_Expansion', 'spread / rest'],
    ['AST_Destructuring', 'destructuring'],
    ['AST_DefaultAssign', 'default argument'],
    ['AST_ForOf', 'for-of'],
    ['AST_Yield', 'yield'],
    ['AST_Await', 'await'],
    ['AST_ConciseMethod', 'method shorthand'],
    ['AST_Import', 'import'],
    ['AST_Export', 'export']
].filter(function (entry) {
    return typeof terser[entry[0]] === 'function';
});

function listJs(dir) {
    var out = [];
    fs.readdirSync(dir).forEach(function (name) {
        var full = path.join(dir, name);
        var stat = fs.lstatSync(full);
        if (stat.isSymbolicLink()) {
            return;
        }
        if (stat.isDirectory()) {
            out = out.concat(listJs(full));
        } else if (/\.js$/.test(name)) {
            out.push(full);
        }
    });
    return out;
}

/**
 * @param {string} file
 * @returns {string[]} one line per ES2015+ construct found.
 */
function check(file) {
    var found = [];
    var ast;
    try {
        ast = terser.parse(fs.readFileSync(file, 'utf8'), { filename: path.relative(ROOT, file) });
    } catch (e) {
        return [path.relative(ROOT, file) + ': does not parse: ' + e.message];
    }

    ast.walk(new terser.TreeWalker(function (node) {
        for (var i = 0; i < MODERN.length; i++) {
            if (node instanceof terser[MODERN[i][0]]) {
                found.push(path.relative(ROOT, file) + ':' + node.start.line + ': ' + MODERN[i][1]);
                break;
            }
        }
        // Shorthand properties ({ a } for { a: a }) have no node of their own.
        if (
            terser.AST_ObjectKeyVal &&
            node instanceof terser.AST_ObjectKeyVal &&
            node.start && node.value && node.start === node.value.start &&
            node.value instanceof terser.AST_SymbolRef &&
            node.key === node.value.name &&
            node.end === node.value.end
        ) {
            found.push(path.relative(ROOT, file) + ':' + node.start.line + ': shorthand property');
        }
    }));

    return found;
}

if (MODERN.length < 10 || typeof terser.parse !== 'function' || typeof terser.TreeWalker !== 'function') {
    console.error('es5-test: this terser does not expose its AST; the guard cannot run.');
    process.exit(1);
}

var files = listJs(SOURCES);
var checkedBundle = fs.existsSync(BUNDLE);
if (checkedBundle) {
    files.push(BUNDLE);
}

var problems = [];
files.forEach(function (file) {
    problems = problems.concat(check(file));
});

if (problems.length > 0) {
    console.error('Not ES5 (' + problems.length + '):');
    problems.slice(0, 50).forEach(function (line) {
        console.error('  ' + line);
    });
    if (problems.length > 50) {
        console.error('  ... and ' + (problems.length - 50) + ' more');
    }
    process.exit(1);
}

console.log('ES5 OK: ' + files.length + ' files' + (checkedBundle ? ' (built bundle included)' : ' (no built bundle found)'));
