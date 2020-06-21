// necessary imports
import readline = require('readline');
import { Printer } from './app_code/console/Printer';
import { Test } from './app_code/tests/test_app';
import { StarEffect } from './app_code/console/effects/StarEffect';
import { Bot } from './app_code/bot/Bot';
import { TokenReader } from './app_code/helpers/dal/Readers';
// -------- Code --------

const release = TokenReader.getToken("release");
Printer.info(`release version : ${release}`);
if (release)
{
    let r1 = readline.createInterface(
        {
            input: process.stdin,
            output: process.stdout
        });
    r1.question(Printer.info("launch configuration : "), (answer) => 
    {
        if (answer == "test")
        {
            Test.execute();
        }
        else
        {
            Printer.startUp();
            let loadingEffect = new StarEffect("", [-17, -1]);
            let id = loadingEffect.start();
            try
            {
                new Bot(id);
            } catch (e)
            {
                console.error(e);
            }
        }
    })
}
else
{
    Printer.startUp();
    let loadingEffect = new StarEffect("", [-17, -1]);
    let id = loadingEffect.start();
    try
    {
        new Bot(id);
    } catch (e)
    {
        console.error(e);
    }
}