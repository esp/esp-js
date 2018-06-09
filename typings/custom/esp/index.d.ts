interface Observable<T> {
    foo(): void;
    asObservable(): Observable<T>;
}