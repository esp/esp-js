export interface DateSelectorState {
    dateInput: string;
    resolvedDate: Date;
    resolvedDateString: string;
}

export const defaultDateSelectorStateFactory = (): DateSelectorState => {
    return {
        dateInput: null,
        resolvedDate: null,
        resolvedDateString: ''
    };
};