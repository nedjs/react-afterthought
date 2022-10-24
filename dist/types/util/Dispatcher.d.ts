import { ServiceHistory } from "../types";
export interface DispatchHandler<T> {
    (data: T): any;
}
export declare class Dispatcher<T = ServiceHistory> {
    private readonly handlersHead;
    emit(data: T): void;
    subscribe(callback: DispatchHandler<T>): () => void;
}
