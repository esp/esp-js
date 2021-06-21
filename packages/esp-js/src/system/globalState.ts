// Exists so code can add to window (if in the browser) or global (if in nodejs)
export const GlobalState: any = typeof window === 'undefined'
    ? global
    : window;