/**Parse a string (from a environement variable) and returns an enum type for easier conditions */
export class ReleaseTypeParser
{
    public static parse(value: string)
    {
        switch (value)
        {
            case "alpha":
                return ReleaseType.ALPHA;
            case "test":
                return ReleaseType.TEST;
            default:
                return ReleaseType.PROD;
        }
    }
}

/**Enumeration for ReleaseTypeParser */
export enum ReleaseType
{
    ALPHA = "alpha",
    TEST = "test",
    PROD = ""
}