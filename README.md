# `reactive-services`

A reactive service is a `class` or `object` which will notify components of field changes. Only components which used the data will be asked to refresh.

## Installation

```sh
npm install reactive-serivces
```

## Usage

### Basic usage

```js

import React from 'react';
import { createRoot } from 'react-dom/client';
import {ReactiveServicesProvider, useReactiveService} from "reactive-services";

class CounterService {
    number = 0;
}

function CounterComponent() {
    const counterService = useReactiveService(CounterService);
    return <div>
        <p>Count: {counterService.number}</p>
        <button onClick={() => counterService.number++}>Increment</button>
    </div>
}

function App() {
    return <ReactiveServicesProvider services={{CounterService}}>
        <CounterComponent />
    </ReactiveServicesProvider>;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```
