export type PolicyName = string;
export interface IPolicy {
    /**
     * The policy name.
     */
    readonly name: PolicyName;
    /**
     * The Code version in which this policy was introduced.
    */
    readonly minimumVersion: `${number}.${number}`;
    /**
     * The policy description (optional).
     */
    readonly description?: string;
    /**
     * Is preview feature
     */
    readonly previewFeature?: boolean;
    /**
     * Default value when enabled. Default is `false`.
     */
    readonly defaultValue?: string | number | boolean;
}
