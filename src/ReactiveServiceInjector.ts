import {
	ReactiveInjector,
	ReactiveServiceInstance,
	ReactiveServices,
	ClassConstructor, ValidServiceKey, ValidServiceType, ServiceHistory
} from "./types";
import {
	currentRenderingComponentName,
	debug,
	isInReactDispatching,
	RS_CONTEXT
} from "./util/helpers";
import {Dispatcher, DispatchHandler} from "./util/Dispatcher";
import {ReactiveService, SYM_SERVICE_WATCHES, SYM_SERVICE_PATH} from "./ReactiveService";


export class ReactiveServiceInjector<TServices = ReactiveServices> implements ReactiveInjector<TServices> {
	private readonly serviceNames = new Map<string, any>();
	private readonly dispatcher = new Dispatcher();
	private readonly serviceInstances = new Map<any, {
		instance: any,
		type: any,
		name: string,
	}>;

	public readonly services = new Proxy({}, new ServicesProxyHandler(this));

	constructor(
		config: Record<string, ValidServiceType>
	) {
		for (let key in config) {
			this.serviceNames.set(key, config[key]);

			this.serviceInstances.set(config[key], {
				instance: this.initService(config[key]),
				type: config[key],
				name: key
			})
		}


		if(__DEV__) {
			this.dispatcher.subscribe(({path}) => {
				debug('RS-Change', path);
			})
		}
	}

	subscribe(callback: DispatchHandler<ServiceHistory>): () => void {
		return this.dispatcher.subscribe(callback);
	}

	getService<T extends ClassConstructor>(service: ValidServiceKey): ReactiveServiceInstance<T, TServices> {
		return this.initServiceProxy(service).proxy;
	}

	private initServiceProxy(service: ValidServiceKey) {
		if (typeof service === 'string') {
			service = this.serviceNames.get(service);
		}

		const entry = this.serviceInstances.get(service);
		if (!entry) {
			throw new Error('Unregistered service ' + service);
		}

		const proxyHandler = new ObjectProxyHandler(entry.name, this.dispatcher)

		return {
			proxy: new Proxy(entry.instance, proxyHandler),
			proxyHandler,
		};
	}

	private initService(service: ClassConstructor | object) {
		let instance;
		if (this.isConstructor(service)) {
			try {
				instance = new service();
			} catch (e) {
				if (!e || e.name !== 'TypeError' ||
					!(typeof e.message === 'string' && e.message.endsWith('is not a constructor'))) {
					throw e;
				} else {
					instance = service;
				}
			}
		} else {
			instance = service;
		}

		ReactiveService.init(instance, this);
		return instance;
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
		public readonly watchPaths: Set<string> = new Set(),
	) {
	}

	get(target: object, p: string | symbol, receiver: any): any {
		if (target instanceof ReactiveService && ReactiveService.prototype.hasOwnProperty(p)) {
			// dont proxy types which exist on ReactiveService
			if(p === 'services') {

			}
			return target[p];
		} else if(p === SYM_SERVICE_WATCHES) {
			return this.watchPaths;
		} else if(p === SYM_SERVICE_PATH) {
			return this.path;
		}

		let result;
		const propPath = this.pathForProp(p);
		if (typeof target[p] === 'function') {
			result = target[p];
		} else if (target[p] !== null && typeof target[p] === 'object') {
			if (!this.proxies.has(target[p]) || this.proxies.get(target[p]) == null) {
				this.proxies.set(target[p], new Proxy(target[p], new ObjectProxyHandler(propPath, this.dispatcher, this.watchPaths)));
			}
			result = this.proxies.get(target[p]);
		} else {
			result = target[p];
		}

		if (RS_CONTEXT.current) {
			debug('RS-listen:', currentRenderingComponentName(), propPath);
			ReactiveService.getWatches(RS_CONTEXT.current).add(propPath);
		} else {
			debug('RS-ignore:', currentRenderingComponentName(), propPath);
		}

		return result;
	}

	set(target: object, p: string | symbol, newValue: any, receiver: any): boolean {
		if (RS_CONTEXT.current) {
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
				this.dispatcher.emit({path, oldValue, newValue});
			}

			if (target.length !== preLen) {
				const path = this.pathForProp('length');
				this.dispatcher.emit({path, oldValue: preLen, newValue: target.length});
			}
		} else {
			target[p] = newValue;
			if (oldValue !== newValue) {
				const path = this.pathForProp(p);
				this.dispatcher.emit({path, oldValue, newValue});
			}
		}
		return true;
	}

	private pathForProp(key: string | symbol) {
		return this.path + '.' + String(key)
	}
}
