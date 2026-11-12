// Exists so code can add to window (if in the browser) or globalThis (if in nodejs)
export const GlobalState: any = typeof window === 'undefined'
    ? globalThis
    : window;