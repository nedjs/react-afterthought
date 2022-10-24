# `Afterthought`

This project aims to add simple, service based global state management to a React project.
Similar to other projects such as Redux except the state can contain functions themselves and communicate
between each other easily.

## Installation

```sh
npm install react-afterthought
```

## Basic Usage

Here we create a simple counter and an increment button.

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import {AfterthoughtProvider, useService} from "react-afterthought";

// can be a class or object
class CounterService {
    number = 0;
}

function CounterComponent() {
    const counterService = useService(CounterService);
    return <div>
        <p>Count: {counterService.number}</p>
        <button onClick={() => counterService.number++}>Increment</button>
    </div>
}

function App() {
    return <AfterthoughtProvider services={{CounterService}}>
        <CounterComponent />
    </AfterthoughtProvider>;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

### Types of services:
Services can be objects or classes:
```jsx
import {AfterthoughtInjector, AfterthoughtService, createInjector} from "react-afterthought";

class Service {
    number = 1
}

// or extending the declared afterthought service.
// doing this gives you access to other services via the "services" property
class Service extends AfterthoughtService {
    number = 1
}

// as a plain object
const Service = {
    number: 1
}
```

### Registering services

Registering a service can be done using the injector or just dropped into the provider:
```jsx
// inline service delcaration
<AfterthoughtProvider services={{ Service }}>
    ...
</AfterthoughtProvider>

// using injector to access services outside components
const injector = createInjector({ Service });
<AfterthoughtProvider injector={injector}>
    ...
</AfterthoughtProvider>
```


## Interacting from outside React

Say you have exiting code or code which needs to interact with a service and notify your
React components of changes. This should be done by using the `injector`:

```jsx
// can be a class or object
class CounterService {
    seconds = 0;
}

function CounterComponent() {
    const counterService = useService(CounterService);
    return <div>
        <p>Number of Seconds: {counterService.seconds}</p>
    </div>
}

const injector = createInjector({ CounterService })

function App() {
    return <AfterthoughtProvider injector={injector}>
        <CounterComponent />
    </AfterthoughtProvider>;
}

setInterval(() => {
    // You must call `getService` or use `injector.services.CounterService` or components wont update
    injector.getService(CounterService).seconds++;
    // or 
    // injector.services.CounterService.seconds++;
}, 1000)
```

### Decoupling depdencies

You might encounter circular dependencies or many things importing your services and
not want to couple your service import to your component. To resolve this you may also
reference your services by their name. For instance

```jsx
// Register MyService under the name myService
<AfterthoughtProvider services={{ myService: MyService }}>
    ...
</AfterthoughtProvider>

// You can now access this by its string name
useService('myService');
// or
injector.getService('myService')
// or
injector.services.myService
```

### Typescript usage

Most projects only contain one provider and the types are global. You can declare your
service types on the global namespace by extending the `AfterthoughtServices` interface.
This is the default type for all services.

```ts
const injector = createInjector({ CounterService })

type ProjectServices = typeof injector.services;

declare module "react-afterthought" {
    interface AfterthoughtServices extends ProjectServices {
    }
}
``` 

