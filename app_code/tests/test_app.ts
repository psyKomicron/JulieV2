import fs = require('fs');
import readline = require('readline');
import { performance } from "perf_hooks";
import { Printer } from '../console/Printer';
import { Tree } from '../bot/command_modules/moderation/completion_tree/Tree';

export class Test
{
    public static execute()
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