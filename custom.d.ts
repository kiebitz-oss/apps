declare module '*.svg' {
    const content: string;
    export default content;
}

declare module '*.yml' {
    const content: { [key: string]: any };
    export default content;
}
