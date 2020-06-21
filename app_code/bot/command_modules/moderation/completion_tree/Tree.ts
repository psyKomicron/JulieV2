import { JNode } from "./Node";

export class Tree
{
    private root: JNode = undefined;

    public constructor()
    {
    }

    public add(word: string)
    {
        if (!this.root)
        {
            this.root = new JNode(word.charAt(0), false);
        }
        this.root.add(word, 0);
    }

    public find(word: string): boolean
    {
        let ok = false;
        if (this.root)
        {
            ok = this.root.find(word, 0);
        }
        return ok;
    }

    public complete(word: string, words: Array<string>): void
    {
        if (this.root)
        {
            this.root.complete(word, words, 0);
        }
    }
}