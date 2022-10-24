import {AfterthoughtInjector, ServiceDefinitions, ValidServiceKey} from "./types";
import {createInjector} from "./createInjector";
import React, {createContext, useLayoutEffect, useRef} from "react";

export const AfterthoughtContext = createContext<AfterthoughtInjector>(null as any);

export function AfterthoughtProvider(props: {
	injector?: never
	services: ServiceDefinitions<any>
	children?: any
} | {
	injector: AfterthoughtInjector
	services?: never
	children?: any
}) {
	if(props.injector) {
		return <AfterthoughtContext.Provider value={props.injector}>
			{props.children}
		</AfterthoughtContext.Provider>
	} else {
		const injector = useRef(createInjector(props.services)).current;
		return <AfterthoughtContext.Provider value={injector}>
			{props.children}
		</AfterthoughtContext.Provider>
	}
}

