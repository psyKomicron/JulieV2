"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = void 0;
const Node_1 = require("./Node");
class Tree {
    constructor() {
        this.root = undefined;
    }
    add(word) {
        if (!this.root) {
            this.root = new Node_1.JNode(word.charAt(0), false);
        }
        this.root.add(word, 0);
    }
    find(word) {
        let ok = false;
        if (this.root) {
            ok = this.root.find(word, 0);
        }
        return ok;
    }
    complete(word, words) {
        if (this.root) {
            this.root.complete(word, words, 0);
        }
    }
}
exports.Tree = Tree;
//# sourceMappingURL=Tree.js.map