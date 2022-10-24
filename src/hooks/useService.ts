import {useInjector} from "./useInjector";
import {ToServiceInstance, AfterthoughtServices, ValidServiceKey} from "../types";
import {AfterthoughtService} from "../AfterthoughtService";
import {useEffect, useLayoutEffect, useRef, useState} from "react";
import {debug, RS_CONTEXT} from "../util/helpers";

export function useService<TServices = AfterthoughtServices, T extends ValidServiceKey<TServices> = never>(serviceType: T): ToServiceInstance<T, TServices> {
	const contextValue = useInjector<TServices>();

	const serviceRef = useRef<any>(null);
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
			const watchPaths = AfterthoughtService.getWatches(service);
			if (watchPaths.has(path)) {
				debug('RS-handle', watchPaths, path);
				forceUpdate({});
			} else {
				debug('RS-see', watchPaths, path);
			}
		});
		return () => {
			sub();
		}
	}, []);

	return service as any;
}
