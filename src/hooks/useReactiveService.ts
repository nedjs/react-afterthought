import {useReactiveInjector} from "./useReactiveInjector";
import {ClassConstructor, ReactiveServiceInstance, ReactiveServices, ValidServiceKey} from "../types";
import {ReactiveService} from "../ReactiveService";

export function useReactiveService<T extends ValidServiceKey, TServices = ReactiveServices>(service: T): ReactiveServiceInstance<T, TServices> {
	const contextValue = useReactiveInjector<TServices>();
	return contextValue.getService(service);
}
