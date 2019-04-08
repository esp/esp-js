import * as React from 'react';
export declare const DEFAULT_VIEW_KEY = "default-view-key";
/**
 * Tries to get a view for the given model.
 *
 * It does this using the following order:
 * 1) If a @viewBinding decorator was used and a display context was given, try get a view for that
 * 2) Else if a view was explicitly provided use that
 * 3) Else if a @viewBinding decorator was used and there is a view associated with the default display context, use that view
 * @param model
 * @param props
 * @param displayContext
 * @param view
 */
export declare function createViewForModel(model: any, props: any, displayContext: string, view: React.ComponentClass | React.SFC): React.ReactElement<{}, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
/**
 * An ES7 style decorator that associates a model with a view
 * @param view the react component that will be used to display this model
 * @param displayContext an optional context allowing for different views to display the same model
 * @returns {Function}
 */
export declare function viewBinding(view: any, displayContext?: string): (target: any) => void;
export declare class ViewMetadata {
    private _viewRegistrations;
    readonly viewRegistrations: {};
    hasRegisteredViewContext(displayContext: any): boolean;
}
export declare class ViewMetadataRegistration {
    private _view;
    private _displayContext;
    constructor(_view: any, _displayContext: any);
    readonly view: any;
    readonly displayContext: any;
}
