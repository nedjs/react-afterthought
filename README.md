# `reactive-services`

A reactive service is a `class` or `object` which will notify components of field changes. Only components which used the data will be asked to refresh.

## Installation

```sh
npm install reactive-serivces
```

## Usage

### Basic usage

Here we create a simple counter and an increment button.

```js
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
