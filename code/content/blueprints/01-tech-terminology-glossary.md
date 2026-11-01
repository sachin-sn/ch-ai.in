# Tech Interview Terminology Glossary

This glossary lists the terms that interviewers expect you to know. Each entry has a definition and a short example. Use the index to go to a topic. Say each term in a sentence about your own work.

## Index

The glossary has 47 topics.

### Languages and frameworks

1. [JavaScript](#glossary-javascript)
2. [JavaScript arrays and data structures](#glossary-javascript-arrays-and-data-structures)
3. [Node.js](#glossary-node-js)
4. [React](#glossary-react)
5. [Redux](#glossary-redux)
6. [TypeScript](#glossary-typescript)
7. [TypeScript in depth](#glossary-typescript-in-depth)

### Algorithms, design and architecture

8. [DSA terms](#glossary-dsa-terms)
9. [Design principles](#glossary-design-principles)
10. [SOLID principles in depth](#glossary-solid-principles-in-depth)
11. [Design patterns](#glossary-design-patterns)
12. [JavaScript design patterns](#glossary-javascript-design-patterns)
13. [Distributed and resilience patterns](#glossary-distributed-and-resilience-patterns)
14. [Architecture styles and quality attributes](#glossary-architecture-styles-and-quality-attributes)
15. [HLD: high-level design](#glossary-hld-high-level-design)
16. [LLD: low-level design](#glossary-lld-low-level-design)

### AWS

17. [AWS](#glossary-aws)
18. [AWS deep dive: Lambda and Step Functions](#glossary-aws-deep-dive-lambda-and-step-functions)
19. [AWS deep dive: DynamoDB and S3](#glossary-aws-deep-dive-dynamodb-and-s3)
20. [AWS deep dive: EC2 and EKS](#glossary-aws-deep-dive-ec2-and-eks)
21. [AWS deep dive: API Gateway, CloudFront and CloudWatch Logs](#glossary-aws-deep-dive-api-gateway-cloudfront-and-cloudwatch-logs)
22. [AWS deep dive: EventBridge, SQS and SNS](#glossary-aws-deep-dive-eventbridge-sqs-and-sns)
23. [AWS deep dive: KMS and IAM](#glossary-aws-deep-dive-kms-and-iam)

### Data and messaging

24. [PostgreSQL](#glossary-postgresql)
25. [MongoDB](#glossary-mongodb)
26. [Kafka](#glossary-kafka)

### Platform and delivery

27. [Kubernetes](#glossary-kubernetes)
28. [DevOps](#glossary-devops)
29. [CI/CD](#glossary-ci-cd)
30. [Types of deployment](#glossary-types-of-deployment)
31. [Git](#glossary-git)
32. [SDLC: software development life cycle](#glossary-sdlc-software-development-life-cycle)
33. [Agile](#glossary-agile)

### Testing and quality

34. [Testing strategies and the test pyramid](#glossary-testing-strategies-and-the-test-pyramid)
35. [Types of testing](#glossary-types-of-testing)
36. [Jest](#glossary-jest)
37. [Mocha, Chai and Sinon](#glossary-mocha-chai-and-sinon)
38. [Playwright](#glossary-playwright)
39. [Cypress](#glossary-cypress)
40. [Selenium](#glossary-selenium)

### APIs and security

41. [REST API](#glossary-rest-api)
42. [GraphQL](#glossary-graphql)
43. [WebSocket and real-time](#glossary-websocket-and-real-time)
44. [OWASP and application security](#glossary-owasp-and-application-security)

### AI

45. [AI and Gen AI](#glossary-ai-and-gen-ai)
46. [AI pillars and guardrails](#glossary-ai-pillars-and-guardrails)
47. [Spec-driven development](#glossary-spec-driven-development)


<a id="glossary-javascript"></a>

## JavaScript

| Term | Definition | Example |
| --- | --- | --- |
| Hoisting | Declarations are moved to the top of their scope before execution; `let`/`const` stay in the temporal dead zone until initialised | `console.log(a); var a = 1;` prints `undefined` |
| Closure | A function that remembers variables from its outer scope after that scope has finished | `const c = () => { let n = 0; return () => ++n; }` |
| Scope chain | Variable lookup walks from inner scope outward | Inner function reads an outer `const` |
| Lexical scoping | Scope is fixed by where code is written, not where it is called | Nested functions see outer variables |
| `this` binding | Depends on how a function is called; arrow functions inherit it lexically | `obj.fn()` gives `this = obj` |
| Prototype chain | Objects inherit properties from other objects via `__proto__` | `[].map` comes from `Array.prototype` |
| Event loop | Moves callbacks to the call stack when it is empty | Microtasks (promises) run before `setTimeout` |
| Microtask vs macrotask | Promise callbacks run before timers and I/O callbacks | `Promise.then` before `setTimeout(0)` |
| Promise | Object for a future value: pending, fulfilled or rejected | `fetch(url).then(r => r.json())` |
| async/await | Promise syntax that reads like synchronous code | `const r = await fetch(url);` |
| Higher-order function | Takes or returns a function | `arr.map(x => x * 2)` |
| Pure function | Same input gives same output, no side effects | `const add = (a, b) => a + b` |
| Immutability | Create new data instead of changing existing data | `const b = [...a, 4]` |
| Currying | Turning `f(a, b)` into `f(a)(b)` | `const add = a => b => a + b` |
| Debounce | Run only after events stop for a delay | Search box waits 300 ms after typing |
| Throttle | Run at most once per interval | Scroll handler fires every 100 ms |
| Memoization | Cache results by input | `cache[n] ??= compute(n)` |
| Destructuring | Unpack values into variables | `const { id } = user;` |
| Spread / rest | `...` expands or collects values | `fn(...args)` |
| Optional chaining | Safe property access | `user?.address?.city` |
| Nullish coalescing | Default only for `null` or `undefined` | `count ?? 0` |
| Event bubbling | Events travel from target up to ancestors | Click on a button reaches its `div` |
| Event delegation | One parent listener handles many children | `ul.addEventListener('click', ...)` |
| Shallow vs deep copy | Shallow copies one level; deep copies nested objects | `structuredClone(obj)` |
| `==` vs `===` | Loose equality coerces types; strict does not | `'1' == 1` true, `'1' === 1` false |
| Truthy / falsy | Values that coerce to true or false | `0`, `""`, `null`, `NaN` are falsy |
| Polyfill | Code that adds a missing feature | Adding `Array.prototype.at` |
| Transpiling | Converting new syntax to older syntax | Babel turns arrow functions to functions |
| Tree shaking | Bundler removes unused exports | Unused named export dropped from the bundle |
| ES Modules vs CommonJS | `import/export` (static) vs `require/module.exports` | `import fs from 'fs'` vs `const fs = require('fs')` |
| Generator | Function that can pause with `yield` | `function* g() { yield 1; }` |
| WeakMap | Map whose keys are garbage collectable | Private data per object |
| Symbol | Unique, immutable identifier | `Symbol('id')` |
| Temporal dead zone | Time between scope entry and `let` initialisation | Accessing `x` before `let x` throws |


<a id="glossary-javascript-arrays-and-data-structures"></a>

## JavaScript arrays and data structures

### Array methods

| Method | Definition | Example |
| --- | --- | --- |
| `map` | New array from transforming each item | `[1,2].map(x => x*2)` gives `[2,4]` |
| `filter` | New array of items passing a test | `[1,2,3].filter(x => x>1)` gives `[2,3]` |
| `reduce` | Folds the array into one value | `[1,2,3].reduce((a,b) => a+b, 0)` gives `6` |
| `forEach` | Runs a function per item, returns nothing | `arr.forEach(console.log)` |
| `find` / `findIndex` | First match / its index | `users.find(u => u.id === 2)` |
| `findLast` | Last match | `arr.findLast(x => x>1)` |
| `some` / `every` | Any item passes / all items pass | `arr.some(x => x>2)` |
| `includes` / `indexOf` | Has the value / position of the value | `[1,2].includes(2)` is `true` |
| `push` / `pop` | Add / remove at the end (mutates) | `arr.push(4)` |
| `shift` / `unshift` | Remove / add at the start (mutates) | `arr.unshift(0)` |
| `slice` | Copy part of an array, no mutation | `arr.slice(1, 3)` |
| `splice` | Remove or insert in place (mutates) | `arr.splice(1, 1)` |
| `concat` / spread | Join arrays | `[...a, ...b]` |
| `sort` | Sorts in place; default is string order | `arr.sort((a,b) => a-b)` |
| `toSorted` / `toReversed` / `with` | Non-mutating versions | `arr.toSorted()` |
| `reverse` | Reverses in place | `arr.reverse()` |
| `flat` / `flatMap` | Flatten nested arrays / map then flatten | `[[1],[2]].flat()` gives `[1,2]` |
| `join` | Array to string | `['a','b'].join('-')` gives `a-b` |
| `Array.from` | Build an array from iterable or length | `Array.from({length: 3}, (_, i) => i)` |
| `Array.isArray` | Check for array | `Array.isArray([])` |
| `fill` | Fill with a value | `new Array(3).fill(0)` |
| `at` | Access by index, negative allowed | `arr.at(-1)` |
| `entries` / `keys` / `values` | Iterators over the array | `for (const [i, v] of arr.entries())` |
| `Object.groupBy` | Group items by a key function | `Object.groupBy(users, u => u.role)` |
| Mutating vs non-mutating | Whether the original array changes | `sort` mutates, `slice` does not |
| Sparse array | Array with empty slots | `[1, , 3]` |
| Typed array | Fixed-type binary array | `new Uint8Array(4)` |

### Set, Map and other structures

| Structure | Definition | Example |
| --- | --- | --- |
| `Set` | Collection of unique values | `new Set([1,1,2])` has size 2 |
| Set operations | `add`, `has`, `delete`, `size`, `clear` | `s.has(2)` |
| Set math | Union, intersection, difference | `a.intersection(b)` (ES2025) |
| `Map` | Key-value pairs; keys of any type; keeps insertion order | `m.set(obj, 'x')` |
| Map operations | `get`, `set`, `has`, `delete`, `size` | `m.get('a')` |
| Map vs Object | Map: any key type, ordered, `size`; Object: string and symbol keys | Use Map for dynamic keys |
| `WeakSet` | Set of objects held weakly for garbage collection | Track visited nodes |
| `WeakMap` | Map with weakly held object keys | Private data per object |
| `WeakRef` | Reference that does not stop garbage collection | Cache entries |
| Stack | Last in, first out | `push` and `pop` on an array |
| Queue | First in, first out | `push` and `shift` |
| Deque | Add and remove at both ends | Array with `unshift` and `pop` |
| Linked list | Nodes pointing to the next node | `{ value: 1, next: node2 }` |
| Tree | Hierarchy of nodes | `{ value, left, right }` |
| Graph | Nodes and edges | `Map<node, node[]>` adjacency list |
| Priority queue / heap | Always gives smallest or largest item first | Task scheduling |
| Object as hash map | Key-value lookup via property names | `counts[word] = (counts[word] ?? 0) + 1` |
| Iterator / iterable | Object that can be looped with `for...of` | `Symbol.iterator` |
| `Object.freeze` | Shallow immutability | `Object.freeze(config)` |
| `JSON.stringify` / `parse` | Object to string and back | Deep copy shortcut with limits |
| `structuredClone` | Deep copy of most values | `structuredClone(obj)` |


<a id="glossary-node-js"></a>

## Node.js

| Term | Definition | Example |
| --- | --- | --- |
| V8 | Google's JavaScript engine that Node embeds | Compiles JS to machine code |
| libuv | C library giving Node its event loop and thread pool | Handles file and network I/O |
| Non-blocking I/O | I/O is handed off so the main thread keeps running | `fs.readFile(cb)` |
| Event loop phases | timers, pending callbacks, poll, check, close | `setImmediate` runs in the check phase |
| `process.nextTick` | Runs before other async work in the current phase | Runs before promise callbacks |
| Worker threads | Run CPU-heavy JS in parallel threads | Image processing off the main thread |
| Cluster | Multiple Node processes sharing one port | One worker per CPU core |
| Child process | Spawn another program or script | `spawn('ls', ['-l'])` |
| Stream | Process data in chunks, not all at once | `createReadStream('big.csv')` |
| Buffer | Raw binary data | `Buffer.from('hi')` |
| Backpressure | Slow consumer tells the producer to slow down | `pipeline()` handles it automatically |
| EventEmitter | Built-in publish/subscribe class | `emitter.on('data', fn)` |
| Middleware | Function in a request chain with `req, res, next` | `app.use(logger)` |
| Routing | Mapping URL and method to a handler | `app.get('/users/:id', ...)` |
| Controller / service / repository | Layers: HTTP handling, business logic, data access | `UserController` calls `UserService` |
| `package.json` / lock file | Manifest of dependencies / exact installed versions | `package-lock.json` |
| Semantic versioning | MAJOR.MINOR.PATCH version scheme | `^1.2.3` allows 1.x.x |
| Environment variables | Config kept outside code | `process.env.DB_URL` |
| CORS | Browser rule for cross-origin requests | `Access-Control-Allow-Origin` header |
| JWT | Signed token carrying claims, used for stateless auth | `Authorization: Bearer <token>` |
| Session | Server-stored login state keyed by a cookie | `express-session` |
| OAuth2 / OIDC | Delegated authorisation / identity layer on top of it | "Sign in with Google" |
| Rate limiting | Cap requests per client per window | 100 requests per minute per IP |
| Graceful shutdown | Finish in-flight requests before exit | `server.close()` on `SIGTERM` |
| AsyncLocalStorage | Carries context (like request ID) across async calls | Correlation ID in logs |
| Memory leak | Objects kept reachable and never freed | Growing array of listeners |
| Garbage collection | V8 reclaims unreachable memory automatically | Mark-and-sweep |
| Idempotency | Repeating a request has the same effect as once | `PUT` or an idempotency key on payments |
| Health check | Endpoint that reports whether the service is alive | `GET /health` |
| PM2 | Process manager for Node apps | `pm2 start app.js -i max` |


<a id="glossary-react"></a>

## React

| Term | Definition | Example |
| --- | --- | --- |
| Component | Reusable UI unit, usually a function returning JSX | `const Card = () => <div/>` |
| JSX | HTML-like syntax compiled to `createElement` calls | `<Button size="lg" />` |
| Props | Read-only inputs passed from parent to child | `<User name="Sachin" />` |
| State | Data owned by a component that triggers re-render when changed | `const [n, setN] = useState(0)` |
| Virtual DOM | In-memory UI tree used to compute minimal DOM updates | Diff old tree against new tree |
| Reconciliation | Comparing trees to decide what to update | Same type updates, different type remounts |
| Fiber | Reconciler architecture that makes rendering interruptible | Enables concurrent features |
| Render phase vs commit phase | Render computes changes (pure); commit applies them to the DOM | Effects run after commit |
| Hooks | Functions that add state and lifecycle to function components | `useState`, `useEffect` |
| `useEffect` | Runs side effects after render, with cleanup | Subscribe on mount, unsubscribe on unmount |
| `useLayoutEffect` | Runs synchronously after DOM changes, before paint | Measure an element's size |
| `useMemo` | Caches a computed value between renders | `useMemo(() => sort(list), [list])` |
| `useCallback` | Caches a function reference between renders | Stable handler for a memoised child |
| `useRef` | Mutable box that does not trigger re-render | `inputRef.current.focus()` |
| `useReducer` | State with a reducer function for complex updates | `dispatch({ type: 'add' })` |
| `useContext` | Reads the nearest context value | `const theme = useContext(ThemeCtx)` |
| `useTransition` | Marks a state update as low priority | Keep typing smooth while filtering a big list |
| `useDeferredValue` | Defers re-rendering with a lagging copy of a value | Deferred search results |
| Custom hook | `useXxx` function that reuses stateful logic | `useDebounce(value, 300)` |
| Controlled component | Form value driven by React state | `<input value={v} onChange={...} />` |
| Uncontrolled component | Form value held by the DOM, read via ref | `<input ref={r} />` |
| Lifting state up | Move shared state to the nearest common parent | Parent holds `selectedId` |
| Prop drilling | Passing props through components that do not use them | `A -> B -> C -> D` |
| Context API | Share data across the tree without props | Theme or auth user |
| HOC | Function that takes a component and returns an enhanced one | `withAuth(Dashboard)` |
| Render props | Prop that is a function returning UI | `<Mouse render={pos => ...} />` |
| `React.memo` | Skips re-render when props are unchanged | `export default memo(Row)` |
| Key | Identifies list items across renders | `items.map(i => <li key={i.id} />)` |
| Side effect | Anything outside pure rendering | Fetch, timers, subscriptions |
| Error boundary | Class component that catches render errors in its subtree | `getDerivedStateFromError` |
| Suspense | Shows a fallback while code or data loads | `<Suspense fallback={<Spinner/>}>` |
| Lazy loading / code splitting | Load code only when needed | `const Page = lazy(() => import('./Page'))` |
| SSR / CSR / SSG | Server rendering / client rendering / build-time rendering | Next.js supports all three |
| Hydration | React attaches handlers to server-rendered HTML | `hydrateRoot(el, <App/>)` |
| Portal | Render children into a different DOM node | Modal in `document.body` |
| Strict Mode | Dev-only checks, including double render | `<StrictMode>` wrapper |
| Concurrent rendering | React can pause and prioritise renders | `startTransition(() => ...)` |
| Unidirectional data flow | Data flows down, events flow up | Parent passes callback to child |
| Stale closure | Callback captures old state because of missing dependencies | Interval always logs `0` |


<a id="glossary-redux"></a>

## Redux

| Term | Definition | Example |
| --- | --- | --- |
| Store | Single object holding the whole app state | `configureStore({ reducer })` |
| Action | Plain object describing what happened | `{ type: 'cart/add', payload: item }` |
| Action creator | Function that returns an action | `const add = item => ({ type: 'cart/add', payload: item })` |
| Reducer | Pure function `(state, action) => newState` | `switch (action.type) { ... }` |
| Dispatch | Sends an action to the store | `dispatch(add(item))` |
| Selector | Function that reads a slice of state | `state => state.cart.items` |
| Single source of truth | One store is the authority for shared state | Whole app reads from the store |
| Immutability | Reducers return new objects, never mutate | `{ ...state, count: state.count + 1 }` |
| Middleware | Code between dispatch and reducer | Logger, thunk, saga |
| Thunk | Middleware that lets you dispatch a function for async logic | `dispatch(fetchUser(42))` |
| Saga | Middleware using generators for complex side-effect flows | `takeLatest('search', worker)` |
| Redux Toolkit (RTK) | Official toolset that removes boilerplate | `createSlice`, `configureStore` |
| Slice | Reducer plus actions for one feature | `createSlice({ name: 'cart', ... })` |
| Immer | Library inside RTK that lets you write mutating code safely | `state.items.push(x)` |
| `createAsyncThunk` | Generates pending, fulfilled and rejected actions | `createAsyncThunk('user/fetch', fn)` |
| RTK Query | Data fetching and caching built into RTK | `useGetUserQuery(id)` |
| `extraReducers` | Handle actions defined outside a slice | `builder.addCase(fetchUser.fulfilled, ...)` |
| Normalised state | Store entities by id, not nested | `{ byId: {}, allIds: [] }` |
| `createSelector` | Memoised selector (Reselect) | Recompute only when inputs change |
| Redux DevTools | Inspect actions and time-travel state | Replay actions |
| `useSelector` / `useDispatch` | React-Redux hooks to read state and dispatch | `const n = useSelector(s => s.count)` |
| Time travel debugging | Step back through past states | Possible because reducers are pure |
| Client state vs server state | State the app owns vs a cached copy of backend data | Redux for UI, React Query for API data |


<a id="glossary-typescript"></a>

## TypeScript

| Term | Definition | Example |
| --- | --- | --- |
| Type annotation | Explicitly declare a type | `let age: number = 30` |
| Type inference | Compiler works out the type | `const s = 'hi'` is `string` |
| Interface | Describes an object's shape; can be extended and merged | `interface User { id: number }` |
| Type alias | Names any type, including unions | `type Id = string \| number` |
| Union | Value is one of several types | `string \| null` |
| Intersection | Value has all combined types | `User & { role: 'admin' }` |
| Literal type | Exact value as a type | `type Dir = 'up' \| 'down'` |
| Generics | Reusable code over many types | `function first<T>(a: T[]): T` |
| Generic constraint | Limit what a generic accepts | `<T extends { id: number }>` |
| Type guard | Check that narrows a type | `x is User` |
| Type narrowing | Refining a type inside a branch | `if (typeof x === 'string')` |
| Discriminated union | Union with a shared literal field | `{ kind: 'a' } \| { kind: 'b' }` |
| `unknown` | Safe top type; must narrow before use | `const v: unknown = JSON.parse(s)` |
| `any` | Turns off type checking | Avoid in strict code |
| `never` | Value that cannot occur; used for exhaustiveness | `const x: never = shape` |
| `void` | Function returns no useful value | `(): void => {}` |
| Utility types | Built-in type transformers | `Partial<T>`, `Pick<T, K>`, `Omit<T, K>`, `Record<K, V>` |
| `keyof` | Union of an object's keys | `keyof User` is `'id' \| 'name'` |
| `typeof` (type) | Gets the type of a value | `type C = typeof config` |
| Mapped type | Builds a type by iterating keys | `{ [K in keyof T]: boolean }` |
| Conditional type | Type chosen by a condition | `T extends string ? 'a' : 'b'` |
| `infer` | Captures a type inside a conditional type | `T extends Promise<infer U> ? U : T` |
| Enum | Named set of constants | `enum Role { Admin, User }` |
| `const` assertion | Treat value as readonly literals | `['a', 'b'] as const` |
| Type assertion | Override the compiler's type | `value as string` |
| Non-null assertion | Tell compiler a value is not null | `el!.focus()` |
| Optional / readonly | Optional or immutable property | `name?: string`, `readonly id` |
| Structural typing | Compatibility depends on shape, not name | Object with `id` fits `{ id: number }` |
| `strict` mode | Turns on the strictest checks | `"strict": true` in `tsconfig.json` |
| Declaration file | Type definitions for JS code | `index.d.ts`, `@types/node` |
| Overloads | Several call signatures for one function | `function f(a: string): string; function f(a: number): number` |
| Satisfies | Check a value matches a type without widening it | `const c = { ... } satisfies Config` |


<a id="glossary-typescript-in-depth"></a>

## TypeScript in depth

### Types and type system

| Term | Definition | Example |
| --- | --- | --- |
| Structural typing | Types match by shape, not by name | `{ id: 1 }` fits `{ id: number }` |
| Type inference | The compiler works out types you did not write | `const n = 5` is `number` |
| Type annotation | Writing a type explicitly | `let age: number` |
| Type assertion (`as`) | Tells the compiler to treat a value as a type; no runtime check | `value as string` |
| Non-null assertion (`!`) | Says a value is not null or undefined | `el!.focus()` |
| `satisfies` | Checks a value against a type while keeping its narrow inferred type | `const c = { a: 1 } satisfies Record<string, number>` |
| `any` | Turns off type checking for a value | Avoid; use `unknown` |
| `unknown` | Safe top type; must be narrowed before use | `if (typeof x === 'string') ...` |
| `never` | A value that cannot exist; used for exhaustive checks | Function that always throws |
| `void` | No useful return value | `function log(): void {}` |
| Literal type | A type of one exact value | `type Dir = 'up' \| 'down'` |
| Union (`\|`) | One of several types | `string \| number` |
| Intersection (`&`) | All types combined | `User & { role: string }` |
| Tuple | Fixed-length array with typed positions | `[string, number]` |
| Enum | Named set of constants | `enum Status { Active, Closed }` |
| `const enum` | Enum inlined at compile time | Faster, but problematic with some tools |
| `readonly` | Property or array cannot be changed | `readonly string[]` |
| `as const` | Makes literals deeply readonly and narrow | `['a','b'] as const` |
| Optional property | May be absent | `{ name?: string }` |
| Index signature | Object with any number of keys of one type | `{ [key: string]: number }` |
| Interface | Describes an object shape; can merge and extend | `interface User { id: number }` |
| Type alias | Names any type, including unions | `type ID = string \| number` |
| Declaration merging | Same-name interfaces combine | Extending a library's types |
| Class types | `public`, `private`, `protected`, `readonly`, `abstract` | `private balance: number` |
| `implements` | A class promises to match an interface | `class A implements Repo {}` |
| Parameter properties | Constructor shorthand that declares fields | `constructor(private db: Db) {}` |
| `this` types and `ThisParameterType` | Type of `this` in a function | `function f(this: Window)` |
| Function overloads | Several call signatures for one function | `function f(a: string): string; function f(a: number): number` |
| `unique symbol` and branded types | Make structurally equal types incompatible | `type UserId = string & { __brand: 'UserId' }` |

### Generics, narrowing and advanced types

| Term | Definition | Example |
| --- | --- | --- |
| Generic | A type with a parameter | `function id<T>(x: T): T` |
| Constraint (`extends`) | Limits what a generic can be | `<T extends { id: number }>` |
| Default type parameter | Fallback when none given | `<T = string>` |
| `keyof` | Union of an object type's keys | `keyof User` |
| `typeof` (type position) | Gets the type of a value | `typeof config` |
| Indexed access type | Type of a property | `User['id']` |
| Conditional type | Type chosen by a condition | `T extends string ? 'a' : 'b'` |
| `infer` | Captures a type inside a conditional type | `T extends Promise<infer U> ? U : T` |
| Mapped type | Builds a type by looping over keys | `{ [K in keyof T]: string }` |
| Key remapping (`as`) | Rename keys in a mapped type | `[K in keyof T as Uppercase<K & string>]` |
| Template literal type | Types built from string patterns | `` `user_${string}` `` |
| Recursive type | A type that refers to itself | `type Json = string \| Json[] \| { [k: string]: Json }` |
| Distributive conditional type | Conditional applied to each union member | `Exclude<T, U>` |
| Variance (`in`, `out`) | Whether a generic is covariant or contravariant | `interface Box<out T>` |
| Type guard | Function that narrows a type | `x is string` |
| Assertion function | Throws unless a condition holds, narrowing the type | `asserts x is string` |
| Narrowing | Refining a union by checks | `typeof`, `instanceof`, `in`, equality, truthiness |
| Discriminated union | Union with a shared literal field to tell members apart | `{ kind: 'a' } \| { kind: 'b' }` |
| Exhaustiveness check | Use `never` to catch missing cases | `const _x: never = shape` |
| Control flow analysis | The compiler tracks types through branches | Type changes after an `if` |

### Utility types

| Term | Definition | Example |
| --- | --- | --- |
| `Partial<T>` | All properties optional | `Partial<User>` |
| `Required<T>` | All properties required | `Required<User>` |
| `Readonly<T>` | All properties readonly | `Readonly<User>` |
| `Pick<T, K>` | Keep only some keys | `Pick<User, 'id' \| 'name'>` |
| `Omit<T, K>` | Remove some keys | `Omit<User, 'password'>` |
| `Record<K, V>` | Object with keys K and values V | `Record<string, number>` |
| `Exclude<T, U>` / `Extract<T, U>` | Remove / keep union members | `Exclude<'a'\|'b','a'>` is `'b'` |
| `NonNullable<T>` | Remove null and undefined | `NonNullable<string \| null>` |
| `ReturnType<F>` / `Parameters<F>` | Return type / argument tuple of a function | `ReturnType<typeof fn>` |
| `Awaited<T>` | Unwrap a promise type | `Awaited<Promise<number>>` |
| `InstanceType<C>` / `ConstructorParameters<C>` | Types from a class constructor | `InstanceType<typeof Cls>` |
| `ThisType<T>` | Marks the type of `this` in object literals | Used in builders |
| String helpers | `Uppercase`, `Lowercase`, `Capitalize`, `Uncapitalize` | `Capitalize<'cat'>` |

### Compiler, configuration and tooling

| Term | Definition | Example |
| --- | --- | --- |
| `tsc` | The TypeScript compiler | `tsc --noEmit` |
| `tsconfig.json` | Compiler configuration | `"target": "ES2022"` |
| `strict` | Turns on the strict family of checks | Always enable |
| `strictNullChecks` | `null` and `undefined` are separate types | Catches missing values |
| `noImplicitAny` | Error when a type would be implicit `any` | Parameters need types |
| `noUncheckedIndexedAccess` | Indexing may return `undefined` | `arr[0]` is `T \| undefined` |
| `exactOptionalPropertyTypes` | Optional means absent, not `undefined` | Stricter objects |
| `target` / `module` / `moduleResolution` | Output JS version / module format / how imports resolve | `NodeNext`, `Bundler` |
| `lib` | Built-in type definitions to include | `["ES2022", "DOM"]` |
| `paths` and `baseUrl` | Import aliases | `"@/*": ["src/*"]` |
| `include` / `exclude` / `references` | Which files to compile / project references | Monorepo builds |
| `composite` and `incremental` | Faster builds with build info | `tsc -b` |
| `isolatedModules` | Each file must compile alone (needed by Babel, esbuild) | Re-export types with `export type` |
| `verbatimModuleSyntax` | Keep imports and exports as written | Use `import type` |
| `import type` | Import only for types; erased at build | `import type { User } from './user'` |
| Declaration file (`.d.ts`) | Types without code | `index.d.ts` |
| `@types/*` | Community type packages | `@types/node` |
| `declare` | Tell the compiler something exists | `declare const VERSION: string` |
| Module augmentation | Add to an existing module's types | Add a field to Express `Request` |
| Ambient / global declaration | Types available everywhere | `declare global { ... }` |
| Decorators | Annotations on classes and members | NestJS `@Controller()` |
| Source map | Maps compiled JS back to TS for debugging | `"sourceMap": true` |
| Transpile vs type check | Tools like esbuild and SWC only strip types; `tsc` checks | Run `tsc --noEmit` in CI |
| `ts-node`, `tsx` | Run TypeScript directly in Node | `tsx server.ts` |
| Type stripping | Node can run `.ts` files by removing types | Node 22+ flag, default in newer versions |
| ESLint with `typescript-eslint` | Linting that understands types | `no-floating-promises` |
| Zod / Valibot | Runtime validation that also gives static types | `z.infer<typeof Schema>` |
| Type erasure | Types do not exist at runtime | Use runtime validation at boundaries |


<a id="glossary-dsa-terms"></a>

## DSA terms

### Complexity and fundamentals

| Term | Definition | Example |
| --- | --- | --- |
| Time complexity | How running time grows with input size | Loop over n items is O(n) |
| Space complexity | How memory grows with input size | Extra array of n items is O(n) |
| Big O | Upper bound on growth rate (worst case) | Binary search is O(log n) |
| Common classes | O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), O(n!) | Merge sort is O(n log n) |
| Amortised cost | Average cost per operation over a sequence | Dynamic array push is O(1) amortised |
| In-place | Uses O(1) extra space | Reverse array with two pointers |
| Stable sort | Equal items keep their original order | Merge sort is stable |
| Recursion | Function calls itself | `fact(n) = n * fact(n-1)` |
| Base case | Stops the recursion | `if (n <= 1) return 1` |
| Call stack | Memory of active function calls | Deep recursion can overflow |
| Tail recursion | Recursive call is the last action | Can be turned into a loop |

### Data structures

| Structure | Definition | Typical cost |
| --- | --- | --- |
| Array | Contiguous items indexed by position | Access O(1), insert O(n) |
| Linked list | Nodes linked by pointers | Insert at head O(1), search O(n) |
| Doubly linked list | Nodes with next and previous pointers | Delete a known node O(1) |
| Stack (LIFO) | Last in, first out | Undo, call stack, balanced brackets |
| Queue (FIFO) | First in, first out | BFS, job queues |
| Deque | Insert and remove at both ends | Sliding window maximum |
| Hash table | Key to index via hash function | Average O(1) lookup |
| Collision / chaining | Two keys map to one slot / store a list per slot | Open addressing is the alternative |
| Set | Unique values | Dedupe in O(n) |
| Binary tree | Each node has up to two children | Traversals |
| Binary search tree (BST) | Left is smaller, right is larger | Search O(log n) if balanced |
| Balanced tree (AVL, red-black) | Keeps height O(log n) | Guaranteed O(log n) |
| Heap | Tree where parent is smaller (min) or larger (max) than children | Insert and extract O(log n) |
| Priority queue | Always serves the highest priority item | Dijkstra's algorithm |
| Trie | Tree of characters for prefix search | Autocomplete |
| Graph | Vertices and edges, directed or undirected | Maps, social networks |
| Adjacency list / matrix | Graph storage as lists / grid | List is better for sparse graphs |
| Union-Find (DSU) | Tracks connected groups | Detect cycles |
| Segment tree / Fenwick tree | Range queries with updates | Range sum |
| LRU cache | Evicts least recently used item | Hash map plus doubly linked list |
| Bloom filter | Probabilistic set; no false negatives | "Probably in the set" check |

### Algorithms and techniques

| Term | Definition | Example |
| --- | --- | --- |
| Linear search | Check each item | O(n) |
| Binary search | Halve a sorted range each step | O(log n) |
| Bubble / selection / insertion sort | Simple O(n²) sorts | Insertion sort for small or nearly sorted data |
| Merge sort | Divide, sort halves, merge | O(n log n), stable |
| Quick sort | Partition around a pivot | O(n log n) average, O(n²) worst |
| Heap sort | Build heap, extract repeatedly | O(n log n), in place |
| Counting / radix sort | Non-comparison sorts | O(n + k) |
| Two pointers | Two indexes moving through data | Pair sum in a sorted array |
| Sliding window | Moving range over an array | Longest substring without repeats |
| Fast and slow pointers | Pointers at different speeds | Detect a cycle in a linked list |
| Prefix sum | Running totals for fast range sums | Subarray sum queries |
| Divide and conquer | Split, solve, combine | Merge sort |
| Greedy | Take the best local choice each step | Activity selection, coin change (some systems) |
| Backtracking | Build choices, undo when invalid | N-Queens, permutations |
| Dynamic programming | Solve overlapping subproblems once and reuse | Fibonacci, knapsack |
| Memoisation / tabulation | Top-down cache / bottom-up table | `memo[n]` |
| BFS | Explore level by level using a queue | Shortest path in an unweighted graph |
| DFS | Explore deep first using stack or recursion | Detect cycles, islands |
| Tree traversals | Inorder, preorder, postorder, level order | Inorder of a BST is sorted |
| Topological sort | Order nodes so dependencies come first | Build order |
| Dijkstra | Shortest path with non-negative weights | Routing |
| Bellman-Ford | Shortest path allowing negative weights | Currency arbitrage |
| Minimum spanning tree | Cheapest tree connecting all nodes | Kruskal, Prim |
| Bit manipulation | Operate on bits | `n & (n-1)` clears lowest set bit |
| Monotonic stack | Stack kept in sorted order | Next greater element |
| Kadane's algorithm | Maximum subarray in O(n) | `max(cur + x, x)` |
| Reservoir sampling | Pick random items from a stream | Sample k from unknown n |
| Consistent hashing | Hash scheme that moves few keys on resize | Cache and shard routing |


<a id="glossary-design-principles"></a>

## Design principles

| Principle | Definition | Example |
| --- | --- | --- |
| Single Responsibility (S) | A class or module has one reason to change | Split validation, storage and email into separate units |
| Open/Closed (O) | Open for extension, closed for modification | Add a new `Discount` class, not another `if` branch |
| Liskov Substitution (L) | Subtypes work wherever the parent type is expected | `Square` that breaks `Rectangle` behaviour violates it |
| Interface Segregation (I) | Prefer small, focused interfaces | Separate `Workable` and `Eatable` |
| Dependency Inversion (D) | Depend on abstractions, not concrete classes | Inject a `Repository` interface |
| Dependency Injection | Pass dependencies in instead of creating them inside | Constructor takes the DB client |
| Inversion of Control | Framework calls your code | Express calls your handler |
| DRY | Don't repeat yourself; one source of truth for each piece of knowledge | Shared validation function |
| KISS | Keep it simple | Plain function over a class hierarchy |
| YAGNI | Don't build what you don't need yet | No plugin system for one use case |
| Separation of Concerns | Each part handles one concern | UI, logic and data access apart |
| High cohesion | Related things live together | One module per feature |
| Low coupling | Parts depend on each other as little as possible | Communicate through interfaces or events |
| Composition over inheritance | Build behaviour by combining objects | Hooks instead of class inheritance |
| Law of Demeter | Talk only to direct collaborators | Avoid `a.b.c.d()` chains |
| Encapsulation | Hide internal state behind an interface | Private fields with `#` |
| Abstraction | Expose what, hide how | `save()` hides SQL |
| Polymorphism | Same interface, different behaviour | `pay()` on card and UPI classes |
| Principle of Least Astonishment | Behave the way users expect | Function name matches what it does |
| Fail fast | Detect and report errors early | Validate input at the boundary |
| Idempotency | Repeating an operation has the same effect | Payment with an idempotency key |
| Immutability | Don't change data after creation | Return new objects |
| Twelve-factor app | Practices for cloud-native services | Config in environment variables |
| Defence in depth | Several layers of security | WAF, auth, validation, encryption |
| Least privilege | Grant minimum access | Read-only DB user for reports |
| Separation of duties | No one person controls a whole critical process | Different people write and approve a change |
| Design for failure | Assume dependencies will fail | Retries, timeouts, circuit breakers |
| Scalability | Handle growth by adding resources | Stateless services behind a load balancer |
| Stateless service | No per-client data kept between requests | Session in Redis, not in memory |
| Eventual consistency | Replicas converge over time | Read after write may lag |
| CAP theorem | Under partition, choose consistency or availability | CP vs AP |
| PACELC | Else (no partition), choose latency or consistency | Tunable consistency |
| Domain-Driven Design | Model software around the business domain | Bounded contexts, aggregates |
| Clean / hexagonal architecture | Business logic independent of frameworks and I/O | Ports and adapters |


<a id="glossary-solid-principles-in-depth"></a>

## SOLID principles in depth

### S: Single Responsibility

| Term | Definition | Example |
| --- | --- | --- |
| Single Responsibility Principle (SRP) | A class, module or function should have one reason to change, meaning it answers to one concern | `InvoiceService` builds invoices; `InvoicePrinter` formats them |
| Reason to change | A source of change such as a business rule, a storage format or a UI need | Tax rules change and PDF layout changes: two reasons, so two modules |
| Cohesion | How strongly the parts of a module belong together | Every method of `Cart` works on cart items |
| God class | One class that knows and does too much | `UserManager` that validates, saves, emails and logs |
| SRP violation signs | Many unrelated imports, names with "And" or "Manager", a change in one area breaking another | A test needs five mocks to start |
| SRP fix | Extract each concern into its own unit, then compose them | `UserValidator`, `UserRepository`, `EmailNotifier` |
| Separation of concerns | Keep different concerns in different parts of the system | UI, business logic and data access in separate layers |

### O: Open/Closed

| Term | Definition | Example |
| --- | --- | --- |
| Open/Closed Principle (OCP) | Software entities should be open for extension but closed for modification | Add a payment type by adding a class, not by editing a switch |
| Extension point | A place designed so behaviour can be added without editing existing code | Strategy interface, plugin hook, middleware chain |
| OCP violation signs | A growing `if/else` or `switch` on a type that you edit for every new case | `if (type === 'card') ... else if (type === 'upi') ...` |
| OCP fix | Replace the conditional with polymorphism or a lookup of strategies | `handlers[type](amount)` |
| Stable abstraction | An interface that rarely changes, so code depending on it stays untouched | `interface Discount { apply(total: number): number }` |

### L: Liskov Substitution

| Term | Definition | Example |
| --- | --- | --- |
| Liskov Substitution Principle (LSP) | A subtype must be usable wherever its base type is expected without breaking correctness | A `SavingsAccount` can replace `Account` in any caller |
| Behavioural subtyping | A subtype keeps the base type's promises: same or weaker preconditions, same or stronger postconditions | An override does not throw where the base did not |
| Precondition | What must be true before a call | `withdraw(amount)` requires `amount > 0` |
| Postcondition | What must be true after a call | Balance is reduced by `amount` |
| Invariant | What is always true for an object | Balance is never negative |
| LSP violation signs | A subclass throws "not supported", ignores a method, or callers check the concrete type | `Penguin extends Bird` with a `fly()` that throws |
| Square and rectangle problem | `Square extends Rectangle` breaks code that sets width and height separately | Setting width also changes height |
| LSP fix | Prefer composition or a smaller shared interface; do not inherit only to reuse code | A `Shape` interface with `area()` |

### I: Interface Segregation

| Term | Definition | Example |
| --- | --- | --- |
| Interface Segregation Principle (ISP) | Clients should not depend on methods they do not use; prefer small, role-specific interfaces | `Readable` and `Writable` instead of one large `Storage` |
| Fat interface | An interface with many unrelated methods | `Worker { work(); eat(); sleep(); }` |
| Empty or throwing implementations | Implementers leave methods empty or throw because they do not apply | `Robot.eat()` throws |
| Role interface | An interface shaped by what one client needs | `PaymentCapturer` used only by checkout |
| ISP in TypeScript | Compose small types, or use `Pick` to expose only the needed members | `type ReadOnlyRepo = Pick<Repo, 'get'>` |
| Interface pollution | Adding methods to a shared interface for one client's need | Every implementer must now support it |

### D: Dependency Inversion

| Term | Definition | Example |
| --- | --- | --- |
| Dependency Inversion Principle (DIP) | High-level modules should depend on abstractions, not on low-level details; details depend on abstractions | `OrderService` depends on `OrderRepository`, not on MySQL |
| High-level vs low-level module | Business rules and policy vs details such as databases, HTTP clients and file systems | `OrderService` vs `MySqlOrderRepository` |
| Port | An abstraction owned by the high-level module that low-level code implements | `interface Clock { now(): Date }` |
| Dependency Injection (DI) | Supplying a module's dependencies from outside, usually through the constructor | `new OrderService(new InMemoryRepo())` |
| Inversion of Control (IoC) | A framework or container controls creation and calling instead of your code | Express calls your route handler |
| IoC container | Tool that builds objects and wires their dependencies | NestJS, InversifyJS, Spring |
| Constructor, setter and method injection | Three ways to pass dependencies in | Constructor injection is the usual choice |
| Composition root | The one place where the object graph is assembled | `main.ts` or `app.ts` |
| Test double | A stand-in used in tests | Mock, stub, fake, spy |
| DIP vs DI | DIP is the principle; DI is a technique that helps apply it | Inject an interface type |

### Related ideas and how to use SOLID

| Term | Definition | Example |
| --- | --- | --- |
| GRASP | General Responsibility Assignment Software Patterns: guidelines such as Information Expert and Low Coupling | Give behaviour to the class that holds the data |
| Tell, don't ask | Tell an object what to do instead of reading its data and deciding | `account.withdraw(100)` rather than checking `account.balance` |
| Law of Demeter | Talk only to your direct collaborators | Avoid `a.b.c.d()` |
| Composition over inheritance | Build behaviour by combining objects rather than extending classes | Hooks and mixins instead of deep class trees |
| Over-abstraction | Adding interfaces and layers with no real need | One interface with one implementation "just in case" |
| SOLID in React | SRP: small components and hooks; OCP: props and composition; DIP: pass services through props or context | `<Page api={api} />` |
| SOLID in Node.js | SRP: controller, service and repository layers; DIP: inject repositories; OCP: middleware | Express layers with injected repositories |
| SOLID in migration work | Wrap legacy code behind an interface, then replace the implementation without touching callers | Adapter over a legacy API |
| How to answer in an interview | Name the violation first, then the fix, then the benefit | "This switch breaks OCP, so I used a strategy map; new cases need no edits" |


<a id="glossary-design-patterns"></a>

## Design patterns

### Creational, structural and behavioural

| Pattern | Definition | Example |
| --- | --- | --- |
| Singleton | One shared instance | Config, logger, DB pool |
| Factory | Creates objects without exposing the class | `createNotifier('sms')` |
| Abstract factory | Creates families of related objects | UI kit for web and mobile |
| Builder | Builds complex objects step by step | `new QueryBuilder().from('users').where(...)` |
| Prototype | Create new objects by cloning | `structuredClone(template)` |
| Module | Encapsulate private state | ES module or IIFE |
| Adapter | Wrap an incompatible interface | Wrap a legacy API for new code |
| Decorator | Add behaviour without changing the original | `withLogging(fn)`, middleware |
| Proxy | Control access to an object | JS `Proxy` for validation |
| Facade | One simple interface over a complex subsystem | `PaymentService.pay()` |
| Composite | Treat single items and groups alike | File and folder tree |
| Bridge | Separate abstraction from implementation | Notifier with email or SMS sender |
| Flyweight | Share common data to save memory | Cached icon objects |
| Observer / pub-sub | Subscribers notified on change | `EventEmitter`, Redux subscribe |
| Strategy | Swappable algorithms behind one interface | Payment method, discount rule |
| Command | Wrap an action as an object | Undo stack, job queue |
| State | Behaviour changes with internal state | Order: pending, paid, shipped |
| Template method | Skeleton in base, steps in subclasses | Report generator |
| Iterator | Sequential access without exposing structure | `Symbol.iterator`, generators |
| Chain of Responsibility | Pass a request along handlers | Express middleware |
| Mediator | Central object coordinates others | Chat room |
| Memento | Save and restore state | Undo in an editor |
| Visitor | Add operations without changing classes | AST processing |
| Repository | Hide data access behind a collection-like interface | `userRepo.findById(id)` |
| Dependency injection | Supply dependencies from outside | Pass a mock in tests |
| Service layer | Business logic between controller and data | `OrderService` |
| DTO | Object that carries data between layers | API response shape |
| MVC / MVVM / MVP | Separate model, view and controller logic | React with a store follows a similar idea |
| Flux / Redux pattern | One-way data flow with actions and reducers | `dispatch(action)` |
| HOC / render props / hooks | React reuse patterns | `withAuth`, `useAuth` |
| Container / presentational | Smart component fetches, dumb component renders | `UserListContainer` and `UserList` |
| Compound component | Components share implicit state | `<Tabs><Tab/></Tabs>` |

### Distributed and architectural patterns

| Pattern | Definition | Example |
| --- | --- | --- |
| Saga | Distributed transaction as local steps with compensations | Order, stock, payment with rollback steps |
| Orchestration vs choreography | Central coordinator vs services reacting to events | Step Functions vs EventBridge |
| Circuit breaker | Fail fast when a dependency keeps failing | Closed, open, half-open |
| Retry with backoff and jitter | Retry with growing, randomised delay | 1s, 2s, 4s plus random |
| Timeout | Limit how long to wait | 3-second call limit |
| Bulkhead | Isolate resources so one failure does not spread | Separate thread pool per dependency |
| Rate limiting / throttling | Cap request rate | Token bucket |
| Idempotency key | Make repeated requests safe | Payment retries |
| Outbox | Write event and data in one transaction, publish later | Avoid dual-write bugs |
| CQRS | Separate read and write models | Read model in a search index |
| Event sourcing | Store state as a log of events | Account ledger |
| Event-driven architecture | Services communicate through events | SNS, SQS, Kafka |
| API Gateway pattern | Single entry point for clients | Auth, routing, throttling |
| Backend for Frontend (BFF) | One backend per client type | Mobile BFF and web BFF |
| Strangler fig | Gradually replace a legacy system | Route one feature at a time |
| Anti-corruption layer | Translate between old and new models | Legacy adapter |
| Sidecar | Helper process beside a service | Envoy proxy |
| Service mesh | Network layer for service-to-service traffic | mTLS and retries via Istio |
| Service discovery | Find service addresses dynamically | Kubernetes DNS |
| Cache-aside | App checks cache, then DB, then fills cache | Redis lookups |
| Write-through / write-behind | Write to cache and DB together / cache first, DB later | Trade-off: consistency vs speed |
| Sharding / partitioning | Split data across nodes | Shard by `tenantId` |
| Leader election | One node acts as coordinator | etcd, ZooKeeper |
| Competing consumers | Many consumers read one queue | Parallel workers on SQS |
| Queue-based load leveling | Queue absorbs traffic spikes | Buffer LLM requests |
| Dead-letter queue | Hold messages that keep failing | After 3 attempts |
| Claim check | Send a reference, not the large payload | S3 key in the message |
| Scatter-gather | Fan out requests and combine replies | Search across shards |
| Blue-green / canary | Safe release strategies | 5% traffic to new version |
| Feature toggle | Switch features without deploying | Gradual rollout |
| Guardrail pattern (AI) | Validate inputs and outputs around a model | Guardrail LLM before the generator |
| RAG pattern | Retrieve context, then generate | Retrieve policy text, then answer |


<a id="glossary-javascript-design-patterns"></a>

## JavaScript design patterns

### Creational patterns

| Pattern | Definition | Example |
| --- | --- | --- |
| Design pattern | A reusable solution to a common design problem; a shared vocabulary, not copy-paste code | "I used a strategy map here" |
| Module pattern | Hide private state in a closure or ES module and expose a public API | `const counter = (() => { let c = 0; return { inc: () => ++c }; })();` |
| Revealing module | Define everything privately, then return only the members to expose | `return { inc, reset };` |
| ES module as singleton | Modules are cached, so an exported object is created once | `export const config = loadConfig();` |
| Singleton | Ensure one shared instance | `Config.getInstance()` |
| Factory function | A function that creates and returns objects without `new` | `const createUser = name => ({ name })` |
| Factory method | A method that decides which class to instantiate | `Notifier.create('sms')` |
| Abstract factory | Creates families of related objects | UI kit for web and for mobile |
| Constructor pattern | Create objects with a constructor function or class | `new User('Asha')` |
| Prototype pattern | Share behaviour through the prototype chain, or create objects by cloning | `Object.create(proto)` |
| Builder | Build a complex object step by step | `new QueryBuilder().from('users').limit(10).build()` |
| Fluent interface | Methods return `this` so calls chain | `$('#a').addClass('b').show()` |
| Object pool | Reuse costly objects instead of creating new ones | Database connection pool |
| Lazy initialisation | Create an expensive object on first use | `get db() { return this._db ??= connect(); }` |

### Structural patterns

| Pattern | Definition | Example |
| --- | --- | --- |
| Decorator | Add behaviour around a function or object without changing it | `const withLog = fn => (...a) => { log(a); return fn(...a); }` |
| Proxy | Control access to an object for validation, caching or reactivity | `new Proxy(target, { set(t, k, v) { ... } })` |
| Reflect | Built-in API that pairs with Proxy for default operations | `Reflect.get(target, key)` |
| Facade | One simple interface over a complex subsystem | `api.getProfile()` hides three calls |
| Adapter | Convert one interface into another | `util.promisify(fs.readFile)` |
| Bridge | Separate an abstraction from its implementation so both can vary | A notifier that takes an email or SMS sender |
| Composite | Treat single items and groups the same way | A menu containing menu items and submenus |
| Flyweight | Share common data to save memory | Cached icon objects reused everywhere |
| Mixin | Copy methods from several sources onto one object or class | `Object.assign(Duck.prototype, canSwim, canFly)` |
| Repository | Hide data access behind a collection-like API | `userRepo.findById(id)` |
| Dependency injection | Pass dependencies in as arguments | `createService({ repo, logger })` |

### Behavioural patterns

| Pattern | Definition | Example |
| --- | --- | --- |
| Observer | Subjects notify subscribers when state changes | `emitter.on('save', handler)` |
| EventEmitter | Node's built-in observer implementation | `new EventEmitter()` |
| Publish and subscribe | Publishers and subscribers communicate through a broker and do not know each other | `bus.publish('order.created', data)` |
| Mediator | A central object coordinates communication between components | A chat room object |
| Command | Wrap a request as an object so it can be queued, logged or undone | `{ execute() {}, undo() {} }` |
| Strategy | Interchangeable algorithms behind one interface; replaces `if/else` chains | `const fee = { card: a => a * 1.02, upi: a => a }[type](amt)` |
| State pattern | Behaviour changes with an internal state object | Order: pending, paid, shipped |
| Finite state machine | Explicit states and the allowed transitions between them | A transitions map or XState |
| Iterator | Sequential access without exposing the structure | `[Symbol.iterator]()` |
| Generator | A function that pauses with `yield`; builds lazy iterators | `function* ids() { let i = 0; while (true) yield i++; }` |
| Middleware (chain of responsibility) | A chain of handlers; each can act or pass the request on | `app.use((req, res, next) => next())` |
| Template method | A base class fixes the steps; subclasses fill in some of them | `run() { this.setup(); this.execute(); }` |
| Memento | Save and restore an object's state | Undo history in an editor |
| Visitor | Add operations to a structure without changing its classes | Walk an AST and handle each node type |

### Functional and async patterns

| Pattern | Definition | Example |
| --- | --- | --- |
| Higher-order function | Takes or returns a function; the basis of many JS patterns | `arr.map(fn)` |
| Currying | Turn `f(a, b)` into `f(a)(b)` | `const add = a => b => a + b` |
| Partial application | Fix some arguments now, supply the rest later | `const add5 = add.bind(null, 5)` |
| Function composition | Combine small functions into one | `const pipe = (...f) => x => f.reduce((v, g) => g(v), x)` |
| Memoization | Cache results of pure calls by their arguments | `cache[key] ??= compute(x)` |
| Debounce | Run only after calls stop for a delay | Search box waits 300 ms |
| Throttle | Run at most once per interval | Scroll handler |
| Immutable update | Create a new object instead of changing the old one | `{ ...state, count: state.count + 1 }` |
| Promise chaining | Sequence async steps with `then` | `fetch(u).then(r => r.json())` |
| Concurrent promises | Run async work in parallel and combine results | `await Promise.all([a(), b()])` |
| `allSettled` / `race` / `any` | Wait for all outcomes / first to settle / first to succeed | `await Promise.allSettled(tasks)` |
| Async queue or worker pool | Limit how many async tasks run at once | `p-limit` |
| Retry with backoff | Repeat a failed async call with growing delays | Retry 3 times: 1 s, 2 s, 4 s |
| Optimistic update | Update the UI first and roll back on failure | Show the new item, remove it if the save fails |
| Callback and promisification | Wrap callback APIs to return promises | `promisify(fn)` |

### React and front-end patterns

| Pattern | Definition | Example |
| --- | --- | --- |
| Flux and Redux | One-way data flow: action, reducer, store, view | `dispatch(addItem(x))` |
| Container and presentational components | A smart component fetches data; a dumb one renders it | `UserListContainer` and `UserList` |
| Higher-order component | A function that takes a component and returns an enhanced one | `withAuth(Dashboard)` |
| Render props | A prop whose value is a function that returns UI | `<Mouse render={pos => <Dot at={pos} />} />` |
| Custom hook | Reusable stateful logic in a `useXxx` function | `useDebounce(value, 300)` |
| Compound components | Components share implicit state to work as one | `<Tabs><Tab /></Tabs>` |
| Provider pattern | Share data through Context | `<ThemeProvider>` |
| Controlled component | Form value driven by React state | `<input value={v} onChange={...} />` |
| Lifting state up | Move shared state to the nearest common parent | Parent holds `selectedId` |
| Observer in the UI | Subscribe to a store and re-render on change | `useSyncExternalStore` |

### Anti-patterns

| Anti-pattern | Definition | Example |
| --- | --- | --- |
| Callback hell | Deeply nested callbacks that are hard to read | Five levels of nested functions |
| God object | One object that holds too much state and behaviour | A global `App` with everything on it |
| Global state pollution | Shared mutable globals that anything can change | `window.currentUser` |
| Monkey patching | Changing built-in or library prototypes at runtime | `Array.prototype.last = ...` |
| Premature optimisation | Optimising before measuring | Memoizing every function |
| Prop drilling | Passing props through layers that do not use them | `A -> B -> C -> D` |
| Singleton overuse | Hidden global state that is hard to test | A static instance used everywhere |


<a id="glossary-distributed-and-resilience-patterns"></a>

## Distributed and resilience patterns

### Saga and distributed transactions

| Term | Definition | Example |
| --- | --- | --- |
| Distributed transaction | One business operation that updates data in more than one service or database | A money transfer across two services |
| Two-phase commit (2PC) | A coordinator asks all participants to prepare, then to commit; it blocks and scales poorly | XA transactions |
| Saga | A sequence of local transactions; if one fails, compensating transactions undo the earlier ones | Create order, reserve stock, charge payment |
| Local transaction | An ACID transaction inside one service | Insert the order in the order database |
| Compensating transaction | An action that semantically undoes a completed step; it is not a database rollback | Refund the payment; release the stock |
| Orchestration saga | A central orchestrator tells each service what to do next | A Step Functions state machine |
| Choreography saga | Services react to each other's events with no central coordinator | `OrderPlaced` leads to `StockReserved` |
| Pivot transaction | The step after which the saga must go forward; the point of no return | Payment captured |
| Retriable transaction | A step after the pivot that must eventually succeed, so it is retried | Send the confirmation email |
| Saga log | Persisted progress of each saga instance | `sagaId`, current step, status |
| Semantic lock | A flag showing a record is in the middle of a saga | `status = PENDING` |
| Lack of isolation | Other requests can see a saga's intermediate states | A pending order visible to readers |
| TCC (Try-Confirm-Cancel) | Reserve resources first, then confirm or cancel | Hold funds, then capture or release |
| Idempotent compensation | A compensation that is safe to run more than once | Refund keyed by payment ID |
| Eventual consistency | Services or replicas become consistent over time | Balance updates after the event is processed |
| Dual-write problem | Writing to a database and a broker separately can leave them out of step | The commit succeeds but the publish fails |
| Transactional outbox | Write the event to an outbox table in the same transaction; a relay publishes it | `orders` and `outbox` rows inserted together |
| Inbox pattern | Record processed message IDs so duplicates are ignored | A `processed_messages` table |
| Change data capture (CDC) | Stream database changes as events | Debezium |
| Event sourcing | Store state as an append-only log of events | An account ledger |
| CQRS | Separate models for reads and writes | A search index for reads |
| Idempotency key | A client-supplied key that makes retries safe | `Idempotency-Key` header on a payment |
| Exactly-once effect | At-least-once delivery combined with idempotent processing | Deduplicate by event ID |

### Resilience patterns

| Term | Definition | Example |
| --- | --- | --- |
| Circuit breaker | A wrapper that stops calling a failing dependency and fails fast so it can recover | Open after 5 failures |
| Closed, open, half-open | States: calls pass; calls are blocked; a few trial calls are allowed | Half-open sends 3 test calls |
| Failure threshold | The count or rate of failures that opens the circuit | 50% failures over the last 20 calls |
| Sliding window | The window used to measure failures, by count or by time | Last 20 calls or last 60 seconds |
| Wait duration | Time spent open before moving to half-open | 30 seconds |
| Fallback | An alternative response when a call fails or the circuit is open | Cached data or a default message |
| Graceful degradation | Reduced but working service during a failure | Show a cached balance |
| Retry | Repeat a failed call to handle transient errors | 3 attempts |
| Exponential backoff | Wait longer between each retry | 1 s, 2 s, 4 s |
| Jitter | Random delay added to backoff so clients do not retry together | `delay * (0.5 + Math.random())` |
| Retry storm | Many clients retrying at once overload a recovering service | Fix with jitter and a circuit breaker |
| Timeout | Maximum wait for a response | 3 seconds per call |
| Deadline propagation | Pass the remaining time budget to downstream calls | `grpc-timeout` header |
| Bulkhead | Isolate resources per dependency so one failure cannot exhaust all | A separate connection pool per service |
| Rate limiting | Cap requests per client or service | 100 requests per minute |
| Token bucket | Tokens refill at a steady rate and each request spends one; allows bursts | 10 tokens per second, burst of 50 |
| Leaky bucket | Requests leave at a fixed rate, which smooths traffic | A queue drained at a constant rate |
| Fixed and sliding window counters | Count requests per time window; sliding avoids bursts at window edges | Requests in the last 60 seconds |
| Throttling | Slow down or reject excess requests | HTTP 429 |
| Load shedding | Drop low-priority work when overloaded | Reject non-critical requests first |
| Backpressure | Consumers signal producers to slow down | Bounded queues, streams |
| Queue-based load leveling | A queue buffers spikes between producer and consumer | SQS between the API and the worker |
| Competing consumers | Many workers read from one queue | Parallel Lambda consumers |
| Dead-letter queue | Holds messages that keep failing | After 3 attempts |
| Poison message | A message that always fails | Moved to the dead-letter queue |
| Health check and heartbeat | An endpoint or signal showing a service is alive | `GET /health` |
| Hedged request | Send a second request if the first is slow and use the first reply | Reduces tail latency |
| Cache-aside | The app checks the cache, then the database, then fills the cache | Redis lookups |
| Stale-while-revalidate | Serve stale data while refreshing it in the background | Cached profile shown instantly |
| Failover | Switch to a standby when the primary fails | Replica promoted to primary |
| Redundancy | Duplicate components to remove single points of failure | Two instances in two zones |
| Single point of failure (SPOF) | A component whose failure stops the whole system | One database server |
| Chaos engineering | Inject failures on purpose to test resilience | Kill a pod in staging |

### Structural and integration patterns

| Term | Definition | Example |
| --- | --- | --- |
| API Gateway | A single entry point for clients: routing, authentication, throttling | Amazon API Gateway |
| Backend for Frontend (BFF) | A separate backend per client type | A mobile BFF and a web BFF |
| Gateway aggregation | The gateway combines several service calls into one response | One call returns profile and orders |
| Gateway offloading | Move shared concerns such as TLS and auth to the gateway | Validate JWT at the edge |
| Service discovery | Find service addresses dynamically | Kubernetes DNS |
| Sidecar | A helper process deployed beside a service | Envoy proxy |
| Ambassador | A sidecar that handles outbound calls for a service | Retries and logging proxy |
| Anti-corruption layer | Translate between an old model and a new one | Adapter over a legacy system |
| Strangler fig | Replace a legacy system piece by piece behind a facade | Route one endpoint at a time |
| Service mesh | A network layer for service-to-service traffic | Mutual TLS and retries via Istio |
| Leader election | One node acts as coordinator | etcd or ZooKeeper |
| Distributed lock | A lock shared across processes or machines | Redis lock with expiry |
| Sharding | Split data across nodes | Shard by `tenantId` |
| Scatter-gather | Fan out a request and combine the replies | Search across shards |
| Claim check | Send a reference instead of a large payload | S3 key in the message |
| Publisher and subscriber | Producers publish events; any number of consumers receive them | SNS topic |
| Event-carried state transfer | Events carry the data consumers need, so they do not call back | `CustomerUpdated` includes the new address |
| Valet key | Give a client a limited, temporary access token to a resource | S3 presigned URL |
| Gatekeeper | A host that validates and sanitises requests before they reach the service | Gateway with WAF rules |
| Federated identity | Delegate authentication to an external provider | Sign in with corporate SSO |
| Blue-green and canary release | Safe release strategies that limit the impact of a bad version | 5% of traffic to the new version |
| Feature toggle | Switch a feature on or off without deploying | Gradual rollout flag |


<a id="glossary-architecture-styles-and-quality-attributes"></a>

## Architecture styles and quality attributes

### Architecture styles

| Term | Definition | Example |
| --- | --- | --- |
| Software architecture | The high-level structure of a system: its components, how they interact, and the decisions that are costly to change | Choosing microservices over a monolith |
| Style vs pattern | A style is the overall structure; a pattern solves one recurring problem | Microservices (style); circuit breaker (pattern) |
| Monolith | One deployable unit holding all features | A single Node.js app and one database |
| Modular monolith | One deployable with strict boundaries between internal modules | `orders`, `billing` modules with public interfaces only |
| Layered (n-tier) architecture | Presentation, business and data layers; each calls the one below | Controller, service, repository |
| Client-server | Clients request; servers respond | Browser and API |
| Hexagonal (ports and adapters) | The core domain talks to the outside through ports; adapters connect technologies | HTTP and database adapters around a domain core |
| Clean architecture | Dependencies point inward toward the domain; frameworks sit at the edge | Use cases do not import Express |
| Onion architecture | Concentric layers with the domain model at the centre | Domain, services, infrastructure |
| Microservices | Small, independently deployable services built around business capabilities; each owns its data | Orders, payments and users as separate services |
| Service-oriented architecture (SOA) | Services shared across the enterprise, often through an enterprise service bus | SOAP services behind an ESB |
| Event-driven architecture | Components communicate by producing and reacting to events | Order placed triggers stock and billing |
| Event streaming | A durable, replayable log of events | Kafka |
| Pipes and filters | Data passes through a series of processing stages | ETL pipeline |
| Serverless | Run code on demand with no server management; pay per use | Lambda and API Gateway |
| Microkernel (plug-in) architecture | A small core plus plug-ins that add features | Browser extensions |
| Micro-frontends | Independently built and deployed parts of a web UI | Separate teams own header and checkout |
| Backend for Frontend | A backend shaped for one client type | Mobile BFF |
| Master-slave and leader-follower | One node accepts writes; others copy and serve reads | Primary and read replicas |
| Peer-to-peer | Nodes act as both client and server | BitTorrent |
| Multi-tenant architecture | One system serves many customers while keeping their data separate | `tenantId` on every record |
| Cloud-native | Designed for containers, automation, scaling and failure | Kubernetes, managed services |

### Domain-Driven Design

| Term | Definition | Example |
| --- | --- | --- |
| Domain-Driven Design (DDD) | Model software around the business domain with the people who know it | Banking, insurance, logistics |
| Domain and subdomain | The business area / a part of it: core, supporting or generic | Core: lending; generic: email |
| Bounded context | A boundary within which a model and its terms have one meaning | "Account" in billing vs in identity |
| Ubiquitous language | One shared vocabulary for developers and business inside a context | "Settlement", "Chargeback" |
| Entity | An object with an identity that persists over time | `Customer` with an ID |
| Value object | An immutable object defined by its values | `Money(100, 'AED')` |
| Aggregate and aggregate root | A cluster of objects changed together; the root is the only entry point | `Order` owns its `OrderLine` items |
| Domain event | A fact that happened in the domain | `PaymentReceived` |
| Domain service vs application service | Domain rules that fit no entity / orchestration of use cases | `TransferFunds` rule / `TransferController` flow |
| Context map | A diagram of bounded contexts and how they relate | Shared kernel, customer-supplier |
| Anti-corruption layer | A translator that protects a new model from a legacy one | Adapter over a legacy core banking system |

### Quality attributes (non-functional requirements)

| Term | Definition | Example |
| --- | --- | --- |
| Quality attribute | A measurable property of how well the system works, as opposed to what it does | Latency under 300 ms |
| Non-functional requirement (NFR) | A requirement on quality rather than behaviour | 99.95% availability |
| Scalability | Ability to handle growth; vertical means a bigger machine, horizontal means more machines | Add instances behind a load balancer |
| Elasticity | Scaling up and down automatically with demand | Auto Scaling group |
| Availability | The share of time the system is usable | 99.9% is about 8.8 hours of downtime a year |
| Nines | Availability levels: 99.99% is about 52 minutes a year; 99.999% is about 5 minutes | Four nines |
| Reliability | Behaving correctly over time | Few failed transfers |
| Resilience | Recovering from failures and continuing to serve | Circuit breakers, retries |
| Fault tolerance | Continuing to operate during component failure | Multi-AZ database |
| Performance | Speed and efficiency: latency, throughput, resource use | p95 under 200 ms |
| Latency vs throughput | Time per request / requests handled per second | 50 ms per call; 2,000 requests per second |
| Percentiles (p50, p95, p99) | The value below which that share of requests fall; shows tail latency | p99 of 800 ms |
| Maintainability | How easily the system can be changed and fixed | Small modules, clear tests |
| Modifiability and extensibility | How easily features can be added | Plug-in points |
| Testability | How easily behaviour can be verified | Injected dependencies |
| Deployability | How easily and safely changes reach production | One-click rollback |
| Observability | Understanding internal state from outputs: logs, metrics, traces | Dashboards and alerts |
| Security and the CIA triad | Confidentiality, integrity, availability | Encrypt data, restrict access, keep it up |
| Interoperability and portability | Working with other systems / moving between platforms | Open APIs; containers |
| Usability and accessibility | Ease of use / usable by everyone | Screen-reader support |
| Compliance and auditability | Meeting regulations and proving it | PCI-DSS audit trail |
| Cost efficiency (FinOps) | Delivering value at a sensible cost | Right-sized instances, Spot for batch |
| Trade-off | Improving one attribute costs another | Consistency vs availability |
| Architecturally significant requirement | A requirement that strongly shapes the design | Zero data loss on payments |

### Deciding and documenting architecture

| Term | Definition | Example |
| --- | --- | --- |
| Architecture Decision Record (ADR) | A short note with the context, the decision and its consequences | "Use Kafka for events: replay needed" |
| C4 model | Four diagram levels: Context, Containers, Components, Code | A container diagram of services and databases |
| 4+1 view model | Logical, process, development and physical views, plus scenarios | Deployment view of regions |
| UML | Unified Modeling Language: standard diagrams for design | Class and sequence diagrams |
| Reference architecture | A proven template for a type of system | Standard serverless web app |
| Technology radar | A list of technologies to adopt, trial, assess or hold | Team standards |
| Fitness function | An automated check that an architecture quality still holds | A test that fails if a layer imports another |
| ATAM | Architecture Tradeoff Analysis Method: a structured review of risks and trade-offs | Review against latency and security goals |
| Technical debt | Shortcuts that make future change more costly | A temporary workaround that stayed |
| Build vs buy | Decide whether to develop a capability or purchase it | Own auth service vs a managed identity service |
| Vendor lock-in | Difficulty moving away from a supplier | Heavy use of proprietary services |
| Proof of concept vs prototype vs MVP | Test feasibility / show a design / smallest releasable product | A spike to test a library |
| Solution, enterprise and technical architect | Designs one solution / aligns the whole organisation's systems / guides the code-level design | Solution architect on a client project |
| TOGAF | An enterprise architecture framework with a step-by-step method | Architecture Development Method |
| Well-Architected Framework | Cloud design pillars: operations, security, reliability, performance, cost, sustainability | AWS design review |


<a id="glossary-hld-high-level-design"></a>

## HLD: high-level design

### Process and estimation

| Term | Definition | Example |
| --- | --- | --- |
| HLD | High-Level Design: the overall architecture, main components, data flow and technology choices, without class-level detail | Chat service with gateway, queue and database |
| HLD vs LLD | HLD shows the system's parts and how they connect; LLD shows the classes and methods inside one part | Message service vs the `Message` class |
| Functional requirements | What the system must do | Send and receive messages |
| Non-functional requirements | How well it must do it: latency, availability, scale, security | Delivery under 200 ms |
| Assumptions and out of scope | What you take as given and what you will not design | Skip payments in this design |
| Capacity estimation | A rough calculation of users, requests, storage and bandwidth | 10 million users, 5 messages each per day |
| Back-of-the-envelope calculation | A quick approximate estimate to size the system | Seconds per day is about 100,000 |
| QPS (RPS) | Queries or requests per second | 1 billion per day is about 11,600 per second |
| Peak load | The highest load, often a multiple of the average | Design for 2 to 3 times average |
| Read-write ratio | How many reads there are per write | URL shortener: 100 reads per write |
| Storage and bandwidth estimate | Data per record times records, and bytes per second | 1 KB times 100 million records is 100 GB |
| Throughput and latency | Work done per second / time per request | 5,000 requests per second at 80 ms |
| Tail latency | The slowest requests, shown by p95 and p99 | p99 of 900 ms |
| Bottleneck | The part that limits system performance | Single database writer |
| Trade-off | A choice that improves one quality at the cost of another | Cache speed vs freshness |
| Data flow | How data moves through the components | Client, gateway, service, queue, database |
| Standard answer method | Requirements, load estimate, architecture, APIs and data model, data flow, bottlenecks, trade-offs | Eight steps from the Blueprints guide |

### Scaling and traffic

| Term | Definition | Example |
| --- | --- | --- |
| Vertical scaling | Add power to one machine | Larger instance type |
| Horizontal scaling | Add more machines | More pods behind a load balancer |
| Stateless service | Keeps no client data between requests, so any instance can serve any request | Session stored in Redis |
| Load balancer | Spreads traffic across servers | AWS ALB |
| Layer 4 vs layer 7 | Balance by network connection / by HTTP content | NLB vs ALB |
| Round robin | Send requests to servers in turn | Servers A, B, C, A, B, C |
| Weighted round robin | Round robin with more turns for stronger servers | Server A gets double |
| Least connections | Send to the server with the fewest active connections | Long-lived connections |
| IP hash | Choose the server from a hash of the client IP | Same client reaches the same server |
| Sticky session | Keep a client on the same server | Cookie-based affinity |
| Reverse proxy | A server in front of backends that forwards requests | Nginx |
| API gateway | Single entry point with routing, authentication and throttling | Amazon API Gateway |
| CDN | Edge servers that cache content near users | CloudFront |
| DNS routing | Resolve names with policies such as geo, latency or weighted | Route 53 |
| Auto-scaling | Add or remove capacity by metrics | Scale at 70% CPU |
| Service discovery | Find service instances dynamically | Kubernetes DNS |
| Connection pooling | Reuse connections to cut set-up cost | PgBouncer |
| Active-active vs active-passive | All regions serve traffic / a standby waits | Two live regions |
| Multi-region and geo-replication | Run in several regions and copy data between them | Lower latency, disaster recovery |

### Data and storage

| Term | Definition | Example |
| --- | --- | --- |
| SQL vs NoSQL | Relational tables with joins and ACID / flexible models that scale out | PostgreSQL vs DynamoDB |
| NoSQL families | Key-value, document, wide-column and graph stores | Redis, MongoDB, Cassandra, Neo4j |
| Indexing | A structure that speeds up reads and costs extra on writes | B-tree on `user_id` |
| Leader-follower replication | One node takes writes and followers copy them | Primary and read replicas |
| Multi-leader replication | Several nodes take writes and sync with each other | Multi-region writes |
| Leaderless replication | Any node takes writes; quorums decide success | Cassandra, Dynamo |
| Replication lag | The delay before replicas see a write | A read right after a write returns old data |
| Sharding (partitioning) | Split data across servers | Shard by `tenantId` |
| Range, hash and directory sharding | Split by key range / by hash / by a lookup table | Hash of `userId` |
| Consistent hashing | A hash ring that moves few keys when nodes join or leave | Cache cluster resizing |
| Virtual nodes | Many ring positions per server for even load | 100 per node |
| Hot shard (hotspot) | One shard gets far more traffic than others | A celebrity account |
| Resharding | Moving data when shard count changes | Add a shard and rebalance |
| Denormalisation | Duplicate data to avoid joins | Store `userName` on `orders` |
| Cache-aside, read-through, write-through, write-behind | Common caching strategies | App fills cache on a miss |
| Eviction policy | How a full cache removes entries: LRU, LFU, FIFO, TTL | Least recently used goes first |
| Cache invalidation | Remove or update stale cache entries | Delete the key on update |
| Cache stampede (thundering herd) | Many requests rebuild an expired entry at once | Fix with locks or staggered TTLs |
| Object (blob) storage | Cheap storage for files | Amazon S3 |
| Search index | An inverted index mapping words to documents | Elasticsearch, OpenSearch |
| Bloom filter | A compact set that can give false positives but no false negatives | Skip lookups for missing keys |
| Geohash and quadtree | Ways to index locations | Find nearby drivers |
| Time-series database | Optimised for timestamped data | Prometheus, InfluxDB |
| Data warehouse and data lake | Structured analytics store / raw data store | Redshift / S3 |
| Unique ID generation | Create IDs without a single bottleneck: Snowflake, UUID, ULID | Timestamp, machine and sequence bits |
| Hot, warm and cold data | Tiers by access frequency | Archive old logs to Glacier |

### Consistency and distributed systems

| Term | Definition | Example |
| --- | --- | --- |
| CAP theorem | During a network partition choose consistency or availability | CP or AP |
| PACELC | Else, when there is no partition, choose latency or consistency | Tunable consistency |
| Strong vs eventual consistency | Reads see the latest write / replicas converge over time | Bank balance vs like count |
| Quorum | Read and write counts that overlap: R plus W greater than N | N=3, R=2, W=2 |
| Consensus | Nodes agree on one value despite failures: Paxos, Raft | etcd uses Raft |
| Leader election | Choose one coordinator node | ZooKeeper |
| Gossip protocol | Nodes share state with random peers | Cassandra membership |
| Heartbeat | A periodic signal showing a node is alive | Every 5 seconds |
| Split brain | Two parts of a cluster both act as leader | Needs fencing or quorum |
| Logical and vector clocks | Order events without trusting wall clocks | Version vectors |
| Clock skew | Different machines disagree on time | Do not order events by local time |
| Idempotency | Repeating an operation has the same effect | Payment with an idempotency key |
| Delivery guarantees | At-most-once, at-least-once, exactly-once effect | At-least-once plus dedupe |
| Two-phase commit and saga | Atomic commit across nodes / compensating steps across services | Order, stock, payment |
| Distributed lock | A lock shared across machines | Redis, ZooKeeper, etcd |

### Communication and APIs

| Term | Definition | Example |
| --- | --- | --- |
| REST | Resource-based HTTP APIs | `GET /users/42` |
| gRPC | Binary RPC over HTTP/2 with Protocol Buffers | Service-to-service calls |
| GraphQL | One endpoint where the client asks for exact fields | Query for user and orders |
| WebSocket | A persistent two-way connection | Chat messages |
| Server-Sent Events | One-way server push over HTTP | Live scores |
| Short and long polling | Ask repeatedly / hold the request open until data arrives | Notification checks |
| Webhook | The server calls your URL when an event occurs | Payment provider callback |
| Message queue | Buffer messages between producers and consumers | SQS |
| Publish and subscribe | One message reaches many subscribers | SNS |
| Event streaming | A durable, replayable log | Kafka |
| Pagination | Return results in pages: offset-based or cursor-based | Cursor is better for large, changing data |
| API versioning | Change an API without breaking clients | `/v2/users` |
| Serialization | Convert data for transfer: JSON, Avro, Protobuf | Protobuf is compact |
| Backward compatibility | New versions still work for old clients | Add fields, never remove |

### Reliability, security and operations

| Term | Definition | Example |
| --- | --- | --- |
| Single point of failure | One component whose failure stops the system | One database |
| Redundancy and failover | Duplicate components and switch on failure | Standby database |
| RPO and RTO | Maximum data loss / maximum downtime after a disaster | RPO 5 minutes, RTO 1 hour |
| Disaster recovery | A plan to restore service after major failure | Cross-region backups |
| Monitoring and alerting | Collect metrics and notify on problems | Alarm on 5xx rate |
| Logging and tracing | Records of events / the path of one request | Correlation ID across services |
| Authentication vs authorisation | Who you are / what you may do | Login / role check |
| OAuth 2.0 and OpenID Connect | Delegated authorisation / identity on top of it | Sign in with Google |
| JWT | A signed token carrying claims | `Authorization: Bearer ...` |
| TLS and mTLS | Encrypt traffic / both sides prove identity | Service mesh |
| Encryption at rest and in transit | Protect stored data / data on the wire | KMS and TLS |
| WAF and DDoS protection | Filter bad web traffic / absorb floods | AWS WAF and Shield |
| Rate limiting | Cap requests per client | 100 per minute |
| Canary and blue-green | Safe release strategies | 5% to the new version |


<a id="glossary-lld-low-level-design"></a>

## LLD: low-level design

### Object-oriented foundations

| Term | Definition | Example |
| --- | --- | --- |
| LLD | Low-Level Design: the detailed design of classes, interfaces, methods, relationships and data structures for one component | Classes for a parking lot |
| Class and object | A blueprint / an instance built from it | `class Car {}` and `new Car()` |
| Encapsulation | Keep state private and expose behaviour through methods | `#balance` with `deposit()` |
| Abstraction | Expose what an object does and hide how | `payment.pay()` |
| Inheritance | A class reuses and extends another | `SavingsAccount extends Account` |
| Polymorphism | One interface, many behaviours: overriding at run time, overloading at compile time | `shape.area()` on circle and square |
| Interface vs abstract class | A contract with no state / a partial implementation to extend | `interface Payment` vs `abstract class Account` |
| Composition vs inheritance | Has-a relationship vs is-a relationship | A `Car` has an `Engine` |
| Cohesion and coupling | How related a module's parts are / how much modules depend on each other | Aim for high cohesion, low coupling |
| Value object and immutability | An object defined by its values that never changes | `Money(100, 'AED')` |
| Access modifiers | Control visibility: public, private, protected | `private` in TypeScript, `#field` in JS |
| Static vs instance members | Belong to the class / belong to each object | `Math.max` vs `account.balance` |
| Generics | Write code that works over many types | `Repository<T>` |
| Enum | A fixed set of named values | `Status.PAID` |

### UML and diagrams

| Term | Definition | Example |
| --- | --- | --- |
| UML | Unified Modeling Language: standard notation for design diagrams | Class and sequence diagrams |
| Class diagram | Classes, their fields and methods, and their relationships | `Order` has many `OrderLine` |
| Sequence diagram | Messages between objects over time | Checkout calls payment then stock |
| Use-case diagram | Actors and what they can do with the system | Customer places order |
| State diagram | States of an object and the transitions between them | Order: created, paid, shipped |
| Activity diagram | A workflow with steps and decisions | Refund approval flow |
| Component and deployment diagrams | The parts of a system / where they run | Services on nodes |
| ER diagram | Entities, attributes and relationships for a database | `Customer` 1 to N `Order` |
| Association | Objects know about each other | `Teacher` and `Student` |
| Aggregation | A whole has parts that can exist on their own | A `Team` and its `Players` |
| Composition | A whole owns parts that cannot exist without it | A `House` and its `Rooms` |
| Dependency | One class uses another temporarily | A method parameter type |
| Generalization | Inheritance between classes | `Car` is a `Vehicle` |
| Realization | A class implements an interface | `CardPayment` implements `Payment` |
| Multiplicity (cardinality) | How many objects take part: 1:1, 1:N, N:M | One customer, many orders |

### Design elements

| Term | Definition | Example |
| --- | --- | --- |
| Domain model | The classes that represent the business concepts | `Account`, `Transaction` |
| Entity vs value object | Has identity and a life cycle / defined only by its values | `Customer` vs `Address` |
| Aggregate | A cluster of objects treated as one unit for changes | `Order` with its lines |
| Repository | Data access hidden behind a collection-like interface | `orderRepo.save(order)` |
| Service | A class holding business logic that fits no entity | `TransferService` |
| Factory | Creates complex objects correctly | `OrderFactory.create(cart)` |
| DTO | A data transfer object that carries data between layers | Response body shape |
| Mapper | Converts between objects such as entity and DTO | `toDto(order)` |
| Controller | Handles requests and calls services | Express route handler |
| API contract | The agreed request, response, errors and status codes | OpenAPI specification |
| Schema design | Tables, keys, indexes and constraints | Primary key and foreign keys |
| Normalisation | Remove duplicate data across tables: 1NF, 2NF, 3NF | Separate `addresses` table |
| Error handling | Report and recover from failures consistently | Custom error classes, error codes |
| Result type | Return success or error as a value instead of throwing | `{ ok: false, error }` |
| Validation | Check inputs at the boundary | Schema validation with Zod |
| Logging and configuration | Record events / keep settings outside code | Structured logs, environment variables |
| Extensibility | Add features without changing existing code | New strategy class |
| Testability | Design so each part can be tested alone | Inject a fake repository |
| Test doubles | Mock, stub, fake and spy stand-ins | `jest.fn()` |

### Concurrency in design

| Term | Definition | Example |
| --- | --- | --- |
| Thread safety | Code behaves correctly when run by several threads at once | Immutable objects |
| Race condition | The result depends on the timing of operations | Two seats booked at once |
| Check-then-act | Checking a condition and then acting on it without protection | Check seat free, then book |
| Critical section | Code that must not run in parallel | Update a shared balance |
| Mutex (lock) | Allows one thread at a time into a critical section | `lock.acquire()` |
| Semaphore | Allows up to N threads at a time | Limit of 10 connections |
| Deadlock | Two parties wait for each other forever | A holds lock 1 and waits for 2; B the reverse |
| Atomic operation | An operation that cannot be split or interrupted | `UPDATE ... WHERE seat_free = true` |
| Optimistic locking | Detect conflicts at write time with a version number | `WHERE version = :v` |
| Pessimistic locking | Lock the data while working on it | `SELECT ... FOR UPDATE` |
| Idempotent operation | Safe to repeat | Booking keyed by request ID |
| Thread pool and worker threads | Reuse a fixed set of workers | Node worker threads |
| Node.js concurrency | One main thread with async I/O; races still occur across `await` | Two requests read then write the same record |

### Code smells and refactoring

| Term | Definition | Example |
| --- | --- | --- |
| Code smell | A sign of a deeper design problem | Very long function |
| God class | One class with too many responsibilities | `Manager` with 40 methods |
| Long method | A function doing many things | 300-line handler |
| Feature envy | A method uses another class's data more than its own | `order` code reading `customer` fields |
| Shotgun surgery | One change needs edits in many places | Adding a field touches 12 files |
| Primitive obsession | Using raw strings and numbers instead of small types | A `string` for money |
| Duplicated code | The same logic in several places | Copy-pasted validation |
| Magic number | An unexplained literal in code | `if (status === 3)` |
| Refactoring | Improve structure without changing behaviour | Extract method, rename |
| Replace conditional with polymorphism | Swap a type switch for classes or strategies | Payment strategies |
| Clean code habits | Clear names, small functions, one level of abstraction, comments that explain why | `calculateLateFee()` |

### Typical LLD problems

| Problem | Key idea | Patterns often used |
| --- | --- | --- |
| Parking lot | Vehicles, spots, tickets, pricing | Strategy, factory |
| LRU cache | Hash map plus doubly linked list | Data structure design |
| Elevator system | Requests, states, scheduling | State, strategy |
| Tic-tac-toe or chess | Board, players, move validation | Strategy, state |
| Library or booking system | Entities, availability, reservations | Repository, observer |
| ATM or vending machine | States and transitions | State, command |
| Rate limiter | Algorithm choice per client | Strategy |
| Logger framework | Levels, sinks, formatting | Singleton, chain of responsibility |
| Splitwise (expense sharing) | Users, groups, balances | Strategy for split types |
| Notification system | Channels, templates, retries | Strategy, observer, factory |
| Approach in an interview | Clarify requirements, list entities, define relationships and interfaces, apply patterns, handle edge cases and concurrency, write core code | Eight-step method |


<a id="glossary-aws"></a>

## AWS

### Core concepts

| Term | Definition | Example |
| --- | --- | --- |
| Region | Geographic area with several data centres | `ap-south-1` (Mumbai) |
| Availability Zone (AZ) | Isolated data centre within a region | Deploy across 3 AZs for high availability |
| IAM | Identity and access management: users, roles, policies | Lambda role allowed to read one S3 bucket |
| Least privilege | Grant only the permissions needed | Policy limited to `s3:GetObject` |
| IAM role | Identity assumed by a service or user, with temporary credentials | Lambda execution role |
| VPC | Your private virtual network | Public and private subnets |
| Subnet | IP range inside a VPC; public or private | DB in a private subnet |
| Security group | Stateful firewall on an instance | Allow port 443 from the load balancer only |
| NACL | Stateless firewall at subnet level | Block a bad IP range |
| NAT gateway | Lets private subnets reach the internet outbound | Private Lambda calls an external API |
| Shared responsibility model | AWS secures the cloud; you secure what you put in it | AWS patches hosts, you patch your app |
| High availability | System stays up despite failures | Multi-AZ deployment |
| Fault tolerance | System keeps working during component failure | Auto failover to standby |
| Elasticity | Scale resources up and down with demand | Auto Scaling group |
| RPO / RTO | Max data loss / max downtime after a disaster | RPO 5 min, RTO 1 hour |
| Well-Architected Framework | AWS design pillars: operations, security, reliability, performance, cost, sustainability | Design review checklist |
| Infrastructure as Code | Define infrastructure in files | CloudFormation, CDK, Terraform |

### Individual services

| Service | Definition | Example |
| --- | --- | --- |
| API Gateway | Managed front door for APIs: routing, auth, throttling, caching | REST or WebSocket API in front of Lambda |
| API Gateway authorizer | Lambda or Cognito check run before the backend | JWT validated at the edge |
| API Gateway usage plan | Throttling and quota per API key | 1000 requests per day for a partner |
| Lambda | Serverless functions that run on events | Function triggered by an SQS message |
| Lambda cold start | Extra latency when a new execution environment starts | First call after idle takes longer |
| Provisioned concurrency | Pre-warmed Lambda instances | Avoid cold starts on a hot path |
| Lambda concurrency limit | Maximum parallel executions | Reserved concurrency of 50 |
| EC2 | Virtual servers | `t3.medium` instance |
| Auto Scaling group | Adds or removes EC2 instances by rules | Scale on CPU above 70% |
| ECS / EKS | Managed container orchestration (AWS native / Kubernetes) | Run microservices on EKS |
| Fargate | Serverless compute for containers | ECS task without managing servers |
| S3 | Object storage | Static site, file uploads, backups |
| S3 presigned URL | Temporary URL for upload or download | Browser uploads directly to S3 |
| S3 storage classes | Tiers by access frequency and cost | Standard, Intelligent-Tiering, Glacier |
| CloudFront | CDN that caches content at edge locations | Serve React build globally |
| Route 53 | DNS and routing policies | Weighted routing for canary |
| ALB / NLB | Application (layer 7) / network (layer 4) load balancer | ALB routes `/api` to a service |
| RDS | Managed relational database | PostgreSQL with Multi-AZ |
| Aurora | AWS-built MySQL/PostgreSQL-compatible database with fast failover | Up to 15 read replicas |
| Read replica | Copy of a DB for read scaling | Reporting queries hit the replica |
| DynamoDB | Managed key-value and document NoSQL database | Partition key `userId` |
| DynamoDB partition key / sort key | Key that distributes data / orders items within a partition | PK `tenantId`, SK `orderId` |
| GSI / LSI | Global / local secondary index | Query orders by status |
| ElastiCache | Managed Redis or Memcached | Cache session data |
| SQS | Managed message queue; standard or FIFO | Buffer LLM requests between Lambdas |
| Dead-letter queue (DLQ) | Queue for messages that keep failing | After 3 retries, move to DLQ |
| Visibility timeout | Time a message is hidden while being processed | 30 seconds |
| SNS | Pub/sub notifications to many subscribers | One event fans out to email, SQS, Lambda |
| EventBridge | Event bus with routing rules and schedules | Rule triggers Lambda on schedule |
| Kinesis | Streaming data ingestion | Real-time clickstream |
| Step Functions | Orchestrate workflows as state machines | Saga with compensating steps |
| Cognito | User sign-up, sign-in and tokens | Hosted login with JWT |
| Secrets Manager / Parameter Store | Store secrets and config securely | DB password rotated automatically |
| KMS | Manage encryption keys | Encrypt S3 and RDS at rest |
| CloudWatch | Logs, metrics, alarms, dashboards | Alarm when Lambda errors exceed 5% |
| X-Ray | Distributed tracing | See which downstream call is slow |
| CloudTrail | Audit log of API calls | Who deleted this bucket |
| WAF | Web application firewall | Block SQL injection patterns |
| Shield | DDoS protection | Standard is on by default |
| CloudFormation / CDK | Infrastructure as code (templates / code) | Define a stack in TypeScript |
| CodePipeline / CodeBuild / CodeDeploy | AWS CI/CD services | Build, test and deploy on push |
| ECR | Container image registry | Store Docker images |
| Bedrock | Managed access to foundation models | Call a Claude or other model via API |
| Bedrock Guardrails | Content filtering and policy controls for model I/O | Block PII or off-topic prompts |
| OpenSearch | Managed search and vector database | Vector search for RAG |


<a id="glossary-aws-deep-dive-lambda-and-step-functions"></a>

## AWS deep dive: Lambda and Step Functions

### Lambda

| Term | Definition | Example |
| --- | --- | --- |
| Function | Unit of code Lambda runs | Node.js handler `exports.handler` |
| Handler | Entry point that receives `event` and `context` | `async (event, context) => {...}` |
| Event source | What triggers the function | API Gateway, SQS, S3, EventBridge |
| Invocation types | Synchronous, asynchronous, event source mapping | API Gateway is sync; S3 is async |
| Event source mapping | Lambda polls a stream or queue and invokes your function | SQS, Kinesis, DynamoDB Streams |
| Execution environment | Sandbox where your code runs; reused between calls | Warm container |
| Cold start | Extra delay creating a new environment | First request after idle |
| Warm start | Reusing an existing environment | Second request within minutes |
| Init phase / handler phase | Code outside handler runs once; handler runs per call | Create DB client outside the handler |
| Provisioned concurrency | Pre-initialised environments | Remove cold starts for a hot API |
| Reserved concurrency | Guaranteed and capped concurrency for a function | Protect the DB from overload |
| Account concurrency limit | Total parallel executions in a region | Default 1,000, can be raised |
| Memory / CPU | CPU scales with configured memory | 1,769 MB gives about one vCPU |
| Timeout | Maximum run time, up to 15 minutes | 30 seconds for an API |
| Layers | Shared libraries or dependencies | Common utilities layer |
| Environment variables | Config for the function | `TABLE_NAME` |
| Execution role | IAM role the function assumes | Permission to read one queue |
| Resource-based policy | Lets another service invoke the function | S3 permission to call Lambda |
| Versions and aliases | Immutable snapshot / named pointer to a version | Alias `prod` points to version 12 |
| Weighted alias | Split traffic between versions | 10% to new version |
| Destinations | Route async results to a target | On failure send to SQS |
| Dead-letter queue | Holds failed async events | SQS or SNS DLQ |
| Batch size / batch window | Records per invocation / how long to wait to fill a batch | 10 SQS messages |
| Partial batch response | Report which records failed | `batchItemFailures` |
| Idempotent handler | Safe if the same event arrives twice | Dedupe by message ID |
| VPC-attached Lambda | Runs inside your VPC to reach private resources | Access RDS in a private subnet |
| Lambda@Edge / CloudFront Functions | Code at CDN edge | Rewrite headers |
| Function URL | Built-in HTTPS endpoint | Simple webhook |
| Container image Lambda | Package function as an image up to 10 GB | ML dependencies |
| SnapStart | Faster starts using a snapshot | Java functions |
| Lambda Powertools | Library for logging, tracing and metrics | Structured logs with request ID |
| Throttling | Calls rejected when over limit | 429 error |

### Step Functions

| Term | Definition | Example |
| --- | --- | --- |
| State machine | Workflow defined as states and transitions | Order approval flow |
| Amazon States Language (ASL) | JSON language for defining state machines | `"Type": "Task"` |
| State types | Task, Choice, Parallel, Map, Wait, Pass, Succeed, Fail | `Choice` branches on a value |
| Task state | Does work, such as calling Lambda or an AWS service | Invoke Lambda |
| Choice state | Branch on conditions | If `amount > 10000` go to approval |
| Parallel state | Run branches at the same time | Check fraud and credit together |
| Map state | Run steps for each item in an array | Process each record |
| Distributed Map | Large-scale Map over S3 objects | Process millions of files |
| Wait state | Pause for time or timestamp | Wait 24 hours |
| Retry | Automatic retry with backoff | `MaxAttempts: 3`, `BackoffRate: 2` |
| Catch | Route errors to a fallback state | Go to compensation step |
| Saga with Step Functions | Compensating steps on failure | Refund payment, release stock |
| Standard workflow | Long-running (up to 1 year), exactly-once, full history | Order process |
| Express workflow | Short, high-volume (up to 5 min), at-least-once | Event processing |
| Execution | One run of a state machine | Started with an input JSON |
| Input / output processing | `InputPath`, `Parameters`, `ResultPath`, `OutputPath` | Pick fields to pass on |
| Service integrations | Direct calls to AWS services without Lambda | Put item in DynamoDB |
| Integration patterns | Request-response, run a job (`.sync`), wait for callback (`.waitForTaskToken`) | Wait for human approval |
| Task token | Token a worker returns to resume a workflow | Human approval step |
| Activity | Worker polls Step Functions for tasks | Custom worker |
| Execution history | Event-by-event record of a run | Debug a failed step |
| Orchestration | Central workflow controls the steps | Step Functions |
| Idempotent steps | Each step safe to retry | Use idempotency keys |


<a id="glossary-aws-deep-dive-dynamodb-and-s3"></a>

## AWS deep dive: DynamoDB and S3

### DynamoDB

| Term | Definition | Example |
| --- | --- | --- |
| Table / item / attribute | Collection / record / field | Table `Orders`, item per order |
| Partition key (PK) | Key hashed to choose the partition | `customerId` |
| Sort key (SK) | Orders items within a partition; enables range queries | `orderDate` |
| Composite primary key | PK plus SK | `PK=CUSTOMER#1`, `SK=ORDER#2026-10-31` |
| Single-table design | Several entity types in one table, keyed for access patterns | Customer and orders together |
| Access pattern first | Model data around the queries you need | List orders for a customer |
| Hot partition | One key gets too much traffic | Popular `tenantId` |
| Partition key cardinality | Number of distinct key values; high is better | Use `userId`, not `status` |
| Query vs Scan | Query reads by key; Scan reads everything | Avoid Scan in production |
| GetItem / PutItem / UpdateItem / DeleteItem | Single-item operations | `GetItem` by key |
| BatchGetItem / BatchWriteItem | Up to 100 reads / 25 writes per call | Bulk load |
| Condition expression | Write only if a condition holds | `attribute_not_exists(id)` |
| Optimistic locking | Version attribute checked on update | `version = :expected` |
| Update expression | Change attributes in place | `SET #c = #c + :inc` |
| Filter expression | Filters after read; still consumes capacity | Not a substitute for keys |
| Projection expression | Return only some attributes | `id, status` |
| GSI | Global secondary index with different keys; eventually consistent | Query orders by `status` |
| LSI | Local secondary index with same PK, different SK; created with table | Orders by `amount` |
| Read capacity unit (RCU) / write capacity unit (WCU) | Throughput units | 1 RCU is one strongly consistent 4 KB read per second |
| On-demand vs provisioned | Pay per request / set capacity | On-demand for spiky traffic |
| Auto scaling | Adjusts provisioned capacity | Target 70% utilisation |
| Eventually vs strongly consistent read | May be stale / latest data | Strong costs double the RCUs |
| Transactions | All-or-nothing across up to 100 items | `TransactWriteItems` |
| DynamoDB Streams | Ordered log of item changes for 24 hours | Trigger Lambda on change |
| TTL | Auto-delete items after a timestamp | Expire sessions |
| Global tables | Multi-region, multi-writer replication | Regional failover |
| DAX | In-memory cache for DynamoDB | Microsecond reads |
| PartiQL | SQL-compatible query language | `SELECT * FROM Orders` |
| Item size limit | 400 KB per item | Store large data in S3 |
| Point-in-time recovery | Restore to any second in the retention window (up to 35 days) | Undo bad write |
| Export / import to S3 | Move table data without using capacity | Analytics |
| Throttling | Request rejected when capacity is exceeded | `ProvisionedThroughputExceededException` |
| Adaptive capacity | Shifts capacity to hot partitions | Smooths uneven access |
| CAP position | Highly available, tunable consistency | AP-leaning |

### S3

| Term | Definition | Example |
| --- | --- | --- |
| Bucket | Container for objects; globally unique name | `my-app-uploads` |
| Object / key | File and its identifier | `invoices/2026/10/a.pdf` |
| Prefix | Key path used to group objects | `invoices/2026/` |
| Storage classes | Standard, Intelligent-Tiering, Standard-IA, One Zone-IA, Glacier tiers | Archive after 90 days |
| Lifecycle rule | Automatic transition or expiry | Move to Glacier after 30 days |
| Versioning | Keeps every version of an object | Recover overwritten file |
| Delete marker | Hides an object in a versioned bucket | Undo by removing the marker |
| MFA delete | Require MFA to delete versions | Extra protection |
| Object Lock / WORM | Prevent deletion for a period | Compliance retention |
| Bucket policy | Resource policy for the bucket | Allow CloudFront only |
| ACL | Legacy object-level permissions | Disabled by default now |
| Block Public Access | Setting that prevents public exposure | Turn on for all buckets |
| Presigned URL | Temporary signed link | Direct browser upload |
| Multipart upload | Upload large files in parts | Files over 100 MB |
| Transfer Acceleration | Faster long-distance transfers via edge | Global uploads |
| Server-side encryption | SSE-S3, SSE-KMS, SSE-C | Use SSE-KMS for audit |
| Replication | Copy objects to another bucket or region (CRR / SRR) | Disaster recovery |
| Event notifications | Trigger on object events | `s3:ObjectCreated:*` invokes Lambda |
| Static website hosting | Serve a site from a bucket | React build behind CloudFront |
| CORS configuration | Allow browser cross-origin access | Direct browser uploads |
| Consistency | Strong read-after-write for all operations | New object is readable immediately |
| S3 Select / Athena | Query data in place | SQL on CSV or Parquet |
| Inventory / Storage Lens | Reports and usage analytics | Find unused data |
| Access Points | Named endpoints with their own policies | Per-team access |
| VPC endpoint (gateway) | Private path to S3 from a VPC | No internet needed |
| Durability / availability | 11 nines durability; availability varies by class | Standard is designed for 99.99% |
| Requester pays | Requester covers data transfer cost | Shared datasets |


<a id="glossary-aws-deep-dive-ec2-and-eks"></a>

## AWS deep dive: EC2 and EKS

### EC2

| Term | Definition | Example |
| --- | --- | --- |
| Instance | Virtual server | `t3.medium` |
| Instance type / family | Size and purpose: general (t, m), compute (c), memory (r), GPU (p, g) | `c6i.large` for CPU-bound |
| AMI | Machine image used to launch instances | Golden image with app baked in |
| EBS | Network block storage for an instance | gp3 volume |
| Instance store | Temporary local disk; lost on stop | Cache or scratch data |
| EBS snapshot | Backup of a volume stored in S3 | Daily backups |
| Key pair | SSH credentials | `.pem` file |
| User data | Script run at first boot | Install Node and start app |
| Instance profile | IAM role attached to an instance | Read from S3 without keys |
| IMDSv2 | Secure instance metadata service | Require session tokens |
| Security group | Stateful firewall | Allow 443 from ALB |
| Elastic IP | Static public IP | Fixed address |
| Placement group | Controls instance placement: cluster, spread, partition | Low-latency cluster |
| Pricing models | On-Demand, Reserved, Savings Plans, Spot | Spot for batch jobs |
| Spot instance | Spare capacity at a discount; can be reclaimed | Interruption notice of 2 minutes |
| Auto Scaling group (ASG) | Keeps a desired count of instances | Min 2, max 10 |
| Launch template | Defines how ASG launches instances | AMI, type, security group |
| Scaling policies | Target tracking, step, scheduled | Keep CPU at 60% |
| Health check | EC2 or ELB check that replaces bad instances | ALB health path `/health` |
| ELB | Load balancer: ALB (HTTP), NLB (TCP), GWLB | ALB routes by path |
| Target group | Set of targets behind a load balancer | Instances or IPs |
| Connection draining | Finish in-flight requests before removal | 30-second delay |
| Tenancy | Shared, dedicated instance, dedicated host | Dedicated for compliance |
| Nitro | AWS virtualisation platform | Better performance and security |
| Systems Manager (SSM) | Manage and access instances without SSH | Session Manager |
| Vertical vs horizontal scaling | Bigger instance / more instances | Add instances behind ALB |
| Immutable deployment | Replace instances with a new AMI | Blue-green with ASG |

### EKS

| Term | Definition | Example |
| --- | --- | --- |
| EKS | Managed Kubernetes control plane | `eksctl create cluster` |
| Control plane | AWS-managed API server and etcd across AZs | You do not manage it |
| Managed node group | EC2 nodes managed by EKS | Auto Scaling group of workers |
| Self-managed nodes | Nodes you manage yourself | Custom AMI |
| Fargate profile | Run pods serverlessly | No nodes to manage |
| Karpenter | Node autoscaler that picks instance types by pod needs | Faster, cheaper than Cluster Autoscaler |
| Cluster Autoscaler | Adds or removes nodes by pending pods | Scale on unschedulable pods |
| VPC CNI | Gives pods VPC IP addresses | Pod IP is a real VPC IP |
| AWS Load Balancer Controller | Creates ALB and NLB from Ingress and Service | Ingress becomes an ALB |
| IRSA | IAM roles for service accounts | Pod reads S3 with a scoped role |
| EKS Pod Identity | Newer way to give pods IAM roles | Simpler than IRSA |
| `aws-auth` / access entries | Map IAM users and roles to Kubernetes RBAC | Give a role cluster admin |
| Add-ons | Managed components such as CoreDNS, kube-proxy, VPC CNI | Keep versions updated |
| ECR | Image registry | Pull images from ECR |
| EBS CSI / EFS CSI | Storage drivers for persistent volumes | Stateful workloads |
| Private cluster endpoint | API server reachable only inside VPC | Stricter security |
| Cluster upgrade | Control plane first, then nodes | One minor version at a time |
| Pod security | Standards that restrict pod privileges | Block privileged pods |
| Secrets encryption | Encrypt Kubernetes secrets with KMS | Envelope encryption |
| Observability | Container Insights, Prometheus, Fluent Bit | Logs to CloudWatch |
| Cost control | Right-size requests, Spot nodes, Karpenter consolidation | Cheaper batch nodes |
| EKS vs ECS | Kubernetes API vs AWS-native orchestration | Portability vs simplicity |


<a id="glossary-aws-deep-dive-api-gateway-cloudfront-and-cloudwatch-logs"></a>

## AWS deep dive: API Gateway, CloudFront and CloudWatch Logs

### API Gateway

| Term | Definition | Example |
| --- | --- | --- |
| REST API / HTTP API / WebSocket API | Full-featured / cheaper and faster / two-way persistent connections | WebSocket for the chat client |
| Resource and method | URL path and HTTP verb | `GET /users/{id}` |
| Stage | Named deployment of an API | `dev`, `prod` |
| Deployment | Snapshot of the API published to a stage | Redeploy after changes |
| Stage variables | Per-stage config | Lambda alias per stage |
| Integration types | Lambda, HTTP, AWS service, mock, VPC link | Proxy to Lambda |
| Lambda proxy integration | Passes the whole request to Lambda | Lambda handles routing |
| Mapping template (VTL) | Transform request or response | Reshape JSON |
| Authorizer | Check identity before the backend | Lambda authorizer, Cognito, IAM, JWT |
| Lambda authorizer | Custom function returns an IAM policy | Validate a custom token |
| API key and usage plan | Identify clients, set throttle and quota | 1,000 requests per day |
| Throttling | Request rate and burst limits | 10,000 per second account default |
| Caching | Cache responses per stage | 60-second TTL |
| Request validation | Reject bad requests at the edge | JSON schema model |
| CORS | Allow browser cross-origin calls | Enable on OPTIONS |
| Custom domain | Your own domain with a certificate | `api.example.com` |
| Edge-optimised / regional / private | Endpoint types: via CloudFront / in region / VPC only | Private for internal APIs |
| VPC link | Reach private resources such as an NLB | Internal service |
| Mutual TLS | Client certificate authentication | Partner banks |
| WAF integration | Attach web firewall | Block SQL injection |
| Canary release | Send part of the traffic to a new deployment | 10% to canary |
| WebSocket routes | `$connect`, `$disconnect`, `$default`, custom routes | Chat messages |
| Connection ID | Identifier used to push messages to a WebSocket client | `@connections` API |
| Timeouts | Integration limit of 29 seconds (default) | Long jobs use queues |
| Payload limit | 10 MB for REST, 6 MB for Lambda response | Use S3 for large files |
| Access logs / execution logs | Who called / how it ran | Send to CloudWatch |
| Usage metrics | `Count`, `4XXError`, `5XXError`, `Latency` | Alarm on 5XX |

### CloudFront (CDN)

| Term | Definition | Example |
| --- | --- | --- |
| CDN | Network of edge servers that cache content close to users | Faster global delivery |
| Edge location / regional edge cache | Local cache point / mid-tier cache | Reduces origin load |
| Distribution | CloudFront configuration | One per site |
| Origin | Where content comes from | S3 bucket, ALB, API Gateway |
| Origin group | Primary and failover origins | Failover on 5xx |
| OAC (origin access control) | Restricts S3 access to CloudFront | Bucket not public |
| Behaviour | Rules per path pattern | `/api/*` to ALB, `/*` to S3 |
| Cache policy / origin request policy | What forms the cache key / what is forwarded | Cache by path, not cookies |
| TTL | How long objects stay cached | Default 24 hours |
| Cache hit ratio | Share of requests served from cache | Aim for high ratio |
| Invalidation | Remove objects from cache | `/index.html` |
| Versioned file names | Avoid invalidations | `app.3f9a.js` |
| Signed URL / signed cookie | Restrict content to authorised users | Paid downloads |
| HTTPS / ACM certificate | TLS certificate for custom domain | Certificate in `us-east-1` |
| Lambda@Edge / CloudFront Functions | Run code at the edge | Redirects, header changes |
| Geo restriction | Allow or block by country | Compliance |
| Field-level encryption | Encrypt sensitive fields at the edge | Card details |
| WAF and Shield | Firewall and DDoS protection | Rate-based rule |
| Price class | Limit edge locations to reduce cost | Use only some regions |
| Real-time logs | Request logs stream | Send to Kinesis |
| Compression / HTTP/2 / HTTP/3 | Delivery optimisations | Gzip, Brotli |
| SPA error handling | Return `index.html` for 403/404 | React Router routes |

### CloudWatch Logs

| Term | Definition | Example |
| --- | --- | --- |
| Log group | Collection of log streams with shared settings | `/aws/lambda/orders` |
| Log stream | Sequence of events from one source | One per Lambda instance |
| Log event | One record with a timestamp | JSON log line |
| Retention policy | How long logs are kept | 30 days |
| Logs Insights | Query language for logs | `fields @timestamp, @message \| filter @message like /ERROR/` |
| Metric filter | Turns log patterns into metrics | Count of `ERROR` lines |
| Alarm | Notifies when a metric crosses a threshold | Errors above 5 in 5 minutes |
| Subscription filter | Streams logs to Lambda, Kinesis or Firehose | Send to OpenSearch |
| Export to S3 | Archive logs | Long-term storage |
| Log classes | Standard and Infrequent Access | Lower cost for rarely queried logs |
| Embedded Metric Format (EMF) | Emit metrics inside JSON logs | Custom business metrics |
| Contributor Insights | Find top contributors in log data | Noisiest IPs |
| Live Tail | Real-time log view | Debug during deploy |
| Data protection policy | Detect and mask sensitive data | Mask card numbers |
| Structured logging | JSON logs with consistent fields | `requestId`, `level`, `userId` |
| Correlation ID | ID joining logs across services | `x-request-id` |
| Cross-account observability | View logs across accounts | Central ops account |
| Related services | CloudWatch Metrics, Alarms, Dashboards, X-Ray | Full observability stack |


<a id="glossary-aws-deep-dive-eventbridge-sqs-and-sns"></a>

## AWS deep dive: EventBridge, SQS and SNS

### EventBridge

| Term | Definition | Example |
| --- | --- | --- |
| Event bus | Channel that receives events | Default, custom, partner buses |
| Event | JSON record of something that happened | `OrderPlaced` |
| Event pattern | Filter that matches events | `{ "source": ["orders"] }` |
| Rule | Matches events and sends them to targets | Route `OrderPlaced` to Lambda |
| Target | Destination of a rule | Lambda, SQS, Step Functions, API destination |
| Schedule / EventBridge Scheduler | Time-based triggers, cron or rate | Run nightly at 02:00 |
| Input transformer | Reshape the event before delivery | Send only needed fields |
| Schema registry | Stores event schemas and generates code bindings | Discover event shapes |
| Archive and replay | Store events and replay them later | Reprocess after a bug fix |
| Pipes | Point-to-point source to target with filtering and enrichment | SQS to Step Functions |
| Retry policy / DLQ | Retries with a dead-letter queue for failed deliveries | 24 hours, then DLQ |
| Cross-account / cross-region | Send events between accounts and regions | Central event bus |
| API destination | Call external HTTP endpoints | Webhook to a partner |
| Content-based filtering | Match on event content | `amount` greater than 1000 |
| Choreography | Services react to events without a central coordinator | Orders, billing, shipping |
| Delivery guarantee | At-least-once | Consumers must be idempotent |

### SQS

| Term | Definition | Example |
| --- | --- | --- |
| Queue | Managed message buffer | `llm-requests` |
| Standard queue | Near-unlimited throughput, at-least-once, best-effort order | High-volume tasks |
| FIFO queue | Exactly-once processing, strict order per group | Payments |
| Message group ID | Orders messages within a group in FIFO | One group per account |
| Deduplication ID | Prevents duplicates in FIFO within 5 minutes | Hash of body |
| Producer / consumer | Sends / receives messages | Lambda consumer |
| Visibility timeout | Time a message is hidden while being processed | 6 times the Lambda timeout |
| Receive / delete | Consumer must delete after success | Otherwise the message reappears |
| Short vs long polling | Return immediately / wait for messages up to 20s | Long polling reduces cost |
| Message retention | 1 minute to 14 days | 4 days default |
| Delay queue / message timer | Delay delivery up to 15 minutes | Delay retries |
| Dead-letter queue | Holds messages after `maxReceiveCount` failures | 3 attempts, then DLQ |
| DLQ redrive | Move messages from DLQ back to source | Reprocess after fix |
| Batch operations | Send or receive up to 10 messages | Higher throughput |
| Message size | Up to 1 MiB since Aug 2025 (use S3 for larger) | Claim check pattern |
| Message attributes | Metadata with the message | Trace ID, tenant ID |
| Encryption | SSE-SQS or SSE-KMS | Encrypt at rest |
| Access policy | Resource policy for who can send or receive | Allow SNS to send |
| Lambda event source mapping | Lambda polls the queue | Batch size and concurrency settings |
| Back-pressure / load leveling | Queue absorbs spikes | Protect the LLM from bursts |
| Competing consumers | Many workers share the load | Scale consumers by queue depth |
| Poison message | Message that always fails | Moves to DLQ |
| Metrics | `ApproximateNumberOfMessagesVisible`, `ApproximateAgeOfOldestMessage` | Alarm on age |
| Idempotent consumer | Handle duplicates safely | Check processed IDs |

### SNS

| Term | Definition | Example |
| --- | --- | --- |
| Topic | Pub/sub channel | `order-events` |
| Publisher / subscriber | Sends to topic / receives from it | Service publishes, queues subscribe |
| Subscription protocols | SQS, Lambda, HTTP(S), email, SMS, mobile push, Firehose | Fan-out to many consumers |
| Fan-out pattern | One message to many SQS queues | SNS to billing, shipping, analytics queues |
| Standard vs FIFO topic | High throughput vs ordered, deduplicated | FIFO for ordered events |
| Message filtering | Subscription filter policies on attributes | Only `type = refund` |
| Raw message delivery | Send payload without SNS wrapper | Simpler consumers |
| Delivery retries / DLQ | Retry policy and dead-letter queue for failed deliveries | Subscription DLQ |
| Message attributes | Metadata used for filtering | `region`, `eventType` |
| Encryption | SSE with KMS | Encrypt topic |
| Access policy | Controls who can publish or subscribe | Allow a specific account |
| Mobile push / SMS | Notify end users | OTP messages |
| Delivery status logging | Log success and failure | Debug missed messages |
| SNS vs SQS | Push to many subscribers vs pull from a queue | Combine them for durability |
| SNS vs EventBridge | Simple high-throughput fan-out vs rich routing, schemas and SaaS sources | EventBridge for complex rules |


<a id="glossary-aws-deep-dive-kms-and-iam"></a>

## AWS deep dive: KMS and IAM

### KMS

| Term | Definition | Example |
| --- | --- | --- |
| KMS | Managed service for creating and controlling encryption keys | Encrypt S3, RDS, SQS |
| KMS key (formerly CMK) | Logical key; material is held in HSMs and never leaves KMS | `alias/app-data` |
| AWS managed key | Created and managed by AWS for a service | `aws/s3` |
| Customer managed key | You control policy, rotation and deletion | Audit and revoke access |
| Symmetric vs asymmetric key | One key to encrypt and decrypt / public and private pair | Asymmetric for signing |
| Envelope encryption | Encrypt data with a data key; encrypt the data key with a KMS key | Used by S3 SSE-KMS |
| Data key | Key used to encrypt the actual data | `GenerateDataKey` |
| Encrypt / Decrypt / ReEncrypt | Direct API calls for small data (up to 4 KB) | Encrypt a secret |
| Key policy | Resource policy that controls key access; the main control | Allow a role to decrypt |
| Grants | Temporary delegated permissions on a key | Service gets access |
| Key rotation | Automatic yearly rotation of key material | Enable on customer managed keys |
| Encryption context | Extra key-value data bound to encryption; appears in logs | `tenantId=42` |
| Key alias | Friendly name for a key | `alias/payments` |
| Multi-region keys | Same key material in several regions | Cross-region DR |
| Key states | Enabled, disabled, pending deletion | 7-30 day deletion wait |
| CloudTrail logging | Every key use is logged | Audit trail |
| CloudHSM / external key store | Dedicated or customer-held hardware keys | Strict compliance |
| Request quotas | Rate limits per account and region | Cache data keys to reduce calls |
| Encryption at rest / in transit | Protect stored data / data on the wire | KMS and TLS |
| BYOK | Bring your own key material | Regulated environments |

### IAM

| Term | Definition | Example |
| --- | --- | --- |
| Principal | Entity that makes requests | User, role, service |
| User | Long-term identity for a person or app | Avoid for apps; use roles |
| Group | Collection of users sharing permissions | `Developers` |
| Role | Identity assumed temporarily, with no long-term keys | Lambda execution role |
| Policy | JSON document defining permissions | Allow `s3:GetObject` |
| Policy structure | `Effect`, `Action`, `Resource`, `Condition`, `Principal` | `"Effect": "Allow"` |
| Identity-based policy | Attached to a user, group or role | Role can read a bucket |
| Resource-based policy | Attached to a resource | Bucket policy |
| Trust policy | Says who can assume a role | Lambda service principal |
| Permissions boundary | Maximum permissions an identity can have | Limit developer-created roles |
| Service control policy (SCP) | Organisation-level guardrail across accounts | Block disabling CloudTrail |
| Session policy | Limits an assumed role session | Scoped-down access |
| Explicit deny | Always overrides any allow | `Deny` wins |
| Evaluation logic | Default deny, then explicit deny, then allow | Any deny blocks |
| Least privilege | Grant only needed permissions | Specific actions and resources |
| Managed vs inline policy | Reusable policy / policy embedded in one identity | AWS managed `ReadOnlyAccess` |
| Condition keys | Restrict by context | `aws:SourceIp`, `aws:MultiFactorAuthPresent` |
| STS | Issues temporary credentials | `AssumeRole` |
| AssumeRole / cross-account access | Take a role in another account | Central tooling account |
| Federation / SAML / OIDC | Sign in with an external identity provider | Corporate SSO |
| IAM Identity Center (SSO) | Central workforce access to accounts | Single sign-on |
| Cognito vs IAM | Application end users vs AWS access | Customers log in via Cognito |
| Access keys | Long-term programmatic credentials | Rotate or avoid |
| MFA | Second authentication factor | Virtual or hardware device |
| Root user | Account owner with full access | Lock away, enable MFA |
| Access Analyzer | Finds unintended external access | Public bucket detection |
| Credential report / last used | Audit unused credentials | Remove stale keys |
| Tags and ABAC | Attribute-based access control using tags | Access where `team` matches |
| IRSA / Pod Identity | IAM roles for Kubernetes pods | Pod reads one bucket |
| Service-linked role | Role predefined for an AWS service | Auto Scaling |
| PassRole | Permission to give a role to a service | Required to attach a role to Lambda |
| CloudTrail | Audit log of API calls | Who changed this policy |


<a id="glossary-postgresql"></a>

## PostgreSQL

| Term | Definition | Example |
| --- | --- | --- |
| ACID | Atomicity, Consistency, Isolation, Durability | Transfer debits and credits together or not at all |
| Transaction | Group of statements that commit or roll back together | `BEGIN; ...; COMMIT;` |
| Isolation levels | How much concurrent transactions see each other: read committed, repeatable read, serializable | Postgres default is read committed |
| Dirty / non-repeatable / phantom read | Anomalies at lower isolation levels | Row appears between two identical queries |
| MVCC | Multi-version concurrency control: readers do not block writers | Each transaction sees a snapshot |
| VACUUM | Cleans dead row versions left by MVCC | Autovacuum runs in background |
| WAL | Write-ahead log: changes logged before applying; basis for recovery and replication | Point-in-time recovery |
| Primary key | Unique row identifier | `id BIGSERIAL PRIMARY KEY` |
| Foreign key | Column that references another table | `user_id REFERENCES users(id)` |
| Index | Structure that speeds up lookups | `CREATE INDEX ON orders(user_id)` |
| B-tree index | Default index; good for equality and ranges | Date range queries |
| GIN index | Index for arrays, JSONB and full text | Search inside JSONB |
| Composite index | Index on several columns; order matters | `(tenant_id, created_at)` |
| Partial index | Index on a subset of rows | `WHERE status = 'open'` |
| Covering index | Index that holds all needed columns | `INCLUDE (amount)` |
| `EXPLAIN ANALYZE` | Shows the query plan and real timings | Spot a sequential scan |
| Sequential scan vs index scan | Read whole table vs use an index | Add an index to avoid full scans |
| N+1 query | One query plus one per row | Fetching orders then each user |
| Normalisation | Reduce duplication across tables | Separate `users` and `addresses` |
| Denormalisation | Duplicate data for read speed | Store `user_name` on `orders` |
| JOIN types | INNER, LEFT, RIGHT, FULL | `LEFT JOIN` keeps rows with no match |
| CTE | Named subquery with `WITH` | `WITH recent AS (...) SELECT ...` |
| Window function | Calculation across related rows | `ROW_NUMBER() OVER (PARTITION BY ...)` |
| JSONB | Binary JSON column type, indexable | `data->>'email'` |
| View / materialised view | Saved query / saved query with stored results | Refresh nightly report |
| Trigger | Function run automatically on a table event | Audit log on update |
| Stored procedure | Server-side routine | `CALL transfer(...)` |
| Deadlock | Two transactions wait on each other | Postgres aborts one |
| Row-level locking | Lock selected rows | `SELECT ... FOR UPDATE` |
| Connection pooling | Reuse DB connections | PgBouncer |
| Replication | Copy data to other servers | Streaming replication |
| Read replica | Replica serving read queries | Reports use the replica |
| Failover | Promote a replica when primary fails | Patroni or RDS Multi-AZ |
| Partitioning | Split one table into parts on one server | Range partition by month |
| Sharding | Split data across servers | Shard by `tenant_id` (for example with Citus) |
| Backup types | Logical (`pg_dump`) or physical (base backup plus WAL) | PITR to a chosen time |
| pgvector | Extension for vector similarity search | Embeddings for RAG |


<a id="glossary-mongodb"></a>

## MongoDB

| Term | Definition | Example |
| --- | --- | --- |
| Document | JSON-like record (stored as BSON) | `{ _id: 1, name: "Asha" }` |
| Collection | Group of documents, like a table | `users` |
| Database | Container of collections | `bank` |
| `_id` / ObjectId | Unique document key, auto-generated | `ObjectId("...")` |
| BSON | Binary JSON with more types | Dates, decimals |
| Schema flexibility | Documents in a collection can differ | Optional fields |
| Schema validation | Rules enforced on writes | `$jsonSchema` validator |
| Embedding vs referencing | Nest related data in one document vs store ids | Embed order items; reference users |
| CRUD | Create, read, update, delete | `insertOne`, `find`, `updateOne`, `deleteOne` |
| Query operators | Filter operators | `{ age: { $gt: 18 } }` |
| Update operators | Change fields | `{ $set: { status: "done" } }`, `$inc`, `$push` |
| Projection | Choose returned fields | `find({}, { name: 1 })` |
| Aggregation pipeline | Stages that transform documents | `$match`, `$group`, `$sort`, `$lookup` |
| `$lookup` | Left outer join across collections | Join orders to users |
| Index | Speeds up queries | `createIndex({ email: 1 })` |
| Compound index | Index on several fields | `{ tenantId: 1, createdAt: -1 }` |
| TTL index | Deletes documents after a time | Expire sessions after 1 hour |
| Text / geospatial index | Full-text search / location queries | `2dsphere` |
| `explain()` | Shows how a query ran | Check for `COLLSCAN` |
| Replica set | Primary plus secondaries holding copies | 3-node set |
| Primary / secondary | Accepts writes / replicates from primary | Automatic election on failure |
| Election | Secondaries choose a new primary | After primary goes down |
| Write concern | How many nodes must acknowledge a write | `w: "majority"` |
| Read concern | Consistency level of reads | `majority` |
| Read preference | Which node serves reads | `secondaryPreferred` |
| Oplog | Log of operations used for replication | Basis for change streams |
| Change streams | Subscribe to data changes | React to inserts in real time |
| Sharding | Split data across servers | Shard by `tenantId` |
| Shard key | Field that decides data placement | High cardinality, even spread |
| Chunk / balancer | Range of data / process that moves chunks between shards | Rebalance after adding a shard |
| `mongos` / config servers | Query router / cluster metadata | App connects to `mongos` |
| Hashed vs ranged sharding | Even spread vs range queries | Hashed `_id` |
| Transactions | Multi-document ACID since v4.0 | `session.withTransaction()` |
| CAP position | CP by default: majority writes favour consistency | Primary unavailable during partition |
| Mongoose | Node.js ODM with schemas | `new Schema({ ... })` |
| Atlas | Managed MongoDB service | Hosted cluster |
| WiredTiger | Default storage engine | Document-level concurrency |
| GridFS | Store large files in chunks | Files above 16 MB |


<a id="glossary-kafka"></a>

## Kafka

| Term | Definition | Example |
| --- | --- | --- |
| Event streaming | Continuously capturing and processing events as they happen | Payment events flowing to fraud checks |
| Broker | Kafka server that stores and serves data | 3-broker cluster |
| Cluster | Group of brokers working together | Production cluster across 3 AZs |
| Topic | Named stream of records | `payments.completed` |
| Partition | Ordered, append-only slice of a topic; unit of parallelism | Topic with 12 partitions |
| Offset | Position of a record within a partition | Consumer is at offset 4521 |
| Record / message | Key, value, headers, timestamp | Key `accountId`, value JSON |
| Key | Decides which partition a record goes to | Same `accountId` keeps order |
| Producer | Client that writes records | Order service publishes `OrderPlaced` |
| Consumer | Client that reads records | Notification service |
| Consumer group | Consumers sharing a topic; each partition goes to one member | 4 consumers split 12 partitions |
| Rebalance | Partitions reassigned when consumers join or leave | Pod restart triggers rebalance |
| Consumer lag | How far a consumer is behind the latest offset | Lag of 10,000 messages |
| Commit offset | Consumer records its progress | Commit after processing |
| Replication factor | Number of copies of each partition | Factor 3 |
| Leader / follower | One replica serves reads and writes; others copy it | Leader fails, follower is elected |
| ISR | In-sync replicas that are caught up | Required for safe acknowledgement |
| `acks` setting | Producer durability level: 0, 1 or all | `acks=all` for payments |
| Retention | How long Kafka keeps records | 7 days or by size |
| Log compaction | Keep only the latest record per key | Latest customer profile |
| At-most-once | Messages may be lost, never duplicated | Commit before processing |
| At-least-once | Messages never lost, may be duplicated | Commit after processing |
| Exactly-once | Each message effect happens once | Idempotent producer plus transactions |
| Idempotent consumer | Handles duplicates safely | Dedupe by event ID |
| Ordering guarantee | Order holds only within a partition | Use the same key |
| Kafka Connect | Framework to move data in and out of Kafka | Postgres to Kafka via Debezium |
| CDC | Change data capture: stream DB changes as events | Debezium reads the Postgres WAL |
| Kafka Streams | Library for stream processing | Count transactions per minute |
| Schema registry | Stores and versions message schemas | Avro schema with compatibility checks |
| Dead-letter topic | Topic for records that fail processing | `payments.dlq` |
| Backpressure | Consumer controls pace by polling | Reduce `max.poll.records` |
| KRaft | Kafka's built-in metadata quorum, replacing ZooKeeper | Cluster without ZooKeeper |
| Kafka vs SQS | Kafka is a replayable log; SQS is a queue where messages are deleted after processing | Replay events for a new consumer |


<a id="glossary-kubernetes"></a>

## Kubernetes

| Term | Definition | Example |
| --- | --- | --- |
| Container | Packaged app with its dependencies | Docker image of a Node service |
| Image / registry | Built package / place that stores images | ECR, Docker Hub |
| Cluster | Set of machines running Kubernetes | EKS cluster |
| Control plane | Components that manage the cluster | API server, scheduler, etcd |
| Node | Worker machine that runs pods | EC2 instance |
| Pod | Smallest deployable unit; one or more containers | Pod with app plus sidecar |
| Deployment | Manages replicas and rolling updates of pods | `replicas: 3` |
| ReplicaSet | Keeps a set number of pod copies running | Created by a Deployment |
| StatefulSet | Pods with stable identity and storage | Database or Kafka |
| DaemonSet | One pod on every node | Log collector |
| Job / CronJob | Run to completion / run on a schedule | Nightly report |
| Service | Stable network address for a set of pods | ClusterIP `orders-svc` |
| Service types | ClusterIP (internal), NodePort, LoadBalancer | LoadBalancer exposes to internet |
| Ingress | HTTP routing into the cluster | `/api` to `api-svc` |
| Namespace | Logical partition of a cluster | `staging`, `prod` |
| ConfigMap | Non-secret configuration | `LOG_LEVEL=info` |
| Secret | Sensitive configuration | DB password |
| Volume / PVC | Storage mounted into pods / request for storage | Persistent disk for a database |
| Label / selector | Key-value tags / queries on tags | `app=orders` |
| Liveness probe | Restart container if unhealthy | `GET /health` |
| Readiness probe | Send traffic only when ready | `GET /ready` |
| Startup probe | Gives slow apps time to start | Large app boot |
| Resource requests / limits | Guaranteed / maximum CPU and memory | `cpu: 250m`, `memory: 512Mi` |
| HPA | Horizontal Pod Autoscaler: scales pod count on metrics | Scale at 70% CPU |
| VPA / Cluster Autoscaler | Adjust pod size / add or remove nodes | New node when pods are unschedulable |
| Rolling update | Replace pods gradually | `maxUnavailable: 1` |
| Rollback | Return to previous version | `kubectl rollout undo` |
| Scheduler | Chooses a node for each pod | Respects resource requests |
| Taints / tolerations | Keep pods off nodes unless they tolerate them | Reserve GPU nodes |
| Affinity | Rules to place pods near or away from others | Spread replicas across AZs |
| RBAC | Role-based access control | Role allows read on pods |
| Network policy | Firewall rules between pods | Only API can reach the DB |
| Helm | Package manager with templated charts | `helm install app ./chart` |
| Operator / CRD | Custom resource plus controller that manages it | Postgres operator |
| Service mesh | Sidecar layer for traffic, mTLS and retries | Istio |
| Sidecar | Helper container beside the main one | Envoy proxy |
| Init container | Runs before the app container | Run DB migrations |
| `kubectl` | CLI for the cluster | `kubectl get pods` |
| CrashLoopBackOff | Pod keeps crashing and restarting | Check `kubectl logs` |


<a id="glossary-devops"></a>

## DevOps

| Term | Definition | Example |
| --- | --- | --- |
| DevOps | Culture and practices joining development and operations | Teams own what they ship |
| Infrastructure as Code (IaC) | Manage infrastructure through versioned files | Terraform, CloudFormation, CDK |
| Configuration management | Automate server setup | Ansible |
| Immutable infrastructure | Replace servers instead of patching them | New AMI per release |
| Containerisation | Package apps with dependencies | Dockerfile |
| Orchestration | Automate running containers at scale | Kubernetes |
| Observability | Understand system state from its outputs | Logs, metrics, traces |
| Logs / metrics / traces | What happened / how much / where in the request path | ELK, Prometheus, Jaeger |
| Monitoring vs alerting | Collect data vs notify on thresholds | Page when error rate above 5% |
| Correlation ID | ID carried through a request across services | `x-request-id` header |
| Golden signals | Latency, traffic, errors, saturation | Dashboard per service |
| SLI / SLO / SLA | Measurement / internal target / contract with penalties | 99.9% of requests under 300 ms |
| Error budget | Allowed unreliability under an SLO | 43 minutes of downtime per month at 99.9% |
| SRE | Site reliability engineering: apply software engineering to operations | Automate toil |
| MTTR / MTBF | Mean time to recover / between failures | Lower MTTR with runbooks |
| Incident / postmortem / RCA | Outage / blameless review / root cause analysis | Write RCA with timeline and actions |
| Runbook | Step-by-step guide for known issues | "DB connections exhausted" playbook |
| On-call | Rotation for responding to incidents | Weekly rotation |
| Blue-green deployment | Two environments; switch traffic at once | Flip load balancer to green |
| Canary release | Send a small share of traffic to the new version first | 5% then 25% then 100% |
| Feature flag | Turn features on or off without deploying | Enable for internal users |
| Rollback | Return to the last good version | Redeploy previous image |
| Zero-downtime deployment | Release with no user-visible outage | Rolling update with readiness probes |
| Strangler fig | Replace a legacy system piece by piece behind a facade | Route one endpoint at a time to new service |
| Chaos engineering | Inject failures to test resilience | Kill a pod in staging |
| Load balancer | Spreads traffic across instances | ALB |
| Reverse proxy | Server that forwards client requests to backends | Nginx |
| Circuit breaker | Fail fast when a dependency is unhealthy | Open after 5 failures |
| Secrets management | Store credentials outside code | Vault, Secrets Manager |
| DevSecOps | Security built into the pipeline | Dependency scanning in CI |
| SAST / DAST / SCA | Static code scan / running app scan / dependency scan | SonarQube, OWASP ZAP, Snyk |
| GitOps | Git is the source of truth for deployments | Argo CD syncs the cluster from a repo |
| Disaster recovery | Plan to restore service after major failure | Cross-region backup |


<a id="glossary-ci-cd"></a>

## CI/CD

| Term | Definition | Example |
| --- | --- | --- |
| Continuous Integration (CI) | Merge often; every change is built and tested automatically | Tests run on each pull request |
| Continuous Delivery | Every change is always ready to release; deploy needs approval | Manual approval before prod |
| Continuous Deployment | Every passing change is released automatically | Merge to main goes live |
| Pipeline | Automated sequence of stages | Build, test, scan, deploy |
| Stage / job / step | Pipeline grouping levels | `test` stage with a lint job |
| Trigger | Event that starts a pipeline | Push, pull request, schedule |
| Build artifact | Output of a build that gets deployed | Docker image, zip |
| Artifact repository | Stores build outputs | ECR, Nexus, npm registry |
| Runner / agent | Machine that executes pipeline jobs | GitHub Actions runner |
| Pipeline as code | Pipeline defined in a versioned file | `.github/workflows/ci.yml`, `Jenkinsfile` |
| Quality gate | Check that must pass to continue | Coverage above 80%, no critical issues |
| Unit / integration / e2e tests | Test one unit / several parts / whole flow | Jest / API tests / Playwright |
| Smoke test | Quick check that the deployment works | Hit `/health` after deploy |
| Static analysis / linting | Check code without running it | ESLint, SonarQube |
| Dependency scanning | Find vulnerable libraries | `npm audit` |
| Environment promotion | Move the same artifact dev, staging, prod | Build once, deploy many |
| Rolling deployment | Replace instances gradually | 1 pod at a time |
| Blue-green / canary | Switch environments / gradual traffic shift | See DevOps section |
| Approval gate | Manual sign-off before a stage | Release manager approves prod |
| Rollback strategy | Plan to revert a bad release | Redeploy previous artifact |
| Database migration | Versioned schema change run in pipeline | Flyway, Knex migrations |
| Expand and contract | Backward compatible schema change in two phases | Add column, backfill, then drop old one |
| Trunk-based development | Short-lived branches merged to main frequently | Feature flags hide unfinished work |
| Pull request / code review | Proposal to merge plus peer review | Two approvals required |
| Monorepo / polyrepo | One repo for many projects / one repo each | Nx or Turborepo |
| Caching | Reuse dependencies between runs | Cache `node_modules` |
| Matrix build | Run the same job on several versions | Node 18, 20, 22 |
| DORA metrics | Deployment frequency, lead time, change failure rate, time to restore | Track delivery performance |
| Tools | Common CI/CD systems | Jenkins, GitHub Actions, GitLab CI, CircleCI, Argo CD |


<a id="glossary-types-of-deployment"></a>

## Types of deployment

### Release strategies

| Term | Definition | Example |
| --- | --- | --- |
| Recreate (big bang) | Stop the old version, then start the new one; causes downtime | Kubernetes `strategy: Recreate` |
| Rolling deployment | Replace instances gradually in batches | Kubernetes default, `maxSurge` and `maxUnavailable` |
| Blue-green deployment | Two full environments; switch traffic from blue to green | Swap the load balancer target group |
| Canary deployment | Send a small share of traffic to the new version and grow it | 5%, then 25%, then 100% |
| Progressive delivery | Automated, metric-driven rollout and rollback | Argo Rollouts, Flagger |
| A/B deployment | Route users by rule to compare versions | Half of users see variant B |
| Shadow deployment | New version gets a copy of live traffic but its responses are dropped | Compare results offline |
| Dark launch | Ship code to production without exposing it to users | Hidden behind a flag |
| Feature flag (toggle) | Turn a feature on or off without a deploy | LaunchDarkly, Unleash |
| Ring deployment | Release to rings of users: internal, early adopters, everyone | Used for desktop and mobile apps |
| Immutable deployment | Replace servers with new ones rather than changing them | New AMI per release |
| Mutable deployment | Update existing servers in place | SSH and run a script (avoid) |
| Hot fix / patch release | Urgent small fix outside the normal cycle | Fix a payment bug |
| Big bang vs phased | All users at once / group by group | Phased lowers risk |

### Rollout mechanics

| Term | Definition | Example |
| --- | --- | --- |
| Rollback | Return to the previous version | `kubectl rollout undo deployment/api` |
| Roll forward | Fix and deploy a new version instead of going back | Used when data has changed |
| Zero-downtime deployment | Users see no outage during release | Rolling plus readiness probes |
| Health check / readiness probe | Decides when an instance can receive traffic | `/healthz` |
| Connection draining | Let in-flight requests finish before removing an instance | Load balancer deregistration delay |
| Traffic shifting | Move traffic by weight between versions | Weighted routing in Route 53 or a service mesh |
| Bake time | Period of watching metrics after a rollout step | 30 minutes at 10% |
| Deployment frequency / lead time / change failure rate / MTTR | DORA metrics for delivery performance | Track per team |
| Backward compatible change | New version works with the old data and clients | Add a column, do not rename it |
| Expand and contract (parallel change) | Add the new, migrate, then remove the old | Safe database schema change |
| Database migration | Versioned schema change run during release | Flyway, Liquibase, Prisma Migrate |
| Deployment window / change freeze | Allowed period for releases / period with no releases | Freeze during year-end |
| Release train | Releases on a fixed schedule | Every second Tuesday |
| Trunk-based development | Short-lived branches and frequent merges to the main branch | Enables continuous deployment |

### Delivery models and environments

| Term | Definition | Example |
| --- | --- | --- |
| Continuous integration | Merge and test often | Build and test on every pull request |
| Continuous delivery | Every change is releasable; a person approves the release | Manual approval gate |
| Continuous deployment | Every passing change goes to production automatically | No manual gate |
| GitOps | Git holds the desired state; an agent applies it | Argo CD, Flux |
| Infrastructure as Code | Define infrastructure in files | Terraform, CloudFormation, CDK |
| Environment | A place where the app runs | Dev, test, staging, production |
| Staging / pre-production | A production-like environment for final checks | UAT on staging |
| Ephemeral (preview) environment | Short-lived environment per pull request | Deleted when the PR closes |
| Artifact repository | Stores built, versioned outputs | ECR, npm registry, Artifactory |
| Promotion | Move the same artifact through environments | Build once, deploy many |
| Configuration vs code | Config changes per environment; the build stays the same | Environment variables, Parameter Store |
| Secrets management | Store secrets outside the code | AWS Secrets Manager |

### Hosting and infrastructure models

| Term | Definition | Example |
| --- | --- | --- |
| On-premises | Hardware run in your own data centre | Bank data centre |
| Cloud | Rented infrastructure | AWS, Azure, GCP |
| Hybrid cloud | On-premises plus cloud together | Core banking on-premises, apps in cloud |
| Multi-cloud | More than one cloud provider | Workloads on AWS and Azure |
| Multi-region | Run in several regions for resilience | Active-active across two regions |
| VM-based | Deploy to virtual machines | EC2 with an Auto Scaling group |
| Container-based | Deploy images to a container platform | ECS, EKS |
| Serverless | Deploy functions or managed services without servers | Lambda with API Gateway |
| Platform as a Service | Push code; the platform runs it | Elastic Beanstalk, Heroku |
| Edge deployment | Run code close to users | CloudFront Functions, Cloudflare Workers |
| Air-gapped deployment | No external network access | Regulated or defence systems |
| Mobile and app store release | Staged release through stores | Google Play staged rollout |
| Static site deployment | Upload files to storage and a CDN | S3 with CloudFront |


<a id="glossary-git"></a>

## Git

| Term | Definition | Example |
| --- | --- | --- |
| Repository | Project with its full history | `git init` |
| Commit | Snapshot of changes with a message | `git commit -m "Add login"` |
| Working tree / staging area / repository | Edited files / files marked for commit / committed history | `git add` moves to staging |
| Branch | Movable pointer to a commit | `git switch -c feature/login` |
| HEAD | Pointer to the current commit or branch | `HEAD~1` is the parent |
| Remote / origin | Server copy of the repo / default remote name | `git remote -v` |
| Clone / fork | Copy a repo locally / copy a repo to your account | `git clone <url>` |
| Fetch vs pull | Download changes / download and merge | `git pull` = fetch + merge |
| Push | Send commits to a remote | `git push origin main` |
| Merge | Combine branches, creating a merge commit | `git merge feature` |
| Fast-forward merge | Move the pointer, no merge commit | Linear history |
| Rebase | Replay commits on top of another base for a linear history | `git rebase main` |
| Merge vs rebase | Merge keeps history; rebase rewrites it | Never rebase shared branches |
| Squash | Combine several commits into one | `git merge --squash` |
| Interactive rebase | Edit, reorder or squash commits | `git rebase -i HEAD~3` |
| Cherry-pick | Apply one commit to another branch | `git cherry-pick abc123` |
| Stash | Save uncommitted work temporarily | `git stash` / `git stash pop` |
| Reset | Move the branch pointer back | `--soft`, `--mixed`, `--hard` |
| Revert | Add a new commit that undoes a past one | `git revert abc123` |
| Reset vs revert | Reset rewrites history; revert is safe on shared branches | Revert on `main` |
| Reflog | Log of where HEAD has been; recovers lost commits | `git reflog` |
| Merge conflict | Same lines changed in both branches | Resolve markers, then commit |
| Pull request / merge request | Proposal to merge with review | Review, approve, merge |
| `.gitignore` | Files Git should not track | `node_modules/` |
| Tag | Fixed label on a commit, often a release | `git tag v1.2.0` |
| Diff | Show differences | `git diff --staged` |
| Blame / bisect | Who changed a line / binary search for a bad commit | `git bisect start` |
| Force push | Overwrite remote history | Prefer `--force-with-lease` |
| Git hooks | Scripts run on Git events | Husky runs lint on pre-commit |
| Submodule | Repo nested inside another | Shared library |
| Worktree | Several working directories from one repo | Review a branch without switching |
| Branching strategies | Gitflow, GitHub Flow, trunk-based | Short-lived feature branches |
| Conventional commits | Commit message standard | `feat: add payment retry` |
| Semantic release | Version from commit types | `fix` bumps patch |


<a id="glossary-sdlc-software-development-life-cycle"></a>

## SDLC: software development life cycle

### Phases

| Term | Definition | Example |
| --- | --- | --- |
| SDLC | Software Development Life Cycle: the structured process for planning, building, testing, releasing and maintaining software | Plan, design, build, test, deploy, maintain |
| Planning and feasibility study | Decide if the project is worth doing: technical, economic and operational feasibility | Can we build it, afford it and run it? |
| Requirements elicitation | Gather needs from stakeholders | Interviews, workshops, user stories |
| Requirements analysis | Clarify, prioritise and check requirements for conflicts | MoSCoW: must, should, could, won't |
| BRD, FRD and SRS | Business requirements document / functional requirements document / software requirements specification | SRS lists features and NFRs |
| Requirements traceability matrix (RTM) | Maps each requirement to its design, code and tests | Requirement R12 to test case T45 |
| Design phase | Turn requirements into architecture and detailed design | HLD then LLD |
| Implementation | Write and review the code | Feature branch and pull request |
| Testing phase | Verify the software meets requirements | Unit, integration, system, UAT |
| Deployment and release | Move the software to production | Blue-green deployment |
| Maintenance | Keep the software working: corrective (bugs), adaptive (environment), perfective (improvements), preventive (future problems) | Patch a bug; upgrade a runtime |
| Hypercare | A period of extra support right after go-live | Two weeks of daily monitoring |
| End of life (EOL) and sunset | Retire the software in a planned way | Notify users, migrate data, switch off |

### Models and methodologies

| Term | Definition | Example |
| --- | --- | --- |
| Waterfall | Sequential phases; each finishes before the next starts | Fixed-scope government project |
| V-model | Each development phase is paired with a test phase | Requirements pair with acceptance tests |
| Iterative model | Build, review and improve in repeated cycles | Refine a prototype each cycle |
| Incremental model | Deliver the product in working slices | Login first, then payments |
| Spiral model | Repeated cycles with risk analysis at each turn | Large, high-risk systems |
| Prototype model | Build a rough version early to clarify requirements | Clickable UI mock-up |
| RAD | Rapid Application Development: fast delivery with prototypes and user feedback | Internal tools |
| Agile | Iterative delivery with feedback and adaptation to change | Two-week sprints |
| Scrum | An Agile framework with sprints, roles and ceremonies | Sprint planning, review, retrospective |
| Kanban | A flow-based method with a visual board and limits on work in progress | To Do, In Progress, Done |
| Extreme Programming (XP) | Agile practices such as pair programming, TDD and continuous integration | Pair on a hard story |
| Lean software development | Remove waste, deliver fast, learn continuously | Cut unused features |
| DevOps | Joins development and operations with automation and shared ownership | CI/CD, monitoring |
| Big Bang model | Little planning; code until it works | Small experiments only |
| SAFe | Scaled Agile Framework for many teams | Program increment planning |
| Choosing a model | Fixed, well-understood scope suits waterfall; changing needs suit Agile | Regulated audit work vs a new product |

### Testing and quality

| Term | Definition | Example |
| --- | --- | --- |
| Unit testing | Test one function or class in isolation | Jest test for a pricing function |
| Integration testing | Test that components work together | API with a real test database |
| System testing | Test the complete, integrated system | Full order flow in staging |
| User acceptance testing (UAT) | Business users confirm the system meets their needs | Finance team approves the report |
| Smoke test | A quick check that the main functions work | Open the app and log in |
| Sanity test | A narrow check after a small change | Verify the fixed bug only |
| Regression test | Re-run tests to confirm old features still work | Full suite on each pull request |
| Exploratory testing | Unscripted testing guided by the tester's judgment | Try odd inputs |
| Performance, load, stress and soak testing | Speed / expected load / beyond limits / long duration | k6 or JMeter run |
| Security and penetration testing | Look for vulnerabilities, including attack simulation | OWASP ZAP scan |
| Alpha and beta testing | Internal trial / limited external trial | Beta users |
| Test pyramid | Many unit tests, fewer integration tests, fewest end-to-end tests | 70, 20, 10 split |
| Test coverage | The share of code run by tests | 80% line coverage |
| TDD and BDD | Test-driven development: write the test first / behaviour-driven: describe behaviour in plain language | Given, When, Then scenarios |
| Defect life cycle | The states of a bug: new, assigned, fixed, retested, closed | Reopened if the fix fails |
| Severity vs priority | How bad the defect is / how soon it should be fixed | Typo on the home page: low severity, high priority |
| Code review | Peers inspect changes before merge | Pull request with two approvals |
| Quality gate | A check that must pass before moving on | Coverage and no critical bugs |
| Entry and exit criteria | Conditions to start / to finish a phase | Exit: no open critical defects |

### Release, change and governance

| Term | Definition | Example |
| --- | --- | --- |
| Environments | dev, QA or test, staging or UAT, pre-production, production | Same build promoted through each |
| Release candidate | A build that could ship if testing finds no problem | `v2.4.0-rc1` |
| Code freeze | A period when only critical fixes are merged | Two days before release |
| Go/no-go decision | Final review of readiness to release | Release meeting checklist |
| Cutover and go-live | The switch to the new system | Weekend migration |
| Rollback plan | The steps to return to the last good version | Redeploy the previous image |
| Semantic versioning | MAJOR.MINOR.PATCH numbering | 2.4.1 |
| Hotfix and patch | An urgent production fix / a small fix release | Fix a payment bug the same day |
| Long-term support (LTS) | A version supported for an extended time | Node.js LTS |
| Change management and CAB | Control changes to production; the Change Advisory Board reviews them | Approval before a bank release |
| Configuration management | Track and control versions of code, config and infrastructure | Git, IaC |
| Baseline | An approved version used as a reference point | Signed-off requirements |
| Scope creep | Uncontrolled growth of scope | New features added mid-sprint |
| Minimum viable product (MVP) | The smallest release that delivers value and learning | Core payment flow only |
| Work breakdown structure (WBS) | Split the project into smaller deliverables | Epics, stories, tasks |
| Gantt chart and critical path | A timeline of tasks / the longest chain of dependent tasks | Delay on the path delays the project |
| Risk register | A list of risks with likelihood, impact and mitigation | Vendor delay: medium, high |
| RACI | Responsible, Accountable, Consulted, Informed | Who approves the release |
| Stakeholder | Anyone affected by or interested in the project | Product, security, operations |
| SLA, SLO and SLI | Contract / internal target / measured indicator | 99.9% uptime |
| Post-implementation review | A review after release of what worked and what did not | Retrospective and postmortem |
| Technical debt and refactoring | Shortcuts that cost more later / improve structure without changing behaviour | Schedule debt work each sprint |
| Documentation | README, API docs, runbooks, ADRs | Runbook for incidents |

### Security in the SDLC

| Term | Definition | Example |
| --- | --- | --- |
| Secure SDLC and DevSecOps | Build security into every phase | Security checks in the pipeline |
| Shift-left | Find problems earlier in the cycle | Lint and scan on commit |
| Threat modeling | Identify threats and mitigations at design time | STRIDE analysis |
| STRIDE | Spoofing, tampering, repudiation, information disclosure, denial of service, elevation of privilege | Threat categories |
| SAST, DAST and SCA | Scan source code / scan the running app / scan dependencies | SonarQube, ZAP, `npm audit` |
| Secure code review | Review code for security defects | Check input validation |
| OWASP Top 10 | A list of the most critical web application risks | Injection, broken access control |
| Secrets management | Keep credentials out of code | Vault, Secrets Manager |
| Software bill of materials (SBOM) | An inventory of the components in a build | CycloneDX file |


<a id="glossary-agile"></a>

## Agile

| Term | Definition | Example |
| --- | --- | --- |
| Agile | Iterative delivery with fast feedback and adaptation | Release small increments often |
| Agile Manifesto | Values: individuals, working software, collaboration, responding to change | Working software over heavy documentation |
| Scrum | Framework with fixed-length sprints and defined roles | 2-week sprints |
| Kanban | Flow-based method with visual board and WIP limits | To Do, In Progress, Done |
| Sprint | Time-boxed iteration, usually 1-4 weeks | 2 weeks |
| Product Owner | Owns the backlog and priorities | Decides what ships first |
| Scrum Master | Coaches the team and removes blockers | Facilitates ceremonies |
| Development team | Cross-functional people who build the product | Engineers, QA, design |
| Product backlog | Ordered list of everything wanted | Features, bugs, tech debt |
| Sprint backlog | Items chosen for the current sprint | 12 stories |
| User story | Need written from the user's view | "As a customer, I want to freeze my card, so that I stay safe" |
| Acceptance criteria | Conditions that make a story done | Card shows frozen within 2 seconds |
| Epic | Large body of work split into stories | "Card management" |
| Definition of Ready / Done | Checklist to start work / to call it finished | Tests passed and code reviewed |
| Story points | Relative estimate of effort | 1, 2, 3, 5, 8 |
| Planning poker | Team estimates together with cards | Reveal estimates at once |
| Velocity | Story points completed per sprint | Average of 30 points |
| Sprint planning | Choose sprint scope and plan the work | Day 1 of sprint |
| Daily stand-up | Short daily sync: progress, plans, blockers | 15 minutes |
| Backlog refinement / grooming | Clarify and estimate upcoming items | Split a large story |
| Sprint review / demo | Show finished work to stakeholders | End of sprint |
| Retrospective | Team reflects on how to improve | Start, stop, continue |
| Burndown chart | Remaining work over time | Sprint progress |
| Cumulative flow diagram | Work in each stage over time | Spot bottlenecks |
| WIP limit | Cap on work in progress | Max 3 items in review |
| Cycle time / lead time | Start to done / request to done | 4 days average |
| MVP | Smallest version that delivers value and learning | Core payment flow only |
| Increment | Usable output of a sprint | Deployable build |
| Technical debt | Shortcuts that make future change costlier | Refactor legacy module |
| Spike | Time-boxed research task | 2 days to test a library |
| Timeboxing | Fixed time for an activity | 15-minute stand-up |
| Scaled Agile (SAFe) | Framework for many teams | Program increment planning |
| RAG status | Red / Amber / Green health report | Weekly delivery status |
| Stakeholder management | Keep interested parties informed and aligned | Share risks early |
| Risk / dependency / blocker | Possible problem / reliance on another team / thing stopping work | Escalate a blocker in stand-up |
| Scrum vs Kanban | Fixed sprints with roles vs continuous flow | Support team uses Kanban |
| Waterfall | Sequential phases, no overlap | Requirements, design, build, test, release |


<a id="glossary-testing-strategies-and-the-test-pyramid"></a>

## Testing strategies and the test pyramid

### Strategy and planning

| Term | Definition | Example |
| --- | --- | --- |
| Test strategy | The high-level approach to testing for a product or organisation: levels, tools, environments and responsibilities | Unit tests in CI, E2E smoke tests before release |
| Test plan | A detailed plan for one release or project: scope, schedule, resources and risks | Release 2.4 test plan |
| Test scope | What will and will not be tested | Payments in scope; marketing pages out |
| Risk-based testing | Spend most effort on the areas with the highest risk and impact | Test money transfers more than profile photos |
| Shift-left testing | Test earlier in the life cycle, such as at requirements and design | Review acceptance criteria before coding |
| Shift-right testing | Test and observe in production | Canary releases, synthetic monitoring |
| Test levels | Unit, integration, system and acceptance | Each level has its own owner and tools |
| Entry and exit criteria | Conditions to start and to finish a test phase | Exit: no open critical defects |
| Test environment | A setup where tests run, close to production | Staging with masked data |
| Test data management | Create, mask and reset data used by tests | Seeded accounts, anonymised copies |
| Requirements traceability | Link requirements to the tests that cover them | Requirement R12 to test T45 |
| Automation strategy | Decide what to automate: stable, repetitive, high-value checks | Automate regression, explore new features by hand |
| Test automation ROI | Whether the time saved outweighs the cost of writing and maintaining tests | A suite that runs hundreds of times pays back |
| Defect leakage (escape rate) | Defects found in production that testing should have caught | 3 production bugs from 100 total |
| Defect density | Defects per size of code | 0.5 defects per 1,000 lines |
| Flakiness rate | The share of test runs that fail with no code change | 2% of runs |
| Quality gate | A check that must pass before code moves on | Coverage threshold and no critical bugs |

### Test pyramid and related shapes

| Term | Definition | Example |
| --- | --- | --- |
| Test pyramid | Many fast unit tests at the base, fewer integration tests in the middle, the fewest end-to-end tests on top | About 70% unit, 20% integration, 10% E2E |
| Why the pyramid | Lower layers are faster, cheaper, more stable and point to the cause of a failure | A unit test runs in milliseconds |
| Unit layer | Test one function or class in isolation | Jest test of a pricing function |
| Service or integration layer | Test components together, such as an API with a database | Supertest against Express with a test database |
| UI or end-to-end layer | Test whole user journeys through the real UI | Playwright checkout flow |
| Ice-cream cone anti-pattern | Many slow manual and E2E tests with few unit tests | Hours-long regression runs |
| Testing trophy | A shape that stresses static checks and integration tests over unit tests | Linting, TypeScript, then integration tests |
| Testing honeycomb | A shape for microservices that favours integration tests of each service | Few unit tests, many service-level tests |
| Testing diamond | A shape with most tests at the integration level | API-level tests dominate |
| Agile testing quadrants | Four groups of tests: technology or business facing, supporting the team or critiquing the product | Unit tests; acceptance tests; exploratory; performance |
| Static testing | Find problems without running code | ESLint, TypeScript, code review |
| Contract testing | Check that a service and its consumers agree on the API | Pact consumer-driven contracts |
| Smoke suite | A small set of critical checks run after every deployment | Login, search, checkout |

### Writing good tests

| Term | Definition | Example |
| --- | --- | --- |
| Arrange, Act, Assert (AAA) | Set up, run the behaviour, check the result | Create cart, add item, expect total |
| Given, When, Then | Behaviour-style structure for scenarios | Given a frozen card, when a payment is made, then it is declined |
| FIRST | Fast, Independent, Repeatable, Self-validating, Timely | Good unit test properties |
| Test isolation | Each test runs alone and leaves no state behind | Reset the database between tests |
| Determinism | The same input always gives the same result | Fake the clock and random numbers |
| One reason to fail | A test checks one behaviour | Separate tests for each rule |
| Test behaviour, not implementation | Assert on outcomes, not internal calls | Check the response, not private methods |
| Test doubles | Stand-ins for real dependencies: dummy, stub, spy, mock, fake | `jest.fn()` returning a fixed value |
| Stub vs mock | A stub returns canned answers; a mock also verifies how it was called | `expect(send).toHaveBeenCalledWith(...)` |
| Fake | A working but simple implementation | In-memory repository |
| Do not mock what you do not own | Wrap third-party libraries and mock your wrapper | Mock `PaymentGateway`, not the vendor SDK |
| Test fixture | Fixed data or state a test needs | A seeded user record |
| Test data builder or factory | A helper that creates valid test objects | `buildUser({ role: 'admin' })` |
| Page Object Model | A class that wraps a page's locators and actions | `LoginPage.login(user, pass)` |
| Test selectors | Stable attributes for finding elements | `data-testid="submit"` |
| Flaky test | A test that sometimes passes and sometimes fails with no code change | Depends on timing or shared data |
| Common causes of flakiness | Timing, shared state, order dependence, network, time zones, randomness | Test A leaves data that breaks test B |
| Quarantine | Move a flaky test out of the gate while it is fixed | Tag and track it |
| Retries | Re-run failed tests; they hide flakiness if overused | Retry twice in CI, report the flakes |
| Snapshot testing | Compare output to a stored copy | `toMatchSnapshot()` |
| Golden master | Compare against a saved known-good output | Legacy report output |
| Property-based testing | Check rules over many generated inputs | fast-check |
| Mutation testing | Change the code on purpose to see if tests catch it | Stryker |
| Code coverage | The share of code run by tests: statement, branch, function, line | 80% branch coverage |
| Coverage is not quality | High coverage can still miss behaviour | Tests without assertions |
| Test-driven development (TDD) | Write a failing test, make it pass, then refactor | Red, green, refactor |
| BDD and ATDD | Behaviour-driven and acceptance-test-driven development: tests written from shared examples | Cucumber, Gherkin |
| Service virtualisation | Simulate an external service | WireMock, MSW |
| Testcontainers | Start real dependencies in containers for tests | A throwaway Postgres container |
| Ephemeral environment | A short-lived environment created per pull request | Preview deployment |
| Fail fast in CI | Run quick tests first and stop on failure | Lint and unit tests before E2E |
| Parallelisation and sharding | Run tests at the same time across workers or machines | `--shard=1/4` |
| Test reporting | Machine-readable results for CI | JUnit XML, HTML report, Allure |


<a id="glossary-types-of-testing"></a>

## Types of testing

### By approach

| Term | Definition | Example |
| --- | --- | --- |
| Black-box testing | Test behaviour from the outside, with no knowledge of the code | Check the API response for a given request |
| White-box testing | Test with knowledge of the code and its paths | Cover every branch of a function |
| Grey-box testing | Partial knowledge of the internals | Test an API while checking the database state |
| Manual testing | A person runs the checks | Exploratory session on a new feature |
| Automated testing | Scripts run the checks | Playwright suite in CI |
| Static testing | Check without running the code | Linting, type checks, code review |
| Dynamic testing | Check by running the code | Unit and integration tests |
| Positive and negative testing | Valid input should work; invalid input should fail safely | Wrong PIN is rejected |
| Functional vs non-functional | What the system does / how well it does it | Transfer works / transfer is fast |

### Functional testing

| Term | Definition | Example |
| --- | --- | --- |
| Unit testing | Test one function or class in isolation | `calculateFee()` returns the right value |
| Component testing | Test one module or UI component with its direct parts | A React form with its validation |
| Integration testing | Test that parts work together | Service with a real test database |
| API testing | Test endpoints for status, body, errors and contracts | Supertest, Postman, Playwright `request` |
| Contract testing | Check that a provider and its consumers agree on the interface | Pact |
| System testing | Test the complete integrated system against requirements | Full order flow in staging |
| End-to-end (E2E) testing | Test a whole user journey through the real UI and backend | Sign up, add to cart, pay |
| Smoke testing | Quick check that the main functions work | Open the app and log in |
| Sanity testing | Narrow check after a small change or fix | Verify only the fixed bug |
| Regression testing | Re-run tests to confirm old features still work | Full suite on every pull request |
| Acceptance testing | Confirm the system meets business needs | UAT sign-off |
| User acceptance testing (UAT) | Business users test the system | Finance checks the report |
| Operational acceptance testing (OAT) | Check it can be run and supported: backups, monitoring, recovery | Failover drill |
| Alpha and beta testing | Internal trial / limited external trial | Beta group of customers |
| Exploratory testing | Unscripted testing guided by the tester's judgement | A session with a written charter |
| Ad hoc and monkey testing | Informal or random input testing | Random clicks and inputs |
| Database testing | Check schema, data integrity, queries and migrations | Migration keeps all rows |
| Localisation and internationalisation testing | Check language, formats and currency handling | Arabic right-to-left layout, AED format |
| Installation and upgrade testing | Check install, upgrade and uninstall paths | Upgrade from the previous version |

### Non-functional testing

| Term | Definition | Example |
| --- | --- | --- |
| Performance testing | Measure speed and stability under load | p95 under 300 ms at expected traffic |
| Load testing | Run at expected peak load | 5,000 users for 30 minutes |
| Stress testing | Push beyond limits to find the breaking point and how it fails | Double the peak load |
| Spike testing | Apply a sudden jump in load | Traffic rises tenfold in a minute |
| Soak (endurance) testing | Run for a long time to find leaks | 24 hours at normal load |
| Volume testing | Test with a very large amount of data | 100 million rows |
| Scalability testing | Check how performance changes as resources are added | More pods, higher throughput |
| Security testing | Look for vulnerabilities | OWASP ZAP scan |
| Penetration testing | Authorised simulated attack | External security team test |
| Vulnerability scanning | Automated check for known weaknesses | Dependency scan with `npm audit` |
| Fuzz testing | Send random or malformed input to find crashes | Fuzz an API parser |
| Usability testing | Check ease of use with real users | Watch users complete a task |
| Accessibility testing | Check use by people with disabilities against WCAG | Screen reader and keyboard only |
| Compatibility testing | Check across browsers, devices and operating systems | Chrome, Safari, Android, iOS |
| Reliability and recovery testing | Check it keeps working and recovers from failure | Kill a node and watch recovery |
| Failover and disaster recovery testing | Prove the backup site and data restore work | Region failover drill |
| Chaos testing | Inject failures on purpose | Terminate instances in staging |
| Compliance testing | Check against regulations and standards | PCI-DSS controls |
| Maintainability testing | Check how easy the code is to change | Static analysis and complexity scores |

### Test design techniques

| Term | Definition | Example |
| --- | --- | --- |
| Equivalence partitioning | Group inputs that behave the same and test one from each group | Ages 0-17, 18-64, 65 and over |
| Boundary value analysis | Test at the edges of each group | 17, 18, 64, 65 |
| Decision table testing | List combinations of conditions and the expected outcome | Loan approval rules |
| State transition testing | Test each state and each allowed or disallowed change | Order: created, paid, shipped |
| Pairwise (all-pairs) testing | Cover every pair of input values with fewer test cases | Browser and OS combinations |
| Use-case testing | Derive tests from user scenarios | Customer freezes a card |
| Error guessing | Use experience to guess likely faults | Empty string, very long input |
| Cause-effect analysis | Map causes to effects to design tests | Rule combinations |
| Test charter | A short mission for an exploratory session | Explore refund flows for 60 minutes |

### Modern and specialised testing

| Term | Definition | Example |
| --- | --- | --- |
| Visual regression testing | Compare screenshots to find unintended UI changes | Playwright `toHaveScreenshot()` |
| Snapshot testing | Compare output to a stored copy | Jest snapshot of a component |
| Property-based testing | Check rules over many generated inputs | fast-check |
| Mutation testing | Change code to see if tests fail | Stryker |
| A/B testing | Compare two versions with real users | 50% see the new checkout |
| Canary testing | Release to a small share of users and watch | 5% of traffic |
| Testing in production | Safe checks on live systems | Feature flags, synthetic monitoring |
| Synthetic monitoring | Scripted checks that run against production on a schedule | A login check every 5 minutes |
| Shadow (traffic mirroring) testing | Send copies of live traffic to the new version without affecting users | Compare responses offline |
| Load testing in CI | Run short performance checks per build | k6 smoke load test |
| LLM evaluation (evals) | Score model outputs on a fixed test set | Golden question set for the chatbot |
| AI regression evals | Re-run evals after a prompt or model change | Accuracy and cost per query |
| Red teaming | Adversarial testing to find unsafe behaviour | Try prompt injection |
| Guardrail testing | Check input and output filters block what they should | PII not leaked in answers |
| Hallucination testing | Check that answers are supported by sources | Answers cite retrieved documents |


<a id="glossary-jest"></a>

## Jest

### Structure and running

| Term | Definition | Example |
| --- | --- | --- |
| Jest | A JavaScript test runner with built-in assertions, mocking and coverage | `npx jest` |
| `describe` | Groups related tests into a suite | `describe('Cart', () => { ... })` |
| `test` / `it` | Defines one test case | `it('adds an item', () => { ... })` |
| `test.each` | Runs one test over a table of inputs | `test.each([[1,2,3],[2,3,5]])('%i+%i=%i', (a,b,c) => expect(a+b).toBe(c))` |
| `test.skip` / `test.only` | Skip a test / run only that test | `it.only('focus', ...)` |
| `test.todo` | Placeholder for a test to write later | `test.todo('handles refunds')` |
| Hooks | `beforeAll`, `afterAll`, `beforeEach`, `afterEach` set up and clean up | `beforeEach(() => db.reset())` |
| `jest.config.js` | Configuration file | `testEnvironment: 'node'` |
| `testEnvironment` | The simulated environment: `node` or `jsdom` | `jsdom` for React component tests |
| `transform` | How files are compiled before running | `ts-jest` or `babel-jest` for TypeScript |
| `moduleNameMapper` | Maps import paths or assets | Map `@/` to `src/` |
| `setupFilesAfterEach` / `setupFilesAfterEnv` | Files run before each test file | Import `@testing-library/jest-dom` |
| Watch mode | Re-runs tests related to changed files | `jest --watch` |
| Parallel workers | Test files run in separate workers | `--runInBand` to run one by one |
| Projects | Run several configs in one repo | Monorepo with frontend and backend |

### Matchers

| Term | Definition | Example |
| --- | --- | --- |
| `expect` | Starts an assertion | `expect(total).toBe(10)` |
| `toBe` | Strict equality (`Object.is`) for primitives | `expect(2+2).toBe(4)` |
| `toEqual` | Deep equality, ignores `undefined` properties | `expect(obj).toEqual({a:1})` |
| `toStrictEqual` | Deep equality that also checks `undefined` and types | Stricter than `toEqual` |
| `toBeTruthy` / `toBeFalsy` | Truthiness checks | `expect(user).toBeTruthy()` |
| `toBeNull`, `toBeUndefined`, `toBeDefined` | Null and undefined checks | `expect(x).toBeNull()` |
| `toContain` / `toContainEqual` | Item in an array or substring | `expect(list).toContain('a')` |
| `toHaveLength` | Array or string length | `expect(arr).toHaveLength(3)` |
| `toMatch` | Matches a regex or string | `expect(msg).toMatch(/error/i)` |
| `toHaveProperty` | Checks a property exists, optionally its value | `expect(o).toHaveProperty('id', 1)` |
| `toMatchObject` | Object contains a subset | `expect(res).toMatchObject({status: 200})` |
| `toBeCloseTo` | Floating point comparison | `expect(0.1+0.2).toBeCloseTo(0.3)` |
| `toBeGreaterThan` / `toBeLessThan` | Number comparison | `expect(n).toBeGreaterThan(0)` |
| `toThrow` | Expects a function to throw | `expect(() => fn()).toThrow('bad')` |
| `.not` | Negates a matcher | `expect(a).not.toBe(b)` |
| `expect.any` / `expect.objectContaining` | Asymmetric matchers for partial checks | `expect.any(Number)` |
| `expect.assertions(n)` | Ensures n assertions ran, useful for async | `expect.assertions(1)` |

### Mocks, spies and timers

| Term | Definition | Example |
| --- | --- | --- |
| Mock function | A fake function that records calls | `const fn = jest.fn()` |
| `mockReturnValue` | Fixed return value | `fn.mockReturnValue(5)` |
| `mockResolvedValue` / `mockRejectedValue` | Fixed promise result | `api.mockResolvedValue({id:1})` |
| `mockImplementation` | Custom fake behaviour | `fn.mockImplementation(x => x*2)` |
| `toHaveBeenCalled` / `toHaveBeenCalledWith` / `toHaveBeenCalledTimes` | Check how a mock was called | `expect(fn).toHaveBeenCalledWith(1)` |
| `mock.calls` | Array of arguments for each call | `fn.mock.calls[0][0]` |
| `jest.mock('module')` | Replaces a whole module with a mock | `jest.mock('./mailer')` |
| Manual mock | A file in `__mocks__` that replaces a module | `__mocks__/axios.js` |
| `jest.spyOn` | Watches (and optionally replaces) a method | `jest.spyOn(console, 'error').mockImplementation()` |
| `jest.requireActual` | Loads the real module inside a partial mock | Keep real helpers, mock one function |
| `clearAllMocks` / `resetAllMocks` / `restoreAllMocks` | Clear call data / reset behaviour / restore originals | `afterEach(() => jest.restoreAllMocks())` |
| Fake timers | Control `setTimeout` and `setInterval` | `jest.useFakeTimers()` |
| `advanceTimersByTime` / `runAllTimers` | Move fake time forward | `jest.advanceTimersByTime(1000)` |
| Fake system time | Set the current date | `jest.setSystemTime(new Date('2026-01-01'))` |
| ESM mocking | Use `jest.unstable_mockModule` for native ES modules | Needed when not using Babel |

### Async, snapshots and coverage

| Term | Definition | Example |
| --- | --- | --- |
| Async test | Return a promise or use `async` | `it('loads', async () => { await expect(load()).resolves.toBe(1) })` |
| `resolves` / `rejects` | Assert on promise outcomes | `await expect(p).rejects.toThrow()` |
| Callback test (`done`) | Old style for callbacks | `it('x', done => { cb(() => done()) })` |
| Snapshot | Stored copy of output compared on later runs | `expect(tree).toMatchSnapshot()` |
| Inline snapshot | Snapshot written in the test file | `toMatchInlineSnapshot()` |
| Update snapshots | Accept new output | `jest -u` |
| Coverage | Report of code executed by tests | `jest --coverage` |
| Coverage metrics | Statements, branches, functions, lines | Branch coverage shows untested `if` paths |
| `coverageThreshold` | Fail the run below a limit | `{ global: { branches: 80 } }` |
| Istanbul / V8 | The two coverage providers | `coverageProvider: 'v8'` |
| Reporters | Format of the output | `--reporters=default --reporters=junit` |
| Testing Library | Query the DOM like a user would | `screen.getByRole('button')` |
| Supertest | HTTP assertions against an Express app | `request(app).get('/health').expect(200)` |
| Open handle | Leftover timer or connection that stops Jest exiting | Close the DB in `afterAll` |


<a id="glossary-mocha-chai-and-sinon"></a>

## Mocha, Chai and Sinon

### Mocha

| Term | Definition | Example |
| --- | --- | --- |
| Mocha | A flexible Node.js test runner; you choose your own assertion and mocking libraries | `npx mocha` |
| `describe` / `context` | Group tests; `context` is an alias for readability | `describe('Auth', () => {})` |
| `it` | One test case | `it('rejects a bad token', () => {})` |
| Hooks | `before`, `after`, `beforeEach`, `afterEach` | `beforeEach(() => seed())` |
| Root hook plugin | Hooks shared across all files | `mochaHooks` export in a setup file |
| `.mocharc` | Config file (`.mocharc.json`, `.js`, `.yml`) | `{ "spec": "test/**/*.spec.js" }` |
| `--require` | Load a file before tests | `--require ts-node/register` |
| `--watch` | Re-run on file changes | `mocha --watch` |
| `--grep` | Run tests matching a pattern | `mocha --grep "login"` |
| `.only` / `.skip` | Run only / skip a test or suite | `it.skip('later')` |
| Pending test | `it` with no callback, shown as pending | `it('todo')` |
| `this.timeout()` | Set the time limit for a test | `this.timeout(5000)` (needs `function`, not arrow) |
| Async support | Return a promise, use `async`, or call `done` | `it('x', async () => { await run() })` |
| `--parallel` | Run test files in parallel workers | `mocha --parallel` |
| `--retries` | Retry failed tests | `this.retries(2)` |
| Reporters | Output format | `spec`, `dot`, `json`, `mochawesome` |
| `nyc` / `c8` | Coverage tools used with Mocha | `c8 mocha` |
| Dynamic tests | Generate tests in a loop | `cases.forEach(c => it(c.name, ...))` |

### Chai

| Term | Definition | Example |
| --- | --- | --- |
| Chai | An assertion library with three styles | `import { expect } from 'chai'` |
| `assert` style | Classic, function-based | `assert.equal(a, b)` |
| `expect` style | Chainable, reads like a sentence | `expect(a).to.equal(b)` |
| `should` style | Extends `Object.prototype` | `a.should.equal(b)` |
| Language chains | Words that only improve readability: `to`, `be`, `is`, `have`, `that`, `and` | `expect(x).to.be.a('string')` |
| `equal` | Strict equality (`===`) | `expect(1).to.equal(1)` |
| `eql` / `deep.equal` | Deep equality | `expect({a:1}).to.eql({a:1})` |
| `a` / `an` | Type check | `expect([]).to.be.an('array')` |
| `include` | Array, string or object contains | `expect([1,2]).to.include(2)` |
| `property` | Has a property | `expect(o).to.have.property('id')` |
| `lengthOf` | Length check | `expect(arr).to.have.lengthOf(3)` |
| `throw` | Function throws | `expect(fn).to.throw(Error, 'bad')` |
| `closeTo` | Number within a delta | `expect(0.3).to.be.closeTo(0.1+0.2, 0.001)` |
| `.not` | Negation | `expect(a).to.not.equal(b)` |
| `.true`, `.false`, `.null`, `.undefined`, `.ok`, `.empty` | Terminal property assertions | `expect(list).to.be.empty` |
| Plugins | Extend Chai | `chai-as-promised`, `chai-http`, `sinon-chai` |
| `chai-as-promised` | Assertions on promises | `await expect(p).to.be.rejectedWith('x')` |
| `chai-http` | Make HTTP requests to an app in tests | `chai.request(app).get('/')` |

### Sinon

| Term | Definition | Example |
| --- | --- | --- |
| Sinon | A library for spies, stubs, mocks and fake timers | `import sinon from 'sinon'` |
| Spy | Wraps a function and records calls without changing it | `const spy = sinon.spy(obj, 'save')` |
| Stub | A spy with replaced behaviour | `sinon.stub(db, 'find').resolves([])` |
| Mock | A stub with built-in expectations | `sinon.mock(api).expects('get').once()` |
| Fake | A simple working replacement | `sinon.fake.returns(1)` |
| `returns` / `resolves` / `rejects` / `throws` | Define what a stub does | `stub.rejects(new Error('x'))` |
| `onCall(n)` / `withArgs` | Different behaviour per call or argument | `stub.withArgs(1).returns('a')` |
| `calledOnce`, `calledWith`, `callCount` | Inspect calls | `sinon.assert.calledWith(spy, 1)` |
| Sandbox | Groups fakes so they can be restored together | `const sb = sinon.createSandbox()` |
| `restore()` | Puts the original function back | `afterEach(() => sb.restore())` |
| Fake timers | Control time | `const clock = sinon.useFakeTimers()` then `clock.tick(1000)` |
| Fake server | Fake XHR or fetch responses | `nock` or `msw` are common alternatives |
| Proxyquire / rewire | Replace dependencies when requiring a module | Inject a stubbed `fs` |
| Mocha + Chai + Sinon | A typical stack: runner, assertions, test doubles | `mocha` + `chai` + `sinon-chai` |


<a id="glossary-playwright"></a>

## Playwright

### Core concepts

| Term | Definition | Example |
| --- | --- | --- |
| Playwright | A browser automation and E2E testing framework for Chromium, Firefox and WebKit | `npm init playwright@latest` |
| Playwright Test | The built-in test runner | `npx playwright test` |
| Browser | The engine instance | `chromium`, `firefox`, `webkit` |
| Browser context | An isolated, incognito-like profile inside a browser; cheap to create | One context per test |
| Page | A single tab | `const page = await context.newPage()` |
| Frame | An iframe inside a page | `page.frameLocator('#pay')` |
| Fixture | Setup that is injected into tests and cleaned up automatically | `test('x', async ({ page, request }) => {})` |
| Custom fixture | Your own reusable setup via `test.extend` | A `loggedInPage` fixture |
| Project | A config entry that runs tests under one setup | Desktop Chrome, Mobile Safari |
| `playwright.config.ts` | Main config: projects, retries, reporter, `webServer` | `retries: 2` |
| `webServer` | Starts the app before tests | `command: 'npm run dev'` |
| Worker | A process that runs test files in parallel | `workers: 4` |
| Headless / headed | Without / with a visible browser window | `--headed` |
| Device emulation | Viewport, user agent and touch of a device | `devices['iPhone 13']` |

### Locators and actions

| Term | Definition | Example |
| --- | --- | --- |
| Locator | A lazy, re-resolving way to find elements | `page.locator('.row')` |
| `getByRole` | Finds by ARIA role and name; the preferred choice | `page.getByRole('button', { name: 'Pay' })` |
| `getByLabel`, `getByPlaceholder`, `getByText`, `getByAltText`, `getByTitle` | User-facing locators | `page.getByLabel('Email')` |
| `getByTestId` | Finds by test id attribute | `page.getByTestId('submit')` |
| Chaining and filtering | Narrow down a locator | `rows.filter({ hasText: 'Paid' })` |
| Strictness | A locator that matches many elements errors on actions | Use `.first()` or `.nth(1)` deliberately |
| `click`, `fill`, `type`, `press`, `check`, `selectOption`, `hover` | User actions | `await page.getByLabel('Name').fill('Sam')` |
| `setInputFiles` | Upload a file | `input.setInputFiles('a.pdf')` |
| `dragTo` | Drag and drop | `src.dragTo(target)` |
| `goto` | Navigate | `await page.goto('/login')` |
| `waitForURL`, `waitForResponse`, `waitForLoadState` | Wait for specific events | `await page.waitForURL('**/home')` |
| `evaluate` | Run JavaScript in the page | `page.evaluate(() => document.title)` |

### Assertions and auto-waiting

| Term | Definition | Example |
| --- | --- | --- |
| Auto-waiting | Actions wait for the element to be attached, visible, stable, enabled and not covered | No manual sleeps needed |
| Web-first assertion | Assertion that retries until it passes or times out | `await expect(locator).toBeVisible()` |
| `toHaveText`, `toContainText`, `toHaveValue`, `toHaveCount`, `toBeEnabled`, `toBeChecked`, `toHaveURL`, `toHaveTitle`, `toHaveAttribute` | Common matchers | `await expect(page).toHaveURL(/home/)` |
| Soft assertion | Does not stop the test on failure | `expect.soft(x).toBe(1)` |
| `expect.poll` | Retry a non-locator value | `await expect.poll(() => getCount()).toBe(3)` |
| Timeouts | Test, action, and expect each have their own limits | `expect: { timeout: 5000 }` |
| Flaky test | Passes and fails without code change | Fixed by removing fixed waits and shared state |
| Retries | Re-run failed tests | `retries: 2` in CI |

### Network, auth and state

| Term | Definition | Example |
| --- | --- | --- |
| Network interception | Observe or change requests | `page.route('**/api/**', route => ...)` |
| `route.fulfill` | Return a fake response | `route.fulfill({ json: { ok: true } })` |
| `route.abort` / `route.continue` | Block / pass through a request | Simulate offline |
| HAR replay | Record and replay traffic | `page.routeFromHAR('a.har')` |
| `request` fixture | API testing with the HTTP client | `await request.post('/api/users', { data })` |
| Storage state | Saved cookies and local storage | `storageState: 'auth.json'` |
| Setup project | A project that logs in once and shares state | Dependencies in config |
| Global setup | Code run once before all tests | Seed data |
| Cookies and permissions | Set per context | `context.grantPermissions(['geolocation'])` |
| Geolocation, locale, timezone | Emulated per context | `locale: 'ar-AE'` |
| Clock API | Control time in the page | `page.clock.install()` |

### Debugging, reporting and CI

| Term | Definition | Example |
| --- | --- | --- |
| Trace Viewer | Time-travel view of actions, DOM, network and console | `trace: 'on-first-retry'` |
| Codegen | Records actions and writes test code | `npx playwright codegen url` |
| UI Mode | Interactive runner with watch and timeline | `npx playwright test --ui` |
| Inspector / debug | Step through a test | `--debug` or `page.pause()` |
| Screenshot and video | Capture on failure | `screenshot: 'only-on-failure'` |
| Visual comparison | Compare screenshots with a baseline | `await expect(page).toHaveScreenshot()` |
| Accessibility checks | Combine with axe | `@axe-core/playwright` |
| Reporters | HTML, list, JUnit, JSON, blob | `reporter: 'html'` |
| Sharding | Split the suite across CI machines | `--shard=1/4` |
| Tags and grep | Select tests by tag | `test('x @smoke', ...)` and `--grep @smoke` |
| Page Object Model | A class that wraps a page's locators and actions | `class LoginPage { ... }` |
| Component testing | Mount a component in a real browser (experimental) | `@playwright/experimental-ct-react` |
| MCP and test agents | Let an AI agent drive the browser or help write tests | Playwright MCP server |


<a id="glossary-cypress"></a>

## Cypress

### Core concepts

| Term | Definition | Example |
| --- | --- | --- |
| Cypress | A JavaScript E2E and component testing tool that runs inside the browser alongside the app | `npx cypress open` |
| Test Runner (open mode) | Interactive app with time-travel and live reload | `cypress open` |
| Headless run | Command-line run for CI | `cypress run` |
| `cypress.config.js` | Main config: `baseUrl`, viewport, retries, `e2e` and `component` blocks | `baseUrl: 'http://localhost:3000'` |
| Spec file | A test file | `cypress/e2e/login.cy.js` |
| Mocha and Chai inside | Cypress uses Mocha for structure and Chai for assertions | `describe`, `it`, `expect` |
| Support file | Code run before every spec | `cypress/support/e2e.js` |
| Fixture | Static test data file | `cy.fixture('user.json')` |
| Browser support | Chrome family, Firefox, Edge, and WebKit (experimental) | `--browser firefox` |
| Same-origin rule | Historically limited to one origin per test; `cy.origin()` allows more | `cy.origin('https://sso.com', () => {})` |

### Commands and the command queue

| Term | Definition | Example |
| --- | --- | --- |
| Command | A `cy.` instruction | `cy.visit('/')` |
| Command queue | Commands are queued and run in order, not immediately | Code after `cy.get` runs before it executes |
| Chaining | Each command yields a subject to the next | `cy.get('input').type('a').should('have.value','a')` |
| `cy.visit` | Opens a URL | `cy.visit('/login')` |
| `cy.get` | Finds elements by selector | `cy.get('[data-cy=submit]')` |
| `cy.contains` | Finds by text | `cy.contains('Sign in')` |
| `find`, `within`, `children`, `parent`, `eq`, `first`, `last` | Traversal | `cy.get('form').within(() => ...)` |
| `click`, `type`, `clear`, `check`, `select`, `trigger` | Actions | `cy.get('#q').type('cards{enter}')` |
| `cy.wait` | Wait for time or an alias | `cy.wait('@getUser')` |
| `cy.url`, `cy.location`, `cy.title` | Page state | `cy.url().should('include','/home')` |
| `cy.request` | Makes an HTTP call without the browser | `cy.request('POST','/api/login',body)` |
| `cy.task` | Runs Node code from the config process | Seed the database |
| `cy.exec` | Runs a shell command | `cy.exec('npm run seed')` |
| `cy.then` | Gets the yielded value for custom logic | `cy.get('li').then($li => ...)` |
| `cy.wrap` | Wraps a value so it can be chained | `cy.wrap(user).its('name')` |
| `cy.session` | Caches and restores a login across tests | `cy.session('admin', loginFn)` |
| `Cypress.Commands.add` | Defines a custom command | `Cypress.Commands.add('login', ...)` |
| `Cypress.env` / `Cypress.config` | Read environment values / config | `Cypress.env('API_URL')` |

### Assertions, retry-ability and waits

| Term | Definition | Example |
| --- | --- | --- |
| `should` | Implicit assertion that retries | `.should('be.visible')` |
| `and` | Alias of `should` for chaining | `.should('exist').and('have.class','on')` |
| `expect` | Explicit assertion, runs once | `expect(n).to.eq(3)` |
| Retry-ability | Queries and assertions retry until a timeout | Default 4 seconds |
| Default timeouts | `defaultCommandTimeout`, `requestTimeout`, `pageLoadTimeout` | Raise for slow pages |
| Actionability | Checks before acting: visible, not disabled, not covered, not animating | Cypress scrolls and waits |
| Test retries | Re-run failed tests | `retries: { runMode: 2 }` |
| Anti-patterns | Fixed `cy.wait(5000)`, chaining after actions, relying on test order | Use aliases and assertions instead |
| Selectors best practice | Use dedicated attributes | `data-cy` or `data-testid` |

### Network control, data and tooling

| Term | Definition | Example |
| --- | --- | --- |
| `cy.intercept` | Spy on or stub network requests | `cy.intercept('GET','/api/users', { fixture: 'users.json' })` |
| Alias (`as`) | Name an element or request for later | `.as('getUsers')` then `cy.wait('@getUsers')` |
| Stubbing vs spying | Replace a response / observe it | Stub for isolation, spy for real traffic |
| `cy.stub` / `cy.spy` / `cy.clock` / `cy.tick` | Sinon-based test doubles and time control | `cy.clock()` |
| Hooks | `before`, `beforeEach`, `after`, `afterEach` | Reset data in `beforeEach` |
| Test isolation | Cypress clears state between tests | Do not rely on earlier tests |
| Component testing | Mount a React, Vue or Angular component | `cy.mount(<Button />)` |
| Cypress Cloud | Hosted dashboard for recordings, parallelisation and flake analytics | `cypress run --record --parallel` |
| Screenshots and video | Captured on failure in run mode | `video: false` to save time |
| Plugins / `setupNodeEvents` | Hook into Node events | Tasks, preprocessors, reporters |
| Common plugins | Testing Library, axe, visual snapshots, code coverage | `@testing-library/cypress`, `cypress-axe` |
| Page Object Model and app actions | Wrap UI steps in a class / call app code directly | Prefer custom commands and app actions |
| Limitations | No multiple tabs or windows; one browser per run; JavaScript or TypeScript only | Use Playwright for multi-tab flows |


<a id="glossary-selenium"></a>

## Selenium

### Components and architecture

| Term | Definition | Example |
| --- | --- | --- |
| Selenium | An open-source suite for automating web browsers | Used since 2004 |
| Selenium WebDriver | The API that sends commands to a browser driver | `driver.get(url)` |
| W3C WebDriver protocol | Standard HTTP protocol between client and driver | Used by all major drivers |
| Browser driver | A program that controls one browser | ChromeDriver, GeckoDriver, EdgeDriver, SafariDriver |
| Selenium Manager | Downloads the right driver automatically | Built into recent versions |
| Language bindings | Clients for Java, Python, C#, JavaScript, Ruby | `selenium-webdriver` for Node |
| Selenium Grid | Runs tests on many machines and browsers in parallel | Hub and nodes, or fully distributed mode |
| Hub and node | Hub routes sessions; nodes run browsers | Remote WebDriver URL |
| Selenium IDE | Browser extension that records and replays tests | Quick prototypes |
| WebDriver BiDi | Newer two-way protocol with events and network access | Listen to console logs |
| Cloud grids | Hosted browsers and devices | BrowserStack, Sauce Labs, LambdaTest |
| Appium | WebDriver-based tool for mobile apps | iOS and Android automation |

### Locators, actions and waits

| Term | Definition | Example |
| --- | --- | --- |
| `By` locators | `id`, `name`, `className`, `tagName`, `linkText`, `partialLinkText`, `cssSelector`, `xpath` | `driver.findElement(By.css('#pay'))` |
| XPath | Query language for the DOM tree | `//button[text()='Pay']` |
| `findElement` / `findElements` | One element (throws if none) / a list | `await driver.findElements(By.css('li'))` |
| `WebElement` | A reference to an element | `el.click()`, `el.sendKeys('x')` |
| Actions API | Complex gestures: hover, drag, key chords | `driver.actions().move({origin: el}).perform()` |
| Window and tab handling | Switch between windows | `driver.switchTo().window(handle)` |
| Frames | Switch into an iframe | `driver.switchTo().frame(0)` |
| Alerts | Handle JavaScript dialogs | `driver.switchTo().alert().accept()` |
| Cookies | Read and set cookies | `driver.manage().addCookie(c)` |
| `executeScript` | Run JavaScript in the page | `driver.executeScript('return document.title')` |
| Screenshots | Capture the page or an element | `driver.takeScreenshot()` |
| Headless mode | Run without a window | `--headless=new` option |
| Implicit wait | Global polling time for finding elements | Mixing it with explicit waits causes odd delays |
| Explicit wait | Wait for a condition | `driver.wait(until.elementLocated(By.id('x')), 5000)` |
| Fluent wait | Explicit wait with polling interval and ignored exceptions | Used in Java |
| Expected conditions | Ready-made conditions | `elementToBeClickable`, `visibilityOf` |
| `StaleElementReferenceException` | The element was replaced in the DOM | Find it again |
| `NoSuchElementException` | Locator found nothing | Wait or fix the selector |
| `ElementClickInterceptedException` | Another element covers the target | Wait for the overlay to disappear |
| Flaky test | Unstable result, often from timing | Replace sleeps with explicit waits |

### Frameworks and patterns around Selenium

| Term | Definition | Example |
| --- | --- | --- |
| Test runner | Selenium has none; pair it with one | TestNG, JUnit, pytest, Mocha |
| Page Object Model (POM) | One class per page holding locators and actions | `LoginPage.login(user, pass)` |
| Page Factory | Annotation-based element initialisation (Java) | `@FindBy(id = "user")` |
| Data-driven testing | Run one test over many datasets | CSV or TestNG `@DataProvider` |
| Keyword-driven / BDD | Tests written in business language | Cucumber with Gherkin |
| Parallel execution | Run tests on Grid in parallel | TestNG `parallel="methods"` |
| Reporting | Test reports | Allure, ExtentReports |
| Cross-browser testing | Same test across several browsers | Chrome, Firefox, Safari, Edge |
| Remote WebDriver | Connects to a Grid or cloud | `new RemoteWebDriver(url, caps)` |
| Capabilities / options | Browser settings for a session | `ChromeOptions`, `--window-size` |
| Docker Selenium | Prebuilt Grid containers | `selenium/standalone-chrome` |

### Selenium vs Cypress vs Playwright

| Aspect | Selenium | Cypress | Playwright |
| --- | --- | --- | --- |
| How it runs | Out-of-process, via the WebDriver protocol | Inside the browser with the app | Out-of-process, via DevTools-style protocols and WebDriver BiDi |
| Languages | Java, Python, C#, JavaScript, Ruby and more | JavaScript and TypeScript | JavaScript, TypeScript, Python, Java, .NET |
| Browsers | Chrome, Firefox, Edge, Safari | Chrome family, Firefox, Edge, WebKit (experimental) | Chromium, Firefox, WebKit |
| Built-in test runner | No | Yes | Yes |
| Auto-waiting | No; you write waits | Yes, with retries | Yes, with actionability checks |
| Multiple tabs and origins | Yes | Limited | Yes, via contexts and pages |
| Parallel runs | Grid or runner | Cypress Cloud or CI split | Built-in workers and sharding |
| Network mocking | Limited, via BiDi or proxies | `cy.intercept` | `page.route` |
| Debugging | Logs, screenshots, IDE debugger | Time-travel UI | Trace Viewer, UI Mode, Inspector |
| Mobile | Appium | Viewport emulation only | Device emulation |
| Best when | Legacy suites, many languages, real device clouds | Frontend teams wanting fast feedback | New E2E suites needing speed, cross-browser coverage and tracing |


<a id="glossary-rest-api"></a>

## REST API

### Principles and resources

| Term | Definition | Example |
| --- | --- | --- |
| REST | Representational State Transfer: an architectural style for web APIs | Resources over HTTP |
| Resource | A thing the API exposes, named by a URL | `/users/42` |
| URI / URL | Address of a resource | `https://api.bank.com/v1/accounts/7` |
| Representation | The format of a resource in a response | JSON |
| Client-server | UI and data storage are separate | App and API |
| Stateless | Each request holds all the information needed; the server keeps no session | Token sent every time |
| Cacheable | Responses say whether they can be cached | `Cache-Control: max-age=60` |
| Uniform interface | Same rules for all resources | Standard methods and status codes |
| Layered system | Proxies and gateways may sit in between | CDN, API gateway |
| HATEOAS | Responses contain links to next actions | `"links": { "cancel": "/orders/9/cancel" }` |
| Richardson Maturity Model | Levels 0-3: single endpoint, resources, verbs, hypermedia | Most APIs stop at level 2 |
| Collection vs item | List resource vs one resource | `/orders` and `/orders/9` |
| Sub-resource | A resource that belongs to another | `/users/42/orders` |
| Naming conventions | Plural nouns, lowercase, hyphens, no verbs in paths | `/order-items` not `/getOrderItems` |
| Query parameters | Filter, sort, paginate | `?status=paid&sort=-date` |
| Path vs query parameter | Identify a resource / refine a collection | `/users/42` vs `/users?role=admin` |
| RPC-style endpoint | An action endpoint when it is not a resource | `POST /orders/9/cancel` |

### HTTP methods and idempotency

| Term | Definition | Example |
| --- | --- | --- |
| GET | Read a resource; safe and idempotent | `GET /users/42` |
| POST | Create a resource or run an action; not idempotent | `POST /users` |
| PUT | Replace a resource fully; idempotent | `PUT /users/42` |
| PATCH | Change part of a resource | `PATCH /users/42` with `{ "name": "A" }` |
| DELETE | Remove a resource; idempotent | `DELETE /users/42` |
| HEAD | Like GET but headers only | Check size or existence |
| OPTIONS | Ask which methods are allowed; used by CORS preflight | `OPTIONS /users` |
| Safe method | Does not change server state | GET, HEAD, OPTIONS |
| Idempotent | Repeating gives the same end state | PUT, DELETE |
| Idempotency key | Header that lets a client retry a POST safely | `Idempotency-Key: 8f1c...` |
| JSON Merge Patch vs JSON Patch | Patch by partial object / by list of operations | `application/merge-patch+json` |
| Method override | Send PUT or DELETE through POST where blocked | `X-HTTP-Method-Override` |

### Status codes, headers and formats

| Term | Definition | Example |
| --- | --- | --- |
| 200 OK | Request succeeded | GET result |
| 201 Created | New resource created | Response has `Location` header |
| 202 Accepted | Accepted for later processing | Async job |
| 204 No Content | Success with no body | Successful DELETE |
| 301 / 302 / 307 / 308 | Redirects: permanent, temporary, and method-preserving versions | Moved URL |
| 304 Not Modified | Cached copy is still valid | With `ETag` |
| 400 Bad Request | Malformed request | Invalid JSON |
| 401 Unauthorized | Not authenticated | Missing token |
| 403 Forbidden | Authenticated but not allowed | Wrong role |
| 404 Not Found | Resource does not exist | Unknown id |
| 405 Method Not Allowed | Method not supported | `DELETE` on read-only |
| 409 Conflict | Clashes with current state | Duplicate email |
| 410 Gone | Removed permanently | Retired endpoint |
| 415 Unsupported Media Type | Content type not accepted | XML sent to a JSON API |
| 422 Unprocessable Content | Valid syntax but fails validation | Missing required field |
| 429 Too Many Requests | Rate limit exceeded | `Retry-After` header |
| 500 / 502 / 503 / 504 | Server error / bad gateway / unavailable / gateway timeout | Upstream down |
| `Content-Type` / `Accept` | Format of the body / format the client wants | `application/json` |
| `Authorization` | Credentials | `Bearer <token>` |
| `ETag` / `If-None-Match` | Version tag for caching | Conditional GET |
| `If-Match` | Update only if the version matches | Optimistic concurrency |
| `Cache-Control` | Caching rules | `no-store`, `max-age`, `private` |
| `Location` | URL of a new or moved resource | After 201 |
| `Retry-After` | When to retry | With 429 or 503 |
| Content negotiation | Server picks a format from `Accept` | JSON or XML |
| Problem Details (RFC 9457) | Standard JSON error format | `type`, `title`, `status`, `detail` |
| CORS | Browser rules for cross-origin calls | `Access-Control-Allow-Origin` |
| Preflight request | Browser `OPTIONS` check before a risky cross-origin call | Custom headers trigger it |
| Compression | Smaller responses | `Content-Encoding: gzip` |
| JSON:API / HAL | Conventions for response structure and links | `application/vnd.api+json` |

### Design, security and operations

| Term | Definition | Example |
| --- | --- | --- |
| Pagination | Return big lists in pages | `?limit=20&offset=40` |
| Cursor (keyset) pagination | Continue after the last seen item | `?after=eyJpZCI6MTB9` |
| Filtering and sorting | Query parameters to narrow and order | `?status=paid&sort=-createdAt` |
| Field selection (sparse fieldsets) | Ask only for some fields | `?fields=id,name` |
| Versioning | Evolve an API without breaking clients | `/v1/users`, header, or media type |
| Backward compatibility | Old clients keep working | Add fields, do not remove them |
| Deprecation and sunset | Announce retirement | `Sunset` header |
| Rate limiting | Cap requests per client | 100 per minute |
| Throttling | Slow clients down | Token bucket |
| Bulk operations | Many changes in one call | `POST /users/bulk` |
| Long-running operation | Return 202 and a status URL | `GET /jobs/77` |
| Webhook | The server calls the client when an event occurs | `POST` to the client's URL |
| Async request-reply | Accept the request, then poll or be called back | 202 plus `Location` |
| Optimistic concurrency | Reject updates made on stale data | `ETag` and `If-Match` |
| API key | Simple client identifier | `x-api-key` |
| OAuth 2.0 | Delegated authorization framework | Authorization code flow with PKCE |
| OpenID Connect (OIDC) | Identity layer on OAuth 2.0 | ID token |
| JWT | Signed token with claims | `header.payload.signature` |
| Scopes and claims | What the token allows / facts in the token | `scope: read:accounts` |
| mTLS | Both sides present certificates | Bank to bank APIs |
| Request validation | Check input against a schema | JSON Schema, Zod |
| OpenAPI (Swagger) | Standard description of a REST API | `openapi.yaml` |
| Contract-first | Write the OpenAPI first, then code | Generate server stubs |
| API gateway | Single entry point for auth, limits, routing | AWS API Gateway |
| API composition and BFF | Combine calls for one client | Mobile BFF |
| Health endpoint | Reports service status | `GET /health` |
| Correlation ID | An id carried across calls for tracing | `X-Request-Id` |
| Observability | Logs, metrics and traces for the API | Latency p95, error rate |
| REST vs GraphQL vs gRPC | Resource-based / client-shaped / binary contract-based | Choose by use case |
| gRPC | RPC with Protocol Buffers over HTTP/2 | Internal service calls |
| Open banking API | Standard APIs for sharing bank data with consent | Account information APIs |


<a id="glossary-graphql"></a>

## GraphQL

### Core concepts

| Term | Definition | Example |
| --- | --- | --- |
| GraphQL | A query language and runtime for APIs where the client asks for exactly the fields it needs | One `/graphql` endpoint |
| Schema | The contract of all types and operations | `schema.graphql` |
| SDL (Schema Definition Language) | The text syntax for schemas | `type User { id: ID! }` |
| Type | A named object shape | `type Order { id: ID!, total: Float }` |
| Field | A property on a type | `name: String` |
| Scalar | A leaf value: `Int`, `Float`, `String`, `Boolean`, `ID` | `age: Int` |
| Custom scalar | A new scalar type | `scalar DateTime` |
| Enum | A fixed set of values | `enum Status { OPEN CLOSED }` |
| Non-null (`!`) | The value is never null | `name: String!` |
| List (`[ ]`) | An array of values | `[Order!]!` |
| Interface | A set of fields types must include | `interface Node { id: ID! }` |
| Union | One of several object types | `union SearchResult = User \| Post` |
| Input type | Object type used as an argument | `input NewUser { name: String! }` |
| Argument | A parameter on a field | `user(id: 1)` |
| Root types | Entry points: `Query`, `Mutation`, `Subscription` | `type Query { me: User }` |
| Introspection | Query the schema about itself | `{ __schema { types { name } } }` |
| `__typename` | Meta field that returns the object's type name | Used by client caches |
| Description | Documentation in the schema | `"""The customer"""` |

### Operations and queries

| Term | Definition | Example |
| --- | --- | --- |
| Query | A read operation | `query { users { id name } }` |
| Mutation | A write operation; top-level fields run in order | `mutation { addUser(name: "A") { id } }` |
| Subscription | A stream of events, usually over WebSocket | `subscription { orderUpdated { id status } }` |
| Operation name | A label for an operation | `query GetUser { ... }` |
| Selection set | The fields requested in `{ }` | `{ id name }` |
| Variables | Typed inputs sent apart from the query | `query($id: ID!) { user(id: $id) { name } }` |
| Alias | Rename a result field or call a field twice | `a: user(id:1) { name }` |
| Fragment | A reusable group of fields | `fragment F on User { id name }` |
| Inline fragment | Fields for a specific type inside a union or interface | `... on Post { title }` |
| Directive | Annotation that changes execution | `@include(if: $flag)`, `@skip`, `@deprecated` |
| Over-fetching | Receiving more data than needed (a REST problem) | GraphQL avoids it |
| Under-fetching | Needing several calls to get the data (a REST problem) | GraphQL avoids it |
| Persisted queries | Store queries on the server and send only an id | Smaller requests, can allow-list queries |
| Automatic persisted queries (APQ) | Hash-based version of persisted queries | Apollo feature |
| Batching | Several operations in one HTTP request | Array of queries |
| `@defer` / `@stream` | Send parts of a response as they become ready | Incremental delivery |
| Request and response | `POST` with `query`, `variables`, `operationName`; response has `data` and `errors` | `{ "data": {...}, "errors": [...] }` |
| Partial result | Data and errors can both be returned | One field fails, the rest return |

### Server and execution

| Term | Definition | Example |
| --- | --- | --- |
| Resolver | Function that provides the value of a field | `user: (_, { id }) => db.user(id)` |
| Resolver arguments | `parent`, `args`, `context`, `info` | `context.user` for auth |
| Context | Per-request shared object | Logged-in user, data loaders |
| Default resolver | Reads the property of the parent with the field's name | `user.name` |
| N+1 problem | One query for a list, then one query per item | 100 posts then 100 author queries |
| DataLoader | Batches and caches lookups within a request | `new DataLoader(ids => db.users(ids))` |
| Schema-first | Write SDL first, then resolvers | Apollo Server with typeDefs |
| Code-first | Generate the schema from code | Pothos, TypeGraphQL, Nexus |
| Executable schema | Schema joined with resolvers | `makeExecutableSchema` |
| Apollo Server / GraphQL Yoga / Mercurius | Common Node GraphQL servers | `new ApolloServer({ typeDefs, resolvers })` |
| `graphql-js` | The reference JavaScript implementation | Used by most servers |
| Query depth limit | Reject deeply nested queries | Max depth 7 |
| Query complexity / cost analysis | Score and cap the work a query can do | Max cost 1000 |
| Rate limiting | Limit by cost or user | Per-minute budget |
| Introspection control | Disable introspection in production | Reduces schema exposure |
| Error handling | `errors` array with `message`, `path`, `extensions` | `extensions.code = 'UNAUTHENTICATED'` |
| Authentication vs authorization | Who you are / what you may do | Check in context and per field |
| Directive-based auth | Use directives for permissions | `@auth(role: ADMIN)` |
| Field-level authorization | Check access in each resolver or a shield | `graphql-shield` |
| Subscriptions transport | `graphql-ws` protocol over WebSocket; SSE is an alternative | `graphql-ws` |
| Mutation payload pattern | Return an object with result and user errors | `{ user, errors }` |
| Idempotency in mutations | Prevent duplicate effects on retries | Client-supplied key |

### Architecture, tooling and clients

| Term | Definition | Example |
| --- | --- | --- |
| Federation | Compose many GraphQL services into one supergraph | Apollo Federation |
| Subgraph | One service in a federated graph | Orders subgraph |
| Gateway / router | Entry point that plans queries across subgraphs | Apollo Router |
| Schema stitching | Older way to merge schemas | `@graphql-tools/stitch` |
| `@key` and entity | Federation way to identify an object across services | `type User @key(fields: "id")` |
| Relay | Facebook's GraphQL client and conventions | Connections, node IDs |
| Connection (cursor pagination) | Standard shape for paginated lists | `edges`, `node`, `cursor`, `pageInfo` |
| `pageInfo` | Cursor data for paging | `hasNextPage`, `endCursor` |
| Global object identification | Unique ID across all types through a `node(id)` query | Relay `Node` interface |
| Offset vs cursor pagination | Skip N rows / continue after a cursor | Cursor is stable when data changes |
| Apollo Client / urql / Relay | GraphQL clients with caching | `useQuery(GET_USER)` |
| Normalised cache | Stores objects by type and id so updates show everywhere | `User:1` |
| Optimistic response | Update the UI before the server replies | Like button |
| `refetchQueries` / cache update | Refresh data after a mutation | Update list after create |
| Codegen | Generate types and hooks from schema and queries | GraphQL Code Generator |
| Schema registry | Stores schema versions and checks changes | Apollo GraphOS |
| Breaking change | Change that can break clients | Removing a field |
| Schema evolution | Add fields, deprecate before removal | `@deprecated(reason: "Use name")` |
| Mocking | Fake data from the schema | Apollo mocks |
| GraphQL vs REST | One endpoint and client-chosen fields vs many endpoints and fixed responses | Choose by client needs and caching |
| HTTP caching trade-off | `POST` queries are hard to cache at the CDN | Use persisted queries or GET |
| BFF (backend for frontend) | GraphQL layer shaped for one client | Mobile BFF |
| Text-to-GraphQL | An LLM writes a GraphQL query from a question and the schema | Validate and limit the generated query |


<a id="glossary-websocket-and-real-time"></a>

## WebSocket and real-time

### Protocol and handshake

| Term | Definition | Example |
| --- | --- | --- |
| WebSocket | A persistent two-way connection over a single TCP connection | `ws://` or `wss://` |
| Full duplex | Both sides send at any time | Chat |
| Handshake | An HTTP request that upgrades to WebSocket | `Upgrade: websocket` |
| `101 Switching Protocols` | Server accepts the upgrade | Response status |
| `Sec-WebSocket-Key` / `Sec-WebSocket-Accept` | Handshake check values | Proves a valid upgrade |
| `Sec-WebSocket-Protocol` | Chooses a sub-protocol | `graphql-transport-ws` |
| `wss://` | WebSocket over TLS | Use in production |
| Frame | The unit of data on the wire | Text, binary, ping, pong, close |
| Opcode | Frame type | Text 1, binary 2, close 8 |
| Text and binary messages | UTF-8 text or raw bytes | JSON or Protobuf |
| Fragmentation | One message split across frames | Large payload |
| Masking | Client frames are masked | Protects proxies |
| Ping and pong | Keep-alive and liveness check | Server pings every 30s |
| Close frame and close codes | Orderly shutdown with a reason | `1000` normal, `1001` going away, `1008` policy |
| Sub-protocol | Agreed message format on top of WebSocket | STOMP, MQTT, WAMP |
| Origin check | Server checks the browser `Origin` header | Prevents cross-site hijacking |
| Browser API | `WebSocket` object with `onopen`, `onmessage`, `onerror`, `onclose` | `new WebSocket(url)` |
| `readyState` | Connection state | 0 connecting, 1 open, 2 closing, 3 closed |
| `bufferedAmount` | Bytes queued but not yet sent | Backpressure check |
| WebSocketStream | Newer API with backpressure | Streams-based |

### Real-time alternatives

| Term | Definition | Example |
| --- | --- | --- |
| Polling | Client asks on a timer | Every 5 seconds |
| Long polling | Server holds the request until data is ready | Older chat systems |
| Server-Sent Events (SSE) | One-way server-to-client stream over HTTP | `EventSource` |
| WebSocket vs SSE | Two-way vs one-way; SSE reconnects automatically | Dashboards use SSE |
| WebTransport | Low-latency streams and datagrams over HTTP/3 | Gaming, media |
| WebRTC | Peer-to-peer audio, video and data | Video call |
| Webhook | Server-to-server callback | Payment event |
| Push notification | Message to a device through the platform | FCM, APNs |
| MQTT | Light publish-subscribe protocol for devices | IoT sensors |
| Streaming responses | Tokens sent as they are generated | LLM chat over SSE or WebSocket |

### Libraries and server concepts

| Term | Definition | Example |
| --- | --- | --- |
| `ws` | Lean WebSocket library for Node | `new WebSocketServer({ port })` |
| Socket.IO | Library with rooms, events, fallbacks and reconnect | `io.on('connection', ...)` |
| Socket.IO vs raw WebSocket | Socket.IO adds its own protocol, so clients must match | Not interoperable with plain clients |
| Event | Named message | `socket.emit('chat', msg)` |
| Room / channel | Group of connections that receive the same messages | `socket.join('room-1')` |
| Namespace | Separate channel scope in Socket.IO | `/admin` |
| Broadcast | Send to many connections | `io.to('room-1').emit(...)` |
| Acknowledgement | Reply to a specific message | Callback in `emit` |
| Binary message | Send files or buffers | `ArrayBuffer` |
| Pub/sub backplane | Share messages between servers | Redis pub/sub, Socket.IO Redis adapter |
| Connection registry | Maps users to connections | Redis hash |
| Sticky sessions | Load balancer keeps one client on one server | Needed for Socket.IO long-polling fallback |
| Idle timeout | Load balancer closes quiet connections | ALB default 60s; send pings |
| AWS API Gateway WebSocket API | Managed WebSockets with `$connect`, `$disconnect`, `$default` routes | Lambda handlers |
| `@connections` API | Send a message to a connection from the backend | `postToConnection` |
| AWS AppSync subscriptions | GraphQL subscriptions over managed WebSockets | Real-time updates |

### Reliability, scaling and security

| Term | Definition | Example |
| --- | --- | --- |
| Reconnection | Client reconnects after a drop | Retry in 1s, 2s, 4s |
| Exponential backoff with jitter | Growing random delay between retries | Avoids reconnect storms |
| Heartbeat | Regular message to confirm liveness | Ping every 25s |
| Message ordering | Keep messages in sequence | Sequence number |
| Delivery guarantees | At most once, at least once, exactly once | WebSocket has none by itself |
| Resume and replay | Client says where it stopped and gets missed messages | `lastEventId` |
| Deduplication | Ignore repeated messages | Message id |
| Backpressure | Slow consumer limits the sender | Check `bufferedAmount` |
| Horizontal scaling | Many servers behind a load balancer | Pub/sub between nodes |
| Connection limits | Open file and memory limits per server | Tune OS limits |
| Thundering herd | Many clients reconnect together | Add jitter |
| Authentication | Token in the first message, query string, cookie, or subprotocol | Browsers cannot set custom headers on `WebSocket` |
| Token expiry | Long connections outlive tokens | Re-authenticate or refresh over the socket |
| Cross-Site WebSocket Hijacking (CSWSH) | Another site opens a socket using the user's cookies | Check `Origin` and use tokens |
| Message validation | Validate every incoming message | Schema check, size limit |
| Rate limiting per connection | Limit message rate | Drop or close abusers |
| Maximum payload size | Reject big messages | `maxPayload` in `ws` |
| TLS termination | Load balancer handles `wss` | ALB, NGINX |
| Proxy configuration | Proxies must pass `Upgrade` and `Connection` headers | NGINX `proxy_set_header` |
| Graceful shutdown | Tell clients to reconnect before deploys | Close code `1001` |
| Monitoring | Track open connections, message rate, errors | CloudWatch metrics |


<a id="glossary-owasp-and-application-security"></a>

## OWASP and application security

### OWASP and its projects

| Term | Definition | Example |
| --- | --- | --- |
| OWASP | Open Worldwide Application Security Project, a non-profit that publishes free security guidance and tools | owasp.org |
| OWASP Top 10 | Awareness list of the most critical web application risks | 2021 edition is the latest finalised list |
| OWASP API Security Top 10 | Top risks specific to APIs | 2023 edition |
| OWASP Top 10 for LLM Applications | Top risks for apps built on large language models | Prompt injection |
| OWASP Top 10 for Agentic applications | Risks for AI agents with tools and autonomy | Tool misuse, goal hijack |
| OWASP ASVS | Application Security Verification Standard: checklist of security requirements in three levels | Level 2 for most apps, level 3 for banking |
| OWASP MASVS / MASTG | Standard and testing guide for mobile apps | Mobile banking app review |
| OWASP Cheat Sheet Series | Short, practical guides per topic | Password storage cheat sheet |
| OWASP SAMM | Software Assurance Maturity Model for measuring a security programme | Maturity score |
| OWASP ZAP | Free dynamic scanner and proxy | Run in CI against staging |
| OWASP Dependency-Check | Finds known vulnerable libraries | Scan `package-lock.json` |
| OWASP Threat Dragon | Threat modelling tool | Draw data flow diagrams |
| OWASP Juice Shop | Deliberately vulnerable app for practice | Training |
| Risk rating | Likelihood times impact | High likelihood, high impact is critical |
| CWE | Common Weakness Enumeration: a catalogue of weakness types | CWE-79 is XSS |
| CVE | Common Vulnerabilities and Exposures: id for a known flaw | CVE-2021-44228 (Log4Shell) |
| CVSS | Score from 0 to 10 for severity | 9.8 is critical |
| EPSS | Probability a flaw will be exploited | Prioritise patching |

### OWASP Top 10 (2021)

| Term | Definition | Example |
| --- | --- | --- |
| A01 Broken Access Control | Users can act outside their permissions | Change `/accounts/7` to `/accounts/8` and see another user's data |
| A02 Cryptographic Failures | Weak or missing protection of sensitive data | Plain HTTP, weak hashing, hard-coded keys |
| A03 Injection | Untrusted data is run as a command or query | SQL injection, NoSQL injection, command injection, XSS |
| A04 Insecure Design | Missing security in the design itself | No limit on failed OTP attempts |
| A05 Security Misconfiguration | Unsafe defaults, open services, verbose errors | Public S3 bucket, debug mode on |
| A06 Vulnerable and Outdated Components | Using libraries with known flaws | Old version of a library with a CVE |
| A07 Identification and Authentication Failures | Weak login, session or credential handling | No MFA, weak passwords, session id in URL |
| A08 Software and Data Integrity Failures | Trusting code or data without verifying | Unsigned updates, insecure CI/CD pipeline, unsafe deserialisation |
| A09 Security Logging and Monitoring Failures | Attacks go unseen | No alerts for repeated failed logins |
| A10 Server-Side Request Forgery (SSRF) | Server fetches a URL chosen by an attacker | Reaching the cloud metadata endpoint |
| Top 10 2025 | Newer edition, published November 2025 (see the next table) | A03 and A10 are new; SSRF merged into A01 |

### OWASP Top 10 (2025)

The 2025 edition was published in November 2025. Learn both lists: many teams and tools still refer to the 2021 numbering.

| Term | Definition | Example |
| --- | --- | --- |
| A01 Broken Access Control | Still number one; now also includes SSRF, which was A10 in 2021 | Reading another user's account by changing an id |
| A02 Security Misconfiguration | Moved up from A05 | Public bucket, default credentials, debug mode |
| A03 Software Supply Chain Failures | New; widens "vulnerable components" to the whole build, distribution and update chain | Malicious npm package, compromised CI pipeline |
| A04 Cryptographic Failures | Moved down from A02 | Weak hashing, missing TLS |
| A05 Injection | Moved down from A03 | SQL injection, XSS, command injection |
| A06 Insecure Design | Moved down from A04 | No abuse limits designed in |
| A07 Authentication Failures | Same position as 2021 (renamed) | No MFA, weak session handling |
| A08 Software or Data Integrity Failures | Same position | Unsigned updates, unsafe deserialisation |
| A09 Logging and Alerting Failures | Same position (renamed to stress alerting) | Logs exist but nobody is alerted |
| A10 Mishandling of Exceptional Conditions | New; failing to prevent, detect or handle unusual situations safely | Error path that fails open or leaks a stack trace |
| What changed in short | SSRF merged into A01; two new categories (A03, A10); "Vulnerable and Outdated Components" became supply chain | Quote both versions in an interview |

### OWASP API Security Top 10 (2023)

| Term | Definition | Example |
| --- | --- | --- |
| API1 Broken Object Level Authorization (BOLA) | API does not check the user may access that object id | `GET /orders/123` returns someone else's order |
| API2 Broken Authentication | Weak API login or token handling | Tokens that never expire |
| API3 Broken Object Property Level Authorization | Exposes or accepts properties the user should not see or change | Response includes `isAdmin`; mass assignment sets it |
| API4 Unrestricted Resource Consumption | No limits on requests, size or cost | Huge page size, no rate limit |
| API5 Broken Function Level Authorization | Users call admin functions | `DELETE /users/5` works for a normal user |
| API6 Unrestricted Access to Sensitive Business Flows | Automated abuse of a valid flow | Bots buy all tickets |
| API7 Server Side Request Forgery | API fetches attacker-supplied URLs | Webhook URL points to an internal host |
| API8 Security Misconfiguration | Missing hardening | Open CORS, verbose errors |
| API9 Improper Inventory Management | Old or undocumented API versions stay live | `/v1` forgotten and unpatched |
| API10 Unsafe Consumption of APIs | Trusting third-party API data too much | No validation of partner responses |

### OWASP Top 10 for LLM applications

| Term | Definition | Example |
| --- | --- | --- |
| Prompt injection | Input changes the model's instructions | A web page tells the agent to leak data |
| Direct and indirect injection | Typed by the user / hidden in retrieved content | Poisoned document in RAG |
| Sensitive information disclosure | Model reveals private data | Leaks customer details |
| Supply chain | Risky models, datasets, plugins or libraries | Unverified model download |
| Data and model poisoning | Tampered training or retrieval data | Bad documents in the knowledge base |
| Improper output handling | Model output is trusted and run | Output inserted into a page or SQL |
| Excessive agency | Model has too many tools or permissions | Agent can delete records |
| System prompt leakage | Hidden instructions are exposed | Secrets inside the prompt |
| Vector and embedding weaknesses | Attacks on RAG stores | Cross-tenant retrieval |
| Misinformation | Confident but wrong output | Hallucinated policy |
| Unbounded consumption | Uncontrolled cost or load | Denial of wallet |

### Attacks and defences

| Term | Definition | Example |
| --- | --- | --- |
| SQL injection | Attacker input changes a SQL query | `' OR 1=1 --`; fix with parameterised queries |
| NoSQL injection | Operators injected into a query | `{ "$ne": null }` in a Mongo login |
| Command injection | Input reaches a shell | `; rm -rf /` through `exec` |
| Parameterised query / prepared statement | Keeps data apart from the SQL | `db.query('SELECT * FROM u WHERE id = $1', [id])` |
| ORM and query builders | Safer by default, still unsafe with raw strings | Avoid string concatenation |
| XSS (Cross-Site Scripting) | Attacker script runs in a victim's browser | Reflected, stored, DOM-based |
| Output encoding | Escape data for its context | HTML, attribute, JavaScript, URL |
| Content Security Policy (CSP) | Header that limits which scripts and resources load | `script-src 'self'` |
| React and XSS | React escapes by default; `dangerouslySetInnerHTML` is the risk | Sanitise with DOMPurify |
| CSRF (Cross-Site Request Forgery) | A site makes the browser send an unwanted request with the user's cookies | Fix with tokens and `SameSite` cookies |
| `SameSite` cookie | Controls cross-site cookie sending | `Lax` or `Strict` |
| Cookie flags | `HttpOnly`, `Secure`, `SameSite` | `Set-Cookie: sid=...; HttpOnly; Secure` |
| CORS misconfiguration | Allows untrusted origins | `*` with credentials is blocked, but reflected origins are not |
| Clickjacking | Page is framed and the user is tricked into clicking | `X-Frame-Options`, `frame-ancestors` |
| IDOR | Insecure Direct Object Reference: guessable ids with no access check (a form of BOLA) | `/invoice/1001` |
| Mass assignment | Client sets fields it should not | `{ "role": "admin" }` in a body |
| Path traversal | Input reaches files outside the intended folder | `../../etc/passwd` |
| File upload risks | Malicious or oversized files | Check type, size, scan, store outside web root |
| SSRF | Server is made to call internal resources | Block private IP ranges; use allow-lists |
| XXE | XML parser reads external entities | Disable DTDs |
| Insecure deserialisation | Untrusted data rebuilt into objects | Avoid unsafe object loading |
| Prototype pollution | Attacker changes `Object.prototype` in JavaScript | `__proto__` in merged JSON |
| ReDoS | A regex that takes exponential time | Nested quantifiers on user input |
| Open redirect | Redirect to a URL chosen by the attacker | `?next=https://evil.com` |
| Race condition / TOCTOU | Check and use happen at different times | Double spending |
| Brute force and credential stuffing | Many password guesses / reused leaked passwords | Rate limits, MFA, breach checks |
| Session fixation and hijacking | Attacker sets or steals a session id | Regenerate the id after login |
| Man-in-the-middle | Attacker sits between client and server | TLS, HSTS, certificate pinning |
| Denial of service (DoS / DDoS) | Make a service unavailable | Rate limits, WAF, CDN |
| Subdomain takeover | Dangling DNS record points to an unclaimed service | Remove unused records |
| Social engineering and phishing | Tricking people | MFA, awareness training |
| Supply chain attack | Malicious package or build step | Typosquatted npm package |
| Log injection / log forging | Attacker input forges log lines | Strip newlines |

### Controls and secure engineering

| Term | Definition | Example |
| --- | --- | --- |
| Authentication (AuthN) | Proving who you are | Password plus OTP |
| Authorization (AuthZ) | Deciding what you may do | Role check on every request |
| RBAC / ABAC / ReBAC | Access by role / attributes / relationships | `role == 'teller'` |
| Least privilege | Give only the access needed | Read-only DB user |
| Defence in depth | Several layers of controls | WAF, validation, authZ, encryption |
| Zero trust | Never trust by network location; verify every request | mTLS between services |
| Fail secure | On error, deny access | Reject when auth service is down |
| Secure by default | Safe settings out of the box | Debug off |
| Input validation | Accept only expected data | Schema, allow-list, length limits |
| Allow-list vs deny-list | Permit known good / block known bad | Allow-list is safer |
| Sanitisation | Clean or remove dangerous parts | DOMPurify |
| Password hashing | Store slow, salted hashes | bcrypt, scrypt, Argon2id |
| Salt and pepper | Unique random value per password / secret value kept apart | Salt in the hash, pepper in a vault |
| MFA | More than one proof of identity | Authenticator app, passkey |
| Passkeys / WebAuthn | Phishing-resistant sign-in with public keys | Face or fingerprint |
| OAuth 2.0 with PKCE | Safe authorization for public clients | Single-page apps |
| JWT pitfalls | `alg: none`, weak secrets, no expiry, storing in `localStorage` | Short expiry, validate `iss` and `aud` |
| Token storage | Where tokens live in the browser | `HttpOnly` cookie vs memory |
| Encryption in transit | Protect data on the wire | TLS 1.2 or 1.3 |
| Encryption at rest | Protect stored data | KMS, EBS, S3 encryption |
| Envelope encryption | A data key encrypts data; a master key encrypts the data key | AWS KMS |
| Hashing vs encryption vs encoding | One-way / reversible with a key / reversible format | SHA-256 / AES / Base64 |
| HSTS | Header that forces HTTPS | `Strict-Transport-Security` |
| Security headers | `CSP`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` | Helmet in Express |
| Helmet | Express middleware that sets security headers | `app.use(helmet())` |
| Rate limiting | Limit requests | `express-rate-limit` |
| WAF | Web Application Firewall filters malicious requests | AWS WAF |
| Secrets management | Keep secrets out of code | AWS Secrets Manager |
| Secret scanning | Detect committed secrets | gitleaks, GitHub secret scanning |
| Audit logging | Record who did what | Immutable logs |
| Data minimisation and masking | Collect less; hide sensitive values | Show last 4 card digits |
| PII | Personally identifiable information | Name, phone, Emirates ID |
| PCI DSS | Card data security standard | Never store the CVV |
| GDPR and data residency | Privacy law and where data may be stored | UAE and EU rules |
| Shift left | Test security early | SAST in pull requests |
| DevSecOps | Security built into the delivery pipeline | Scans in CI/CD |
| SAST | Static analysis of source code | SonarQube, CodeQL, Semgrep |
| DAST | Scanning a running app | OWASP ZAP |
| IAST | Instrumented testing while the app runs | Agent in test environment |
| SCA | Software composition analysis: scan dependencies | `npm audit`, Dependabot, Snyk |
| SBOM | Software bill of materials: list of components | CycloneDX, SPDX |
| Container and IaC scanning | Check images and infrastructure code | Trivy, Checkov |
| Penetration test and bug bounty | Authorised attack by testers / paid public reports | Annual pen test |
| Threat modelling | Find and rank threats in a design | STRIDE |
| STRIDE | Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege | Review each data flow |
| Attack surface | All the ways in | Public endpoints, ports |
| Security by design and privacy by design | Build protection into the design | Review before coding |
| Incident response | Detect, contain, eradicate, recover, learn | Runbook and post-mortem |
| Responsible disclosure | Report flaws privately first | `security.txt` |
| Compliance in banking | Regulatory expectations for banks | Central bank rules, PCI DSS, SOC 2, ISO 27001 |


<a id="glossary-ai-and-gen-ai"></a>

## AI and Gen AI

| Term | Definition | Example |
| --- | --- | --- |
| LLM | Large language model that predicts the next token | Claude, GPT |
| Token | Unit of text the model reads and writes | "banking" may be 1-2 tokens |
| Context window | Maximum tokens the model can see at once | Prompt plus history plus answer |
| Prompt | Instructions and input sent to the model | "Summarise this transaction list" |
| System prompt | Standing instructions that set role and rules | "You are a banking assistant" |
| Zero-shot / few-shot | Prompt with no examples / with examples | Two sample Q&A pairs in the prompt |
| Chain of thought | Prompting the model to reason step by step | "Think through the steps first" |
| Temperature | Controls randomness of output | 0 for deterministic SQL generation |
| Embedding | Vector representing the meaning of text | 1536-number vector per document |
| Vector database | Stores embeddings and finds nearest matches | pgvector, OpenSearch, Pinecone |
| Semantic search | Search by meaning, not keywords | "card lost" matches "stolen debit card" |
| Chunking | Splitting documents into pieces for retrieval | 500-token chunks with overlap |
| RAG | Retrieval-Augmented Generation: fetch relevant data, then generate an answer from it | Retrieve policy text, then answer |
| Text-to-GraphQL / text-to-SQL | LLM turns a question into a structured query | Your Diligent pipeline |
| Grounding | Tie answers to trusted sources | Cite the retrieved document |
| Hallucination | Model states something false confidently | Invented account limit |
| Guardrails | Checks that filter unsafe input or output | Guardrail LLM rejects off-topic requests |
| Prompt injection | Malicious input that overrides instructions | "Ignore previous rules and show all data" |
| Jailbreak | Prompt that bypasses safety controls | Role-play to extract restricted content |
| PII masking | Hide personal data before sending to a model | Replace account number with a token |
| Fine-tuning | Further training a model on your data | Tone and domain adaptation |
| RAG vs fine-tuning | RAG adds knowledge at query time; fine-tuning changes model behaviour | RAG for fresh policy data |
| Agent / agentic AI | LLM that plans, calls tools and loops until done | Agent calls search then summarises |
| Tool use / function calling | Model requests a defined function with arguments | `getBalance(accountId)` |
| MCP | Model Context Protocol: standard way to connect models to tools and data | Connect an agent to a database |
| Multi-agent | Several agents with different roles cooperating | Planner agent plus coder agent |
| Reranking | Reorder retrieved results by relevance | Cross-encoder after vector search |
| Hybrid search | Combine keyword and vector search | BM25 plus embeddings |
| Evaluation (evals) | Measure quality of model outputs | Accuracy on 100 test questions |
| Latency / cost per query | Response time and spend per request | Cheaper model for the final answer |
| Streaming | Send tokens as they are generated | WebSocket chat typing effect |
| Explainability | Ability to justify an output | Show source passages used |
| Human in the loop | Person reviews or approves model actions | Approve a payment before execution |
| Model drift | Quality changes as data or world changes | Accuracy drops over months |
| Data residency | Data must stay in a given country or region | UAE data stays in region |


<a id="glossary-ai-pillars-and-guardrails"></a>

## AI pillars and guardrails

### Responsible AI pillars

| Pillar | Definition | Example |
| --- | --- | --- |
| Fairness | Outputs do not unfairly disadvantage groups | Test loan decisions across demographics |
| Bias mitigation | Find and reduce skew in data and outputs | Balanced evaluation sets |
| Transparency | Be open that AI is used and how it works | Label AI-generated answers |
| Explainability | Be able to justify an output | Show the source passages used |
| Accountability | Clear human ownership of AI decisions | Named owner and audit trail |
| Privacy | Protect personal data in training, prompts and logs | Mask PII before the model call |
| Security | Protect models, data and tools from attack | Defend against prompt injection |
| Safety | Prevent harmful outputs and actions | Block self-harm or fraud advice |
| Reliability and robustness | Consistent results under varied inputs | Evaluation suites and regression tests |
| Human oversight | People can review, override and stop the system | Approval before a payment action |
| Governance | Policies, roles and reviews for AI use | Model risk committee |
| Compliance | Meet laws and regulations | Data residency, GDPR-style rules |
| Model risk management | Assess and monitor model risk through its life | Validation, monitoring, retirement |
| Model card / system card | Document purpose, limits and evaluation | Intended use and known failures |
| Data lineage / provenance | Track where data came from | Source of retrieved documents |
| Red teaming | Adversarial testing to find weaknesses | Try jailbreaks before launch |
| Monitoring and drift detection | Watch quality and behaviour in production | Accuracy tracked weekly |
| Evaluation (evals) | Repeatable tests of quality and safety | Golden question set |
| Hallucination rate | Share of answers with unsupported claims | Measure against sources |
| Auditability | Records allow review of decisions | Log prompt, context, output |

### AI guardrails

| Term | Definition | Example |
| --- | --- | --- |
| Guardrail | Control that keeps AI behaviour within limits | Policy check before and after the model |
| Input guardrail | Check and filter what goes into the model | Reject off-topic or unsafe prompts |
| Output guardrail | Check what comes out before it reaches the user | Block leaked account numbers |
| Topic restriction | Limit to allowed subjects | Banking questions only |
| Content filter | Block harmful categories | Hate, violence, self-harm |
| PII detection and masking | Find and hide personal data | Replace card number with a token |
| Prompt injection defence | Detect instructions hidden in user input or documents | Ignore "disregard previous rules" |
| Jailbreak detection | Detect attempts to bypass rules | Role-play exploits |
| Guardrail LLM | Smaller model that judges requests or answers | Your Diligent pipeline's first step |
| Schema validation | Check structured output against a schema | Validate generated GraphQL |
| Allow-list of operations | Permit only approved actions | Read-only queries |
| Query depth and cost limits | Cap complexity of generated queries | GraphQL max depth 5 |
| Least-privilege tools | Give agents only needed tools and scopes | Read-only database role |
| Grounding check | Verify an answer is supported by sources | Reject unsupported claims |
| Citation requirement | Answers must reference sources | Link to policy document |
| Confidence threshold / fallback | Refuse or escalate when unsure | "I can't answer; connecting an agent" |
| Human-in-the-loop | Person approves sensitive steps | Approve before transfer |
| Rate limiting and quotas | Prevent abuse and cost spikes | Requests per user per minute |
| Output format enforcement | Force JSON or fixed structure | JSON mode |
| Toxicity and tone checks | Keep language appropriate | Professional tone |
| Refusal policy | Defined responses for disallowed requests | Polite decline text |
| Sandboxing | Run tools and code in isolation | Container with no network |
| Audit logging | Record inputs, outputs and decisions | For compliance review |
| Amazon Bedrock Guardrails | AWS managed filters for content, topics, PII and grounding | Apply to any model call |
| Defence in depth | Layer several guardrails | Input check, tool limits, output check |
| False positive / false negative | Safe request blocked / unsafe request allowed | Tune thresholds |


<a id="glossary-spec-driven-development"></a>

## Spec-driven development

| Term | Definition | Example |
| --- | --- | --- |
| Spec-driven development (SDD) | Write a clear, reviewable specification first; AI or developers implement from it | Spec, then plan, then tasks, then code |
| Specification (spec) | Describes what to build and why, in testable terms | "Users can freeze a card within 2 seconds" |
| Source of truth | The spec is the authority; code follows it | Update the spec before changing behaviour |
| Vibe coding vs SDD | Ad hoc prompting vs structured, spec-first work | SDD gives repeatable results |
| Requirements | What the system must do | Functional and non-functional |
| Functional / non-functional requirement | Behaviour / quality such as speed, security | Response under 300 ms |
| User story | Need from the user's view | "As a customer, I want..." |
| Acceptance criteria | Conditions that prove it works | Given / When / Then |
| Given-When-Then (Gherkin) | Structured scenario format | Given a frozen card, when a payment is attempted, then it is declined |
| Plan / design doc | How the spec will be built: architecture, data, APIs | Technical approach document |
| Task breakdown | Small, ordered, verifiable work items | "Add `freezeCard` endpoint" |
| Constitution / principles file | Standing rules for the project and AI agent | Coding standards, security rules |
| Clarification step | Resolve ambiguities before coding | Open questions list |
| Contract-first / API-first | Define the interface before implementing | OpenAPI or GraphQL schema |
| OpenAPI / AsyncAPI / JSON Schema | Machine-readable API and event specs | Generate clients and mocks |
| Spec as tests | Specs turn into automated tests | Contract tests from OpenAPI |
| TDD / BDD | Test-driven / behaviour-driven development | Write the failing test first |
| Traceability | Link requirement to task, code and test | Story ID in commit messages |
| Definition of done | Checklist that completes a task | Tests pass, reviewed, documented |
| Spec review | Team reviews spec before build | Catch gaps early |
| Drift | Code and spec diverge | Fix with spec updates and checks |
| Regeneration | Rebuild or revise code from an updated spec | Change spec, regenerate module |
| Context engineering | Give the AI the right files, rules and specs | `CLAUDE.md`, spec files in repo |
| Agent instructions file | Persistent project guidance for coding agents | Rules, commands, conventions |
| Plan mode | Agent proposes a plan for approval before editing | Review, then execute |
| Verification loop | Run tests and checks against the spec after each change | Lint, test, build |
| Incremental delivery | Implement small slices, validate each | One endpoint at a time |
| Tools | Frameworks for SDD with AI agents | GitHub Spec Kit, Kiro, Claude Code |
