import React, {createContext, MutableRefObject, Ref, useEffect, useRef} from "react";
import {ReactiveInjector, ValidServiceType} from "./types";
import {ReactiveServiceInjector} from "./ReactiveServiceInjector";

export const ReactiveServicesContext = createContext<ReactiveInjector>(null as any);

export function ReactiveServicesRoot(props: {
	injectorRef?: Ref<ReactiveServiceInjector>
	services: Record<string, ValidServiceType>
	children: JSX.Element
}) {
	const injectorRef = useRef(new ReactiveServiceInjector(props.services));

	useEffect(() => {
		if(props.injectorRef) {
			if(typeof props.injectorRef === 'function') {
				props.injectorRef(injectorRef.current);
			} else {
				(props.injectorRef as MutableRefObject<ReactiveServiceInjector>).current = injectorRef.current;
			}
		}
	}, []);

	return <ReactiveServicesContext.Provider value={injectorRef.current}>
		{props.children}
	</ReactiveServicesContext.Provider>
}
