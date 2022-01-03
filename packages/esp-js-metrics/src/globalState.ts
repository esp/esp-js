// Exists so code can add to window (if in the browser) or global (if in nodejs)
// Note there is webpack config so this file doesn't get re-written at bundle time.
// Without that, webpack would otherwise re-write what global and window may point to, defeating the purpose of GlobalState.
export const GlobalState: any = typeof window === 'undefined'
    ? global
    : window;