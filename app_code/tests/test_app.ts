import fs = require('fs');
import ytdl = require('ytdl-core');
import readline = require('readline');
import { performance } from "perf_hooks";
import { Printer } from '../console/Printer';
import { Tools } from '../helpers/Tools';
import { Config } from '../dal/Config';
import { Tree } from '../bot/discord/command_modules/moderation/completion_tree/Tree';

export class Test
{
    public static execute()
    {
        let rl = readline.createInterface(
            {
                input: process.stdin,
                output: process.stdout
            });
        rl.question("link : ", (answer) =>
        {
            ytdl(answer, { quality: "highestaudio" })
                .pipe(fs.createWriteStream("./files/downloads/file.mp3", { flags: "w" }))
                .on("finish", () =>
                {
                    console.log("Finished downloading file");
                    this.execute();
                })
                .on("error", (error) =>
                {
                    throw error;
                });
        });

/*        try
        {
            let configOb = new Config();
        }
        catch (e)
        {
            console.error(e);
        }*/
    }

    private static testRegex()
    {
        let res: RegExpMatchArray = "https://www.youtube.com/watch?v=I0T8jivPjJk".match(Tools.getUrlRegex());
        console.log(JSON.stringify(res));
        let urls = [
            "https://www.youtube.com/watch?v=I0T8jivPjJk",
            "https://www.youtube.com/watch?v=x8IToLUJStg&list=PLFbJRoyE4bhlm44b16EPDw7pJZrY_bw9Y&index=21",
            "https://twitter.com/home",
            "https://twitter.com/CLONEKID_/status/1275079599261548548",
            "https://iut-dijonfr/zimbra/#1"
        ];
        urls.forEach(url =>
        {
            console.log(`${url} : ${Printer.info(Tools.isUrl(url))}`);
        });
    }

    private static testTree()
    {
        let tree = new Tree();
        let file = fs.readFileSync("./files/dico.txt").toString();
        let dic = file.split("\r\n");
        let tic = performance.now();
        for (var k = 0; k < dic.length; k++)
        {
            let word = dic[k];
            tree.add(word);
        }
        const rl = readline.createInterface(
            {
                input: process.stdin,
                output: process.stdout
            }
        );
        let tac = performance.now();
        console.log(tac - tic + "ms");
        let answer = "infon";
        let bestWord = "";
        if (tree.find(answer))
        {
            console.log("found the word");
            let words = new Array<string>();
            tree.complete(answer, words);
            let lowestDelta = 1;
            for (var i = 0; i < words.length; i++)
            {
                let word = words[i];
                let differences = 0;
                for (var j = 0; j < word.length; j++)
                {
                    if (j < answer.length && word[j] != answer[j])
                    {
                        differences++;
                    }
                    else if (j >= answer.length)
                    {
                        differences++;
                    }
                }
                let currentDelta = differences / word.length;
                console.log(`${word} ->${currentDelta}`);
                if (lowestDelta > currentDelta && currentDelta != 0)
                {
                    bestWord = word;
                    lowestDelta = currentDelta;
                }
            }
        }
        else
        {
            console.log("no word found");
        }
        console.log(Printer.info(bestWord));
    }
}