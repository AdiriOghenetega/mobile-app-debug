/* BUG 2: TypeScript Error - createdAt should be Date, not string */
export interface Note {
    id: string;
    text: string;
    createdAt: Date; // changed to Date type to match actual use case
}
