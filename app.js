"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Printer_1 = require("./src/console/Printer");
const StarEffect_1 = require("./src/console/effects/StarEffect");
const Bot_1 = require("./src/bot/discord/Bot");
const Config_1 = require("./src/dal/Config");
const TwitterBot_1 = require("./src/bot/twitter/TwitterBot");
const process_1 = require("process");
try {
    Config_1.Config.init();
}
catch (e) {
    Printer_1.Printer.error("Config failed initialisation. Details below:");
    Printer_1.Printer.error(e.toString());
    process_1.exit(-1);
}
Printer_1.Printer.startUp();
let loadingEffect = new StarEffect_1.StarEffect([-16, -1]);
loadingEffect.start();
try {
    var bot = Bot_1.Bot.get(loadingEffect);
    TwitterBot_1.TwitterBot.get(bot);
}
catch (e) {
    loadingEffect.stop();
    Printer_1.Printer.error(e.toString());
    process_1.exit(-1);
}
//# sourceMappingURL=app.js.map