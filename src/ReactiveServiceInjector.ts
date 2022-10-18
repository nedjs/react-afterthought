import {useEffect, useRef, useState} from "react";
import {
	ServiceConstructor,
	ReactiveInjector,
	ReactiveService,
	ReactiveServiceInstance
} from "./types";
import {currentRenderingComponentName, debug, isInReactDispatching, isInReactRendering} from "./util/helpers";
import {Dispatcher} from "./util/Dispatcher";


export class ReactiveServiceInjector implements ReactiveInjector {
	private readonly cache = new Map<any, {
		instance?: any,
		type: any,
		name: string,
		dispatcher: Dispatcher,
	}>;

	constructor(
		config: Record<string, ReactiveService>
	) {
		for(let key in config) {
			this.cache.set(config[key], {
				instance: undefined,
				type: config[key],
				name: key,
				dispatcher: new Dispatcher<string>(),
			})
		}
	}

	getService<T extends ReactiveService>(service: T): ReactiveServiceInstance<T> {
		const proxyRef = useRef<{
			proxy: any,
			proxyHandler: ObjectProxyHandler,
		}>(null);
		if(proxyRef.current === null) {
			const instance = this.createService(service);
			const proxyHandler = new ObjectProxyHandler(instance.name, instance.dispatcher, new Set())
			proxyRef.current = {
				proxy: new Proxy(instance.instance, proxyHandler),
				proxyHandler,
			};
		}

		const {proxyHandler, proxy} = proxyRef.current;

		const [, forceUpdate] = useState({});
		useEffect(() => {
			const sub = proxyHandler.dispatcher.listen((path) => {
				if (proxyHandler.listenFor.has(path)) {
					debug('-handle ' + true, proxyHandler.listenFor, path);
					forceUpdate({});
				} else {
					debug('-handle ' + false, proxyHandler.listenFor, path);
				}
			});
			return () => {
				sub();
			}
		}, []);

		return proxy;
	}

	private createService(service: any) {
		const init = () => {
			if((service as any)?.prototype?.constructor) {
				try {
					return new service(this);
				} catch (e) {
					if(!e || e.name !== 'TypeError' ||
						!(typeof e.message === 'string' && e.message.endsWith('is not a constructor'))) {
						throw e;
					} else {
						return service;
					}
				}
			} else {
				return service;
			}
		}

		const entry = this.cache.get(service);
		if(!entry) {
			throw new Error('Unregistered service ' + service);
		}

		if(entry.instance === undefined) {
			entry.instance = init();
		}

		return entry;
	}
}


class ObjectProxyHandler implements ProxyHandler<any> {
	public readonly proxies = new WeakMap<any, any>();

	constructor(
		public readonly path: string,
		public readonly dispatcher: Dispatcher,
		public readonly listenFor: Set<string>
	) {
	}

	get(target: object, p: string | symbol, receiver: any): any {
		let result;
		const propPath = this.pathForProp(p, Array.isArray(target));
		if (typeof target[p] === 'function') {
			result = target[p];
		} else if (target[p] !== null && typeof target[p] === 'object') {
			if(!this.proxies.has(target[p]) || this.proxies.get(target[p]) == null) {
				this.proxies.set(target[p], new Proxy(target[p], new ObjectProxyHandler(propPath, this.dispatcher, this.listenFor)));
			}
			result = this.proxies.get(target[p]);
		} else {
			result = target[p];
		}

		if (isInReactRendering()) {
			debug('-listen', currentRenderingComponentName(), propPath);
			this.listenFor.add(propPath);
		}

		return result;
	}

	set(target: object, p: string | symbol, newValue: any, receiver: any): boolean {
		if (isInReactRendering()) {
			throw new Error('Trying to improperly set property: "' + String(p) + '" during a rendering. This will cause an infinite loop and is not allowed. Full path is "' + this.pathForProp(p, false) + '"');
		}

		if(!isInReactDispatching()) {
			target[p] = newValue;
			return true;
		}

		if(Array.isArray(target)) {
			const preLen = target.length;
			const oldVal = target[p];
			target[p] = newValue;
			const didChangeLen = target.length === preLen;

			if(didChangeLen) {
				const path = this.pathForProp('length', false);
				debug('-Change', path);
				this.dispatcher.emit(path);
			}

			if (oldVal !== newValue) {
				const path = this.pathForProp(p, Array.isArray(target));
				debug('-Change', path);
				this.dispatcher.emit(path);
			}
		} else {
			const oldVal = target[p];
			target[p] = newValue;
			if (oldVal !== newValue) {
				const path = this.pathForProp(p, Array.isArray(target));
				debug('-Change', path);
				this.dispatcher.emit(path);
			}
		}
		return true;
	}

	private pathForProp(key: string | symbol, isArray: boolean) {
		// if(isArray) return this.path;
		return this.path + '.' + String(key)
	}
}
