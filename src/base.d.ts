
export interface Reduced<A> {
    '@@transducer/value': A;
    '@@transducer/reduced': true;
}

export function reduce<T, TResult>(
    fn: (acc: TResult, elem: T, id?: number, source?: typeof list) => TResult | Reduced<TResult>,
    acc: TResult,
    list: readonly T[],
): TResult;
export function reduce<T, TResult, Source>(
    fn: (acc: TResult, elem: T, id?: keyof Source, source?: Source) => TResult | Reduced<TResult>,
    acc: TResult,
    obj: Source,
): TResult;
export function reduce<T, TResult>(
    fn: (acc: TResult, elem: T) => TResult | Reduced<TResult>,
): (acc: TResult, list: readonly T[]) => TResult;
export function reduce<T, TResult>(
    fn: (acc: TResult, elem: T) => TResult | Reduced<TResult>,
    acc: TResult,
): (list: readonly T[]) => TResult;

export function debounce(ms:number fn:Function): (...args: any) => any;
export function debounce(ms:number): (fn:Function) => (...args: any) => any;

export function intersects<T>(a: T[], b: T[]): boolean;
export function intersects<T>(a: T[]): (b: T[]) => boolean;