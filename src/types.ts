/* BUG 2: TypeScript Error - createdAt should be Date, not string */
export interface Note {
    id: string;
    text: string;
    createdAt: string; // 🐛 This should be Date, causes runtime errors
}
