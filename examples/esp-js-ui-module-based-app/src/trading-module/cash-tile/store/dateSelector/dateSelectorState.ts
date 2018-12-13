export interface DateSelectorState {
    dateInput: string;
    resolvedDate: Date;
}

export const defaultDateSelectorStateFactory = (): DateSelectorState => {
    return {
        dateInput: null,
        resolvedDate: null,
    };
};