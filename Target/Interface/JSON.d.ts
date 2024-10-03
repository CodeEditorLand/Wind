export default interface Interface {
    (File: string, From?: string): Promise<ReturnType<typeof JSON.parse>>;
}
