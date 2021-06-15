"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GambleCommand = void 0;
const Command_1 = require("../Command");
class GambleCommand extends Command_1.Command {
    constructor(bot) {
        super("gamble-command", bot);
    }
    execute(wrapper) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = this.getParams(wrapper);
        });
    }
    getParams(wrapper) {
        return null;
    }
}
exports.GambleCommand = GambleCommand;
//# sourceMappingURL=GambleCommand.js.map