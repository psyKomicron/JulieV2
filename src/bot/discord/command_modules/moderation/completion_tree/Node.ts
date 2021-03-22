export class JNode
{
    private letter: string;
    private final: boolean;
    private child: JNode;
    private sibling: JNode;

    public constructor(letter: string, final: boolean)
    {
        if (letter.length == 1)
        {
            this.letter = letter;
            this.final = final;
        }
        else throw new Error("Letter is not a char");
    }

    public add(word: string, level: number)
    {
        let f = false;
        if (level == word.length - 1)
        {
            f = true;
        }
        let c = word.charAt(level);
        if (c == this.letter)
        {
            if (f)
            {
                this.final = true;
            }
            else
            {
                if (!this.child)
                {
                    this.child = new JNode(word.charAt(level + 1), this.final);
                }
                this.child.add(word, level + 1);
            }
        }
        else
        {
            if (!this.sibling)
            {
                this.sibling = new JNode(c, this.final);
            }
            this.sibling.add(word, level);
        }
    }

    public find(word: string, level: number): boolean
    {
        let c = word.charAt(level);
        let ok = false;
        let final = false;
        if (level == word.length - 1)
        {
            final = true;
        }

        if (c == this.letter)
        {
            if (final)
            {
                ok = this.final;
            }
            else if (this.child)
            {
                ok = this.child.find(word, level + 1);
            }
        }
        else if (this.sibling)
        {
            ok = this.sibling.find(word, level);
        }
        return ok;
    }

    public complete(word: string, words: Array<string>, level: number): void
    {
        if (level < word.length)
        {
            let c = word.charAt(level);
            if (c == this.letter)
            {
                if (this.final && level + 1 == word.length)
                {
                    words.push(word);
                }
                if (this.child)
                {
                    this.child.complete(word, words, level + 1);
                }
            }
            else if (this.sibling)
            {
                this.sibling.complete(word, words, level);
            }
        }
        else
        {
            if (this.sibling)
            {
                this.sibling.complete(word, words, level);
            }
            word = word + this.letter;
            if (this.final)
            {
                words.push(word);
            }
            if (this.child)
            {
                this.child.complete(word, words, level + 1);
            }
        }
    }
}