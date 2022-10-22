import {useReactiveInjector} from "./useReactiveInjector";
import {ClassConstructor, ReactiveServiceInstance, ReactiveServices, ValidServiceKey} from "../types";
import {ReactiveService} from "../ReactiveService";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {debug, RS_CONTEXT} from "../util/helpers";

export function useReactiveService<T extends ValidServiceKey, TServices = ReactiveServices>(serviceType: T): ReactiveServiceInstance<T, TServices> {
	const contextValue = useReactiveInjector<TServices>();

	const serviceRef = useRef<T>(null);
	if (serviceRef.current === null) {
		serviceRef.current = contextValue.getService(serviceType);
	}

	const service = serviceRef.current;

	// To track the rendering process we need to enter and exit our react services context
	// this is to know when we should add variables to our watch and when we cannot
	RS_CONTEXT.enter(service);
	useLayoutEffect(() => {
		RS_CONTEXT.exit();
	});

	const [, forceUpdate] = useState({});
	useEffect(() => {
		const sub = contextValue.subscribe(({path}) => {
			const watchPaths = ReactiveService.getWatches(service);
			if (watchPaths.has(path)) {
				debug('RS-handle', watchPaths, path);
				forceUpdate({});
			} else {
				// debug('RS-handle ' + false, watchPaths, path);
			}
		});
		return () => {
			sub();
		}
	}, []);

	return service as any;
}
