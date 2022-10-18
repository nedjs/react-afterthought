import React, {createContext, MutableRefObject, Ref, RefObject, useEffect, useRef, useState} from "react";
import {ServiceConstructor, ReactiveInjector, ReactiveService} from "./types";
import {ReactiveServiceInjector} from "./ReactiveServiceInjector";

export const ReactiveServicesContext = createContext<ReactiveInjector>(null as any);

export function ReactiveServicesProvider(props: {
	injectorRef?: Ref<ReactiveServiceInjector>
	services: Record<string, ReactiveService>
	children: JSX.Element
}) {

	const injector = new ReactiveServiceInjector(props.services);
	if(props.injectorRef) {
		if(typeof props.injectorRef === 'function') {
			props.injectorRef(injector);
		} else {
			(props.injectorRef as MutableRefObject<ReactiveServiceInjector>).current = injector;
		}
	}
	return <ReactiveServicesContext.Provider value={injector}>
		{props.children}
	</ReactiveServicesContext.Provider>
}
