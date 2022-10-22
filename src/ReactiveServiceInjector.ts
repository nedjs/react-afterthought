import {useEffect, useRef, useState} from "react";
import {
	ReactiveInjector,
	ReactiveServiceInstance,
	ReactiveServices,
	ClassConstructor, ValidServiceKey, ValidServiceType
} from "./types";
import {currentRenderingComponentName, debug, isInReactDispatching, isInReactRendering} from "./util/helpers";
import {Dispatcher} from "./util/Dispatcher";
import {ReactiveService, SERVICE_INIT} from "./ReactiveService";


export class ReactiveServiceInjector<TServices = ReactiveServices> implements ReactiveInjector<TServices> {
	private readonly serviceNames = new Map<string, any>();
	private readonly serviceInstances = new Map<any, {
		instance?: any,
		type: any,
		name: string,
		dispatcher: Dispatcher,
	}>;

	public readonly services = new Proxy({}, new ServicesProxyHandler(this));

	constructor(
		config: Record<string, ValidServiceType>
	) {
		for (let key in config) {
			this.serviceNames.set(key, config[key]);

			this.serviceInstances.set(config[key], {
				instance: undefined,
				type: config[key],
				name: key,
				dispatcher: new Dispatcher(),
			})
		}
	}


	getService<T extends ClassConstructor>(service: ValidServiceKey): ReactiveServiceInstance<T, TServices> {
		if (!isInReactRendering()) {
			return this.initServiceProxy(service).proxy;
		}
		const proxyRef = useRef<{
			proxy: any,
			proxyHandler: ObjectProxyHandler,
		}>(null);
		if (proxyRef.current === null) {
			proxyRef.current = this.initServiceProxy(service);
		}

		const {proxyHandler, proxy} = proxyRef.current;

		const [, forceUpdate] = useState({});
		useEffect(() => {
			const sub = proxyHandler.dispatcher.listen(({path}) => {
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

	private initServiceProxy(service: ValidServiceKey) {
		const init = () => {
			if (typeof service === "string") return null;

			if (this.isConstructor(service)) {
				try {
					return new service();
				} catch (e) {
					if (!e || e.name !== 'TypeError' ||
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

		if (typeof service === 'string') {
			service = this.serviceNames.get(service);
		}

		const entry = this.serviceInstances.get(service);
		if (!entry) {
			throw new Error('Unregistered service ' + service);
		}

		if (entry.instance === undefined) {
			entry.instance = init();
			if (entry.instance[SERVICE_INIT]) {
				entry.instance[SERVICE_INIT](this);
			}
		}


		const proxyHandler = new ObjectProxyHandler(entry.name, entry.dispatcher, new Set())

		return {
			proxy: new Proxy(entry.instance, proxyHandler),
			proxyHandler,
		};
	}


	private isConstructor(v: any): v is new() => any {
		return typeof v === 'function' && v?.prototype?.constructor
	}
}

class ServicesProxyHandler implements ProxyHandler<any> {
	constructor(
		private readonly injector: ReactiveInjector
	) {
	}

	get(target: any, p: string | symbol, receiver: any): any {
		if (typeof p === 'string') {
			return this.injector.getService(p);
		} else {
			return target[p];
		}
	}

	set(target: any, p: string | symbol, newValue: any, receiver: any): boolean {
		throw new Error('Cannot set a service here, services must be registered.')
	}
}

class ObjectProxyHandler implements ProxyHandler<any> {
	public readonly proxies = new WeakMap<any, any>();

	constructor(
		public readonly path: string,
		public readonly dispatcher: Dispatcher,
		public readonly listenFor: Set<string>,
	) {
	}

	get(target: object, p: string | symbol, receiver: any): any {
		if (target instanceof ReactiveService && ReactiveService.prototype.hasOwnProperty(p)) {
			// dont proxy types which exist on ReactiveService
			return target[p];
		}

		let result;
		const propPath = this.pathForProp(p);
		if (typeof target[p] === 'function') {
			result = target[p];
		} else if (target[p] !== null && typeof target[p] === 'object') {
			if (!this.proxies.has(target[p]) || this.proxies.get(target[p]) == null) {
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
			throw new Error('Trying to improperly set property: "' + String(p) + '" during a rendering. This will cause an infinite loop and is not allowed. Full path is "' + this.pathForProp(p) + '"');
		}
		let oldValue = target[p];
		if (!isInReactDispatching()) {
			const path = this.pathForProp(p);
			target[p] = newValue;
			this.dispatcher.emit({path, oldValue, newValue});
		} else if (Array.isArray(target)) {
			const preLen = target.length;
			const oldVal = target[p];
			target[p] = newValue;

			if (oldVal !== newValue) {
				const path = this.pathForProp(p);
				debug('-Change', path);
				this.dispatcher.emit({path, oldValue, newValue});
			}

			if (target.length !== preLen) {
				const path = this.pathForProp('length');
				debug('-Change', path);
				this.dispatcher.emit({path, oldValue: preLen, newValue: target.length});
			}
		} else {
			target[p] = newValue;
			if (oldValue !== newValue) {
				const path = this.pathForProp(p);
				debug('-Change', path);
				this.dispatcher.emit({path, oldValue, newValue});
			}
		}
		return true;
	}

	private pathForProp(key: string | symbol) {
		return this.path + '.' + String(key)
	}
}
