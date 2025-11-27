/* BUG 2: TypeScript Error - createdAt should be Date, not string - fixed */
export interface Note {
    id: string;
    text: string;
    createdAt: string; // changed to string for localStorage serialization
}
