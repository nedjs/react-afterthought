import {useReactiveInjector} from "./useReactiveInjector";
import {ReactiveService, ReactiveServiceInstance} from "../types";

export function useReactiveService<T extends ReactiveService>(service: T): ReactiveServiceInstance<T> {
	const contextValue = useReactiveInjector();
	return contextValue.getService(service);
}
