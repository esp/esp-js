import * as React from 'react';
export declare function shouldUpdateMixin<TProps, TState, TPropBindings>(itemsThatEffectUpdateSelector: (nextProps: TProps) => TPropBindings): <TConstructor extends new (...args: any[]) => {}>(Constructor: TConstructor) => {
    new (...args: any[]): {
        _propBindings: {};
        shouldComponentUpdate(nextProps: any, nextState: any): boolean;
        render(): React.ComponentElement<any, React.Component<any, any, any>>;
    };
} & TConstructor;
