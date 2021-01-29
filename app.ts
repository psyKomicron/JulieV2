// ENTRY POINT FOR THE NODEJS APPLICATION //
import { Printer } from './app_code/console/Printer';
import { StarEffect } from './app_code/console/effects/StarEffect';
import { Bot } from './app_code/bot/discord/Bot';
import { Config } from './app_code/dal/Config';
import { TwitterBot } from './app_code/bot/twitter/TwitterBot';

Config.init();

Printer.startUp();

let loadingEffect = new StarEffect([-12, -1]);
loadingEffect.start();

try
{
    var bot = Bot.get(loadingEffect);
    TwitterBot.get(bot);
}
catch (e)
{
    Printer.error(e.toString());
}