export interface DateSelectorState {
    dateInput: string;
    resolvedDate: Date;
    resolvedDateString: string;
}
export declare const defaultDateSelectorStateFactory: () => DateSelectorState;
