# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetCurrentUser*](#getcurrentuser)
  - [*ListUsers*](#listusers)
  - [*GetChapter*](#getchapter)
  - [*ListChapters*](#listchapters)
  - [*GetLesson*](#getlesson)
  - [*ListLessons*](#listlessons)
  - [*GetQuiz*](#getquiz)
  - [*ListQuizzes*](#listquizzes)
  - [*GetUserProgress*](#getuserprogress)
  - [*ListAllProgress*](#listallprogress)
  - [*GetUserBadges*](#getuserbadges)
  - [*ListBadges*](#listbadges)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdateUser*](#updateuser)
  - [*DeleteUser*](#deleteuser)
  - [*CreateChapter*](#createchapter)
  - [*UpdateChapter*](#updatechapter)
  - [*DeleteChapter*](#deletechapter)
  - [*CreateLesson*](#createlesson)
  - [*UpdateLesson*](#updatelesson)
  - [*DeleteLesson*](#deletelesson)
  - [*CreateQuiz*](#createquiz)
  - [*UpdateQuiz*](#updatequiz)
  - [*DeleteQuiz*](#deletequiz)
  - [*CreateUserProgress*](#createuserprogress)
  - [*UpdateUserProgress*](#updateuserprogress)
  - [*DeleteUserProgress*](#deleteuserprogress)
  - [*CreateBadge*](#createbadge)
  - [*UpdateBadge*](#updatebadge)
  - [*DeleteBadge*](#deletebadge)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetCurrentUser
You can execute the `GetCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentUserRef:
```typescript
const name = getCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentUser` query has no variables.
### Return Type
Recall that executing the `GetCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCurrentUserData {
  user?: {
    name: string;
    email: string;
    points?: number | null;
  };
}
```
### Using `GetCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUser } from '@dataconnect/generated';


// Call the `getCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getCurrentUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetCurrentUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserRef } from '@dataconnect/generated';


// Call the `getCurrentUserRef()` function to get a reference to the query.
const ref = getCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListUsersData {
  users: ({
    name: string;
    schoolName?: string | null;
  })[];
}
```
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## GetChapter
You can execute the `GetChapter` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getChapter(vars: GetChapterVariables, options?: ExecuteQueryOptions): QueryPromise<GetChapterData, GetChapterVariables>;

interface GetChapterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetChapterVariables): QueryRef<GetChapterData, GetChapterVariables>;
}
export const getChapterRef: GetChapterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getChapter(dc: DataConnect, vars: GetChapterVariables, options?: ExecuteQueryOptions): QueryPromise<GetChapterData, GetChapterVariables>;

interface GetChapterRef {
  ...
  (dc: DataConnect, vars: GetChapterVariables): QueryRef<GetChapterData, GetChapterVariables>;
}
export const getChapterRef: GetChapterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getChapterRef:
```typescript
const name = getChapterRef.operationName;
console.log(name);
```

### Variables
The `GetChapter` query requires an argument of type `GetChapterVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetChapterVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetChapter` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetChapterData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetChapterData {
  chapter?: {
    title: string;
    description?: string | null;
    lessons_on_chapter: ({
      title: string;
    })[];
  };
}
```
### Using `GetChapter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getChapter, GetChapterVariables } from '@dataconnect/generated';

// The `GetChapter` query requires an argument of type `GetChapterVariables`:
const getChapterVars: GetChapterVariables = {
  id: ..., 
};

// Call the `getChapter()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getChapter(getChapterVars);
// Variables can be defined inline as well.
const { data } = await getChapter({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getChapter(dataConnect, getChapterVars);

console.log(data.chapter);

// Or, you can use the `Promise` API.
getChapter(getChapterVars).then((response) => {
  const data = response.data;
  console.log(data.chapter);
});
```

### Using `GetChapter`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getChapterRef, GetChapterVariables } from '@dataconnect/generated';

// The `GetChapter` query requires an argument of type `GetChapterVariables`:
const getChapterVars: GetChapterVariables = {
  id: ..., 
};

// Call the `getChapterRef()` function to get a reference to the query.
const ref = getChapterRef(getChapterVars);
// Variables can be defined inline as well.
const ref = getChapterRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getChapterRef(dataConnect, getChapterVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.chapter);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.chapter);
});
```

## ListChapters
You can execute the `ListChapters` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listChapters(options?: ExecuteQueryOptions): QueryPromise<ListChaptersData, undefined>;

interface ListChaptersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListChaptersData, undefined>;
}
export const listChaptersRef: ListChaptersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listChapters(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListChaptersData, undefined>;

interface ListChaptersRef {
  ...
  (dc: DataConnect): QueryRef<ListChaptersData, undefined>;
}
export const listChaptersRef: ListChaptersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listChaptersRef:
```typescript
const name = listChaptersRef.operationName;
console.log(name);
```

### Variables
The `ListChapters` query has no variables.
### Return Type
Recall that executing the `ListChapters` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListChaptersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListChaptersData {
  chapters: ({
    title: string;
    chapterNumber: number;
  })[];
}
```
### Using `ListChapters`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listChapters } from '@dataconnect/generated';


// Call the `listChapters()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listChapters();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listChapters(dataConnect);

console.log(data.chapters);

// Or, you can use the `Promise` API.
listChapters().then((response) => {
  const data = response.data;
  console.log(data.chapters);
});
```

### Using `ListChapters`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listChaptersRef } from '@dataconnect/generated';


// Call the `listChaptersRef()` function to get a reference to the query.
const ref = listChaptersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listChaptersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.chapters);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.chapters);
});
```

## GetLesson
You can execute the `GetLesson` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getLesson(vars: GetLessonVariables, options?: ExecuteQueryOptions): QueryPromise<GetLessonData, GetLessonVariables>;

interface GetLessonRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLessonVariables): QueryRef<GetLessonData, GetLessonVariables>;
}
export const getLessonRef: GetLessonRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getLesson(dc: DataConnect, vars: GetLessonVariables, options?: ExecuteQueryOptions): QueryPromise<GetLessonData, GetLessonVariables>;

interface GetLessonRef {
  ...
  (dc: DataConnect, vars: GetLessonVariables): QueryRef<GetLessonData, GetLessonVariables>;
}
export const getLessonRef: GetLessonRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getLessonRef:
```typescript
const name = getLessonRef.operationName;
console.log(name);
```

### Variables
The `GetLesson` query requires an argument of type `GetLessonVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetLessonVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetLesson` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetLessonData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetLessonData {
  lesson?: {
    title: string;
    contentBody: string;
  };
}
```
### Using `GetLesson`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getLesson, GetLessonVariables } from '@dataconnect/generated';

// The `GetLesson` query requires an argument of type `GetLessonVariables`:
const getLessonVars: GetLessonVariables = {
  id: ..., 
};

// Call the `getLesson()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getLesson(getLessonVars);
// Variables can be defined inline as well.
const { data } = await getLesson({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getLesson(dataConnect, getLessonVars);

console.log(data.lesson);

// Or, you can use the `Promise` API.
getLesson(getLessonVars).then((response) => {
  const data = response.data;
  console.log(data.lesson);
});
```

### Using `GetLesson`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getLessonRef, GetLessonVariables } from '@dataconnect/generated';

// The `GetLesson` query requires an argument of type `GetLessonVariables`:
const getLessonVars: GetLessonVariables = {
  id: ..., 
};

// Call the `getLessonRef()` function to get a reference to the query.
const ref = getLessonRef(getLessonVars);
// Variables can be defined inline as well.
const ref = getLessonRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getLessonRef(dataConnect, getLessonVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.lesson);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.lesson);
});
```

## ListLessons
You can execute the `ListLessons` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listLessons(options?: ExecuteQueryOptions): QueryPromise<ListLessonsData, undefined>;

interface ListLessonsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListLessonsData, undefined>;
}
export const listLessonsRef: ListLessonsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listLessons(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListLessonsData, undefined>;

interface ListLessonsRef {
  ...
  (dc: DataConnect): QueryRef<ListLessonsData, undefined>;
}
export const listLessonsRef: ListLessonsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listLessonsRef:
```typescript
const name = listLessonsRef.operationName;
console.log(name);
```

### Variables
The `ListLessons` query has no variables.
### Return Type
Recall that executing the `ListLessons` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListLessonsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListLessonsData {
  lessons: ({
    title: string;
  })[];
}
```
### Using `ListLessons`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listLessons } from '@dataconnect/generated';


// Call the `listLessons()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listLessons();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listLessons(dataConnect);

console.log(data.lessons);

// Or, you can use the `Promise` API.
listLessons().then((response) => {
  const data = response.data;
  console.log(data.lessons);
});
```

### Using `ListLessons`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listLessonsRef } from '@dataconnect/generated';


// Call the `listLessonsRef()` function to get a reference to the query.
const ref = listLessonsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listLessonsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.lessons);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.lessons);
});
```

## GetQuiz
You can execute the `GetQuiz` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getQuiz(vars: GetQuizVariables, options?: ExecuteQueryOptions): QueryPromise<GetQuizData, GetQuizVariables>;

interface GetQuizRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetQuizVariables): QueryRef<GetQuizData, GetQuizVariables>;
}
export const getQuizRef: GetQuizRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getQuiz(dc: DataConnect, vars: GetQuizVariables, options?: ExecuteQueryOptions): QueryPromise<GetQuizData, GetQuizVariables>;

interface GetQuizRef {
  ...
  (dc: DataConnect, vars: GetQuizVariables): QueryRef<GetQuizData, GetQuizVariables>;
}
export const getQuizRef: GetQuizRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getQuizRef:
```typescript
const name = getQuizRef.operationName;
console.log(name);
```

### Variables
The `GetQuiz` query requires an argument of type `GetQuizVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetQuizVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetQuiz` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetQuizData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetQuizData {
  quiz?: {
    title: string;
    passingScore: number;
  };
}
```
### Using `GetQuiz`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getQuiz, GetQuizVariables } from '@dataconnect/generated';

// The `GetQuiz` query requires an argument of type `GetQuizVariables`:
const getQuizVars: GetQuizVariables = {
  id: ..., 
};

// Call the `getQuiz()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getQuiz(getQuizVars);
// Variables can be defined inline as well.
const { data } = await getQuiz({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getQuiz(dataConnect, getQuizVars);

console.log(data.quiz);

// Or, you can use the `Promise` API.
getQuiz(getQuizVars).then((response) => {
  const data = response.data;
  console.log(data.quiz);
});
```

### Using `GetQuiz`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getQuizRef, GetQuizVariables } from '@dataconnect/generated';

// The `GetQuiz` query requires an argument of type `GetQuizVariables`:
const getQuizVars: GetQuizVariables = {
  id: ..., 
};

// Call the `getQuizRef()` function to get a reference to the query.
const ref = getQuizRef(getQuizVars);
// Variables can be defined inline as well.
const ref = getQuizRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getQuizRef(dataConnect, getQuizVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.quiz);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.quiz);
});
```

## ListQuizzes
You can execute the `ListQuizzes` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listQuizzes(options?: ExecuteQueryOptions): QueryPromise<ListQuizzesData, undefined>;

interface ListQuizzesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListQuizzesData, undefined>;
}
export const listQuizzesRef: ListQuizzesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listQuizzes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListQuizzesData, undefined>;

interface ListQuizzesRef {
  ...
  (dc: DataConnect): QueryRef<ListQuizzesData, undefined>;
}
export const listQuizzesRef: ListQuizzesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listQuizzesRef:
```typescript
const name = listQuizzesRef.operationName;
console.log(name);
```

### Variables
The `ListQuizzes` query has no variables.
### Return Type
Recall that executing the `ListQuizzes` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListQuizzesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListQuizzesData {
  quizzes: ({
    title: string;
  })[];
}
```
### Using `ListQuizzes`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listQuizzes } from '@dataconnect/generated';


// Call the `listQuizzes()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listQuizzes();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listQuizzes(dataConnect);

console.log(data.quizzes);

// Or, you can use the `Promise` API.
listQuizzes().then((response) => {
  const data = response.data;
  console.log(data.quizzes);
});
```

### Using `ListQuizzes`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listQuizzesRef } from '@dataconnect/generated';


// Call the `listQuizzesRef()` function to get a reference to the query.
const ref = listQuizzesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listQuizzesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.quizzes);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.quizzes);
});
```

## GetUserProgress
You can execute the `GetUserProgress` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserProgress(options?: ExecuteQueryOptions): QueryPromise<GetUserProgressData, undefined>;

interface GetUserProgressRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserProgressData, undefined>;
}
export const getUserProgressRef: GetUserProgressRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserProgress(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserProgressData, undefined>;

interface GetUserProgressRef {
  ...
  (dc: DataConnect): QueryRef<GetUserProgressData, undefined>;
}
export const getUserProgressRef: GetUserProgressRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserProgressRef:
```typescript
const name = getUserProgressRef.operationName;
console.log(name);
```

### Variables
The `GetUserProgress` query has no variables.
### Return Type
Recall that executing the `GetUserProgress` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserProgressData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserProgressData {
  userProgresses: ({
    score: number;
    status: string;
    lesson: {
      title: string;
    };
  })[];
}
```
### Using `GetUserProgress`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserProgress } from '@dataconnect/generated';


// Call the `getUserProgress()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserProgress();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserProgress(dataConnect);

console.log(data.userProgresses);

// Or, you can use the `Promise` API.
getUserProgress().then((response) => {
  const data = response.data;
  console.log(data.userProgresses);
});
```

### Using `GetUserProgress`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserProgressRef } from '@dataconnect/generated';


// Call the `getUserProgressRef()` function to get a reference to the query.
const ref = getUserProgressRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserProgressRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userProgresses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userProgresses);
});
```

## ListAllProgress
You can execute the `ListAllProgress` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllProgress(options?: ExecuteQueryOptions): QueryPromise<ListAllProgressData, undefined>;

interface ListAllProgressRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllProgressData, undefined>;
}
export const listAllProgressRef: ListAllProgressRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllProgress(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllProgressData, undefined>;

interface ListAllProgressRef {
  ...
  (dc: DataConnect): QueryRef<ListAllProgressData, undefined>;
}
export const listAllProgressRef: ListAllProgressRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllProgressRef:
```typescript
const name = listAllProgressRef.operationName;
console.log(name);
```

### Variables
The `ListAllProgress` query has no variables.
### Return Type
Recall that executing the `ListAllProgress` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllProgressData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllProgressData {
  userProgresses: ({
    user: {
      name: string;
    };
    score: number;
  })[];
}
```
### Using `ListAllProgress`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllProgress } from '@dataconnect/generated';


// Call the `listAllProgress()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllProgress();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllProgress(dataConnect);

console.log(data.userProgresses);

// Or, you can use the `Promise` API.
listAllProgress().then((response) => {
  const data = response.data;
  console.log(data.userProgresses);
});
```

### Using `ListAllProgress`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllProgressRef } from '@dataconnect/generated';


// Call the `listAllProgressRef()` function to get a reference to the query.
const ref = listAllProgressRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllProgressRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.userProgresses);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.userProgresses);
});
```

## GetUserBadges
You can execute the `GetUserBadges` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getUserBadges(options?: ExecuteQueryOptions): QueryPromise<GetUserBadgesData, undefined>;

interface GetUserBadgesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserBadgesData, undefined>;
}
export const getUserBadgesRef: GetUserBadgesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getUserBadges(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserBadgesData, undefined>;

interface GetUserBadgesRef {
  ...
  (dc: DataConnect): QueryRef<GetUserBadgesData, undefined>;
}
export const getUserBadgesRef: GetUserBadgesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getUserBadgesRef:
```typescript
const name = getUserBadgesRef.operationName;
console.log(name);
```

### Variables
The `GetUserBadges` query has no variables.
### Return Type
Recall that executing the `GetUserBadges` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetUserBadgesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetUserBadgesData {
  badges: ({
    name: string;
    criteriaDescription: string;
  })[];
}
```
### Using `GetUserBadges`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getUserBadges } from '@dataconnect/generated';


// Call the `getUserBadges()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getUserBadges();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getUserBadges(dataConnect);

console.log(data.badges);

// Or, you can use the `Promise` API.
getUserBadges().then((response) => {
  const data = response.data;
  console.log(data.badges);
});
```

### Using `GetUserBadges`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getUserBadgesRef } from '@dataconnect/generated';


// Call the `getUserBadgesRef()` function to get a reference to the query.
const ref = getUserBadgesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getUserBadgesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.badges);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.badges);
});
```

## ListBadges
You can execute the `ListBadges` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listBadges(options?: ExecuteQueryOptions): QueryPromise<ListBadgesData, undefined>;

interface ListBadgesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBadgesData, undefined>;
}
export const listBadgesRef: ListBadgesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listBadges(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBadgesData, undefined>;

interface ListBadgesRef {
  ...
  (dc: DataConnect): QueryRef<ListBadgesData, undefined>;
}
export const listBadgesRef: ListBadgesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listBadgesRef:
```typescript
const name = listBadgesRef.operationName;
console.log(name);
```

### Variables
The `ListBadges` query has no variables.
### Return Type
Recall that executing the `ListBadges` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListBadgesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListBadgesData {
  badges: ({
    name: string;
    user: {
      name: string;
    };
  })[];
}
```
### Using `ListBadges`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listBadges } from '@dataconnect/generated';


// Call the `listBadges()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listBadges();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listBadges(dataConnect);

console.log(data.badges);

// Or, you can use the `Promise` API.
listBadges().then((response) => {
  const data = response.data;
  console.log(data.badges);
});
```

### Using `ListBadges`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listBadgesRef } from '@dataconnect/generated';


// Call the `listBadgesRef()` function to get a reference to the query.
const ref = listBadgesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listBadgesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.badges);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.badges);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation has no variables.
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser } from '@dataconnect/generated';


// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef } from '@dataconnect/generated';


// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateUser
You can execute the `UpdateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUser(): MutationPromise<UpdateUserData, undefined>;

interface UpdateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserData, undefined>;
}
export const updateUserRef: UpdateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUser(dc: DataConnect): MutationPromise<UpdateUserData, undefined>;

interface UpdateUserRef {
  ...
  (dc: DataConnect): MutationRef<UpdateUserData, undefined>;
}
export const updateUserRef: UpdateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserRef:
```typescript
const name = updateUserRef.operationName;
console.log(name);
```

### Variables
The `UpdateUser` mutation has no variables.
### Return Type
Recall that executing the `UpdateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserData {
  user_update?: User_Key | null;
}
```
### Using `UpdateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUser } from '@dataconnect/generated';


// Call the `updateUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUser(dataConnect);

console.log(data.user_update);

// Or, you can use the `Promise` API.
updateUser().then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

### Using `UpdateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserRef } from '@dataconnect/generated';


// Call the `updateUserRef()` function to get a reference to the mutation.
const ref = updateUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_update);
});
```

## DeleteUser
You can execute the `DeleteUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteUser(): MutationPromise<DeleteUserData, undefined>;

interface DeleteUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
}
export const deleteUserRef: DeleteUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface DeleteUserRef {
  ...
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
}
export const deleteUserRef: DeleteUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserRef:
```typescript
const name = deleteUserRef.operationName;
console.log(name);
```

### Variables
The `DeleteUser` mutation has no variables.
### Return Type
Recall that executing the `DeleteUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserData {
  user_delete?: User_Key | null;
}
```
### Using `DeleteUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUser } from '@dataconnect/generated';


// Call the `deleteUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUser(dataConnect);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
deleteUser().then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

### Using `DeleteUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserRef } from '@dataconnect/generated';


// Call the `deleteUserRef()` function to get a reference to the mutation.
const ref = deleteUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_delete);
});
```

## CreateChapter
You can execute the `CreateChapter` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createChapter(): MutationPromise<CreateChapterData, undefined>;

interface CreateChapterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateChapterData, undefined>;
}
export const createChapterRef: CreateChapterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createChapter(dc: DataConnect): MutationPromise<CreateChapterData, undefined>;

interface CreateChapterRef {
  ...
  (dc: DataConnect): MutationRef<CreateChapterData, undefined>;
}
export const createChapterRef: CreateChapterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createChapterRef:
```typescript
const name = createChapterRef.operationName;
console.log(name);
```

### Variables
The `CreateChapter` mutation has no variables.
### Return Type
Recall that executing the `CreateChapter` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateChapterData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateChapterData {
  chapter_insert: Chapter_Key;
}
```
### Using `CreateChapter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createChapter } from '@dataconnect/generated';


// Call the `createChapter()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createChapter();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createChapter(dataConnect);

console.log(data.chapter_insert);

// Or, you can use the `Promise` API.
createChapter().then((response) => {
  const data = response.data;
  console.log(data.chapter_insert);
});
```

### Using `CreateChapter`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createChapterRef } from '@dataconnect/generated';


// Call the `createChapterRef()` function to get a reference to the mutation.
const ref = createChapterRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createChapterRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.chapter_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.chapter_insert);
});
```

## UpdateChapter
You can execute the `UpdateChapter` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateChapter(vars: UpdateChapterVariables): MutationPromise<UpdateChapterData, UpdateChapterVariables>;

interface UpdateChapterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateChapterVariables): MutationRef<UpdateChapterData, UpdateChapterVariables>;
}
export const updateChapterRef: UpdateChapterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateChapter(dc: DataConnect, vars: UpdateChapterVariables): MutationPromise<UpdateChapterData, UpdateChapterVariables>;

interface UpdateChapterRef {
  ...
  (dc: DataConnect, vars: UpdateChapterVariables): MutationRef<UpdateChapterData, UpdateChapterVariables>;
}
export const updateChapterRef: UpdateChapterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateChapterRef:
```typescript
const name = updateChapterRef.operationName;
console.log(name);
```

### Variables
The `UpdateChapter` mutation requires an argument of type `UpdateChapterVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateChapterVariables {
  id: UUIDString;
  title: string;
}
```
### Return Type
Recall that executing the `UpdateChapter` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateChapterData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateChapterData {
  chapter_update?: Chapter_Key | null;
}
```
### Using `UpdateChapter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateChapter, UpdateChapterVariables } from '@dataconnect/generated';

// The `UpdateChapter` mutation requires an argument of type `UpdateChapterVariables`:
const updateChapterVars: UpdateChapterVariables = {
  id: ..., 
  title: ..., 
};

// Call the `updateChapter()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateChapter(updateChapterVars);
// Variables can be defined inline as well.
const { data } = await updateChapter({ id: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateChapter(dataConnect, updateChapterVars);

console.log(data.chapter_update);

// Or, you can use the `Promise` API.
updateChapter(updateChapterVars).then((response) => {
  const data = response.data;
  console.log(data.chapter_update);
});
```

### Using `UpdateChapter`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateChapterRef, UpdateChapterVariables } from '@dataconnect/generated';

// The `UpdateChapter` mutation requires an argument of type `UpdateChapterVariables`:
const updateChapterVars: UpdateChapterVariables = {
  id: ..., 
  title: ..., 
};

// Call the `updateChapterRef()` function to get a reference to the mutation.
const ref = updateChapterRef(updateChapterVars);
// Variables can be defined inline as well.
const ref = updateChapterRef({ id: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateChapterRef(dataConnect, updateChapterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.chapter_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.chapter_update);
});
```

## DeleteChapter
You can execute the `DeleteChapter` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteChapter(vars: DeleteChapterVariables): MutationPromise<DeleteChapterData, DeleteChapterVariables>;

interface DeleteChapterRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteChapterVariables): MutationRef<DeleteChapterData, DeleteChapterVariables>;
}
export const deleteChapterRef: DeleteChapterRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteChapter(dc: DataConnect, vars: DeleteChapterVariables): MutationPromise<DeleteChapterData, DeleteChapterVariables>;

interface DeleteChapterRef {
  ...
  (dc: DataConnect, vars: DeleteChapterVariables): MutationRef<DeleteChapterData, DeleteChapterVariables>;
}
export const deleteChapterRef: DeleteChapterRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteChapterRef:
```typescript
const name = deleteChapterRef.operationName;
console.log(name);
```

### Variables
The `DeleteChapter` mutation requires an argument of type `DeleteChapterVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteChapterVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteChapter` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteChapterData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteChapterData {
  chapter_delete?: Chapter_Key | null;
}
```
### Using `DeleteChapter`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteChapter, DeleteChapterVariables } from '@dataconnect/generated';

// The `DeleteChapter` mutation requires an argument of type `DeleteChapterVariables`:
const deleteChapterVars: DeleteChapterVariables = {
  id: ..., 
};

// Call the `deleteChapter()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteChapter(deleteChapterVars);
// Variables can be defined inline as well.
const { data } = await deleteChapter({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteChapter(dataConnect, deleteChapterVars);

console.log(data.chapter_delete);

// Or, you can use the `Promise` API.
deleteChapter(deleteChapterVars).then((response) => {
  const data = response.data;
  console.log(data.chapter_delete);
});
```

### Using `DeleteChapter`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteChapterRef, DeleteChapterVariables } from '@dataconnect/generated';

// The `DeleteChapter` mutation requires an argument of type `DeleteChapterVariables`:
const deleteChapterVars: DeleteChapterVariables = {
  id: ..., 
};

// Call the `deleteChapterRef()` function to get a reference to the mutation.
const ref = deleteChapterRef(deleteChapterVars);
// Variables can be defined inline as well.
const ref = deleteChapterRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteChapterRef(dataConnect, deleteChapterVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.chapter_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.chapter_delete);
});
```

## CreateLesson
You can execute the `CreateLesson` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createLesson(vars: CreateLessonVariables): MutationPromise<CreateLessonData, CreateLessonVariables>;

interface CreateLessonRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLessonVariables): MutationRef<CreateLessonData, CreateLessonVariables>;
}
export const createLessonRef: CreateLessonRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createLesson(dc: DataConnect, vars: CreateLessonVariables): MutationPromise<CreateLessonData, CreateLessonVariables>;

interface CreateLessonRef {
  ...
  (dc: DataConnect, vars: CreateLessonVariables): MutationRef<CreateLessonData, CreateLessonVariables>;
}
export const createLessonRef: CreateLessonRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createLessonRef:
```typescript
const name = createLessonRef.operationName;
console.log(name);
```

### Variables
The `CreateLesson` mutation requires an argument of type `CreateLessonVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateLessonVariables {
  chapterId: UUIDString;
  title: string;
  body: string;
}
```
### Return Type
Recall that executing the `CreateLesson` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateLessonData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateLessonData {
  lesson_insert: Lesson_Key;
}
```
### Using `CreateLesson`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createLesson, CreateLessonVariables } from '@dataconnect/generated';

// The `CreateLesson` mutation requires an argument of type `CreateLessonVariables`:
const createLessonVars: CreateLessonVariables = {
  chapterId: ..., 
  title: ..., 
  body: ..., 
};

// Call the `createLesson()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createLesson(createLessonVars);
// Variables can be defined inline as well.
const { data } = await createLesson({ chapterId: ..., title: ..., body: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createLesson(dataConnect, createLessonVars);

console.log(data.lesson_insert);

// Or, you can use the `Promise` API.
createLesson(createLessonVars).then((response) => {
  const data = response.data;
  console.log(data.lesson_insert);
});
```

### Using `CreateLesson`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createLessonRef, CreateLessonVariables } from '@dataconnect/generated';

// The `CreateLesson` mutation requires an argument of type `CreateLessonVariables`:
const createLessonVars: CreateLessonVariables = {
  chapterId: ..., 
  title: ..., 
  body: ..., 
};

// Call the `createLessonRef()` function to get a reference to the mutation.
const ref = createLessonRef(createLessonVars);
// Variables can be defined inline as well.
const ref = createLessonRef({ chapterId: ..., title: ..., body: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createLessonRef(dataConnect, createLessonVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lesson_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lesson_insert);
});
```

## UpdateLesson
You can execute the `UpdateLesson` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateLesson(vars: UpdateLessonVariables): MutationPromise<UpdateLessonData, UpdateLessonVariables>;

interface UpdateLessonRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLessonVariables): MutationRef<UpdateLessonData, UpdateLessonVariables>;
}
export const updateLessonRef: UpdateLessonRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateLesson(dc: DataConnect, vars: UpdateLessonVariables): MutationPromise<UpdateLessonData, UpdateLessonVariables>;

interface UpdateLessonRef {
  ...
  (dc: DataConnect, vars: UpdateLessonVariables): MutationRef<UpdateLessonData, UpdateLessonVariables>;
}
export const updateLessonRef: UpdateLessonRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateLessonRef:
```typescript
const name = updateLessonRef.operationName;
console.log(name);
```

### Variables
The `UpdateLesson` mutation requires an argument of type `UpdateLessonVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateLessonVariables {
  id: UUIDString;
  title: string;
}
```
### Return Type
Recall that executing the `UpdateLesson` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateLessonData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateLessonData {
  lesson_update?: Lesson_Key | null;
}
```
### Using `UpdateLesson`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateLesson, UpdateLessonVariables } from '@dataconnect/generated';

// The `UpdateLesson` mutation requires an argument of type `UpdateLessonVariables`:
const updateLessonVars: UpdateLessonVariables = {
  id: ..., 
  title: ..., 
};

// Call the `updateLesson()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateLesson(updateLessonVars);
// Variables can be defined inline as well.
const { data } = await updateLesson({ id: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateLesson(dataConnect, updateLessonVars);

console.log(data.lesson_update);

// Or, you can use the `Promise` API.
updateLesson(updateLessonVars).then((response) => {
  const data = response.data;
  console.log(data.lesson_update);
});
```

### Using `UpdateLesson`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateLessonRef, UpdateLessonVariables } from '@dataconnect/generated';

// The `UpdateLesson` mutation requires an argument of type `UpdateLessonVariables`:
const updateLessonVars: UpdateLessonVariables = {
  id: ..., 
  title: ..., 
};

// Call the `updateLessonRef()` function to get a reference to the mutation.
const ref = updateLessonRef(updateLessonVars);
// Variables can be defined inline as well.
const ref = updateLessonRef({ id: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateLessonRef(dataConnect, updateLessonVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lesson_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lesson_update);
});
```

## DeleteLesson
You can execute the `DeleteLesson` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteLesson(vars: DeleteLessonVariables): MutationPromise<DeleteLessonData, DeleteLessonVariables>;

interface DeleteLessonRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteLessonVariables): MutationRef<DeleteLessonData, DeleteLessonVariables>;
}
export const deleteLessonRef: DeleteLessonRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteLesson(dc: DataConnect, vars: DeleteLessonVariables): MutationPromise<DeleteLessonData, DeleteLessonVariables>;

interface DeleteLessonRef {
  ...
  (dc: DataConnect, vars: DeleteLessonVariables): MutationRef<DeleteLessonData, DeleteLessonVariables>;
}
export const deleteLessonRef: DeleteLessonRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteLessonRef:
```typescript
const name = deleteLessonRef.operationName;
console.log(name);
```

### Variables
The `DeleteLesson` mutation requires an argument of type `DeleteLessonVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteLessonVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteLesson` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteLessonData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteLessonData {
  lesson_delete?: Lesson_Key | null;
}
```
### Using `DeleteLesson`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteLesson, DeleteLessonVariables } from '@dataconnect/generated';

// The `DeleteLesson` mutation requires an argument of type `DeleteLessonVariables`:
const deleteLessonVars: DeleteLessonVariables = {
  id: ..., 
};

// Call the `deleteLesson()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteLesson(deleteLessonVars);
// Variables can be defined inline as well.
const { data } = await deleteLesson({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteLesson(dataConnect, deleteLessonVars);

console.log(data.lesson_delete);

// Or, you can use the `Promise` API.
deleteLesson(deleteLessonVars).then((response) => {
  const data = response.data;
  console.log(data.lesson_delete);
});
```

### Using `DeleteLesson`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteLessonRef, DeleteLessonVariables } from '@dataconnect/generated';

// The `DeleteLesson` mutation requires an argument of type `DeleteLessonVariables`:
const deleteLessonVars: DeleteLessonVariables = {
  id: ..., 
};

// Call the `deleteLessonRef()` function to get a reference to the mutation.
const ref = deleteLessonRef(deleteLessonVars);
// Variables can be defined inline as well.
const ref = deleteLessonRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteLessonRef(dataConnect, deleteLessonVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.lesson_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.lesson_delete);
});
```

## CreateQuiz
You can execute the `CreateQuiz` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createQuiz(vars: CreateQuizVariables): MutationPromise<CreateQuizData, CreateQuizVariables>;

interface CreateQuizRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateQuizVariables): MutationRef<CreateQuizData, CreateQuizVariables>;
}
export const createQuizRef: CreateQuizRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createQuiz(dc: DataConnect, vars: CreateQuizVariables): MutationPromise<CreateQuizData, CreateQuizVariables>;

interface CreateQuizRef {
  ...
  (dc: DataConnect, vars: CreateQuizVariables): MutationRef<CreateQuizData, CreateQuizVariables>;
}
export const createQuizRef: CreateQuizRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createQuizRef:
```typescript
const name = createQuizRef.operationName;
console.log(name);
```

### Variables
The `CreateQuiz` mutation requires an argument of type `CreateQuizVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateQuizVariables {
  lessonId: UUIDString;
  title: string;
}
```
### Return Type
Recall that executing the `CreateQuiz` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateQuizData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateQuizData {
  quiz_insert: Quiz_Key;
}
```
### Using `CreateQuiz`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createQuiz, CreateQuizVariables } from '@dataconnect/generated';

// The `CreateQuiz` mutation requires an argument of type `CreateQuizVariables`:
const createQuizVars: CreateQuizVariables = {
  lessonId: ..., 
  title: ..., 
};

// Call the `createQuiz()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createQuiz(createQuizVars);
// Variables can be defined inline as well.
const { data } = await createQuiz({ lessonId: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createQuiz(dataConnect, createQuizVars);

console.log(data.quiz_insert);

// Or, you can use the `Promise` API.
createQuiz(createQuizVars).then((response) => {
  const data = response.data;
  console.log(data.quiz_insert);
});
```

### Using `CreateQuiz`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createQuizRef, CreateQuizVariables } from '@dataconnect/generated';

// The `CreateQuiz` mutation requires an argument of type `CreateQuizVariables`:
const createQuizVars: CreateQuizVariables = {
  lessonId: ..., 
  title: ..., 
};

// Call the `createQuizRef()` function to get a reference to the mutation.
const ref = createQuizRef(createQuizVars);
// Variables can be defined inline as well.
const ref = createQuizRef({ lessonId: ..., title: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createQuizRef(dataConnect, createQuizVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.quiz_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.quiz_insert);
});
```

## UpdateQuiz
You can execute the `UpdateQuiz` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateQuiz(vars: UpdateQuizVariables): MutationPromise<UpdateQuizData, UpdateQuizVariables>;

interface UpdateQuizRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateQuizVariables): MutationRef<UpdateQuizData, UpdateQuizVariables>;
}
export const updateQuizRef: UpdateQuizRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateQuiz(dc: DataConnect, vars: UpdateQuizVariables): MutationPromise<UpdateQuizData, UpdateQuizVariables>;

interface UpdateQuizRef {
  ...
  (dc: DataConnect, vars: UpdateQuizVariables): MutationRef<UpdateQuizData, UpdateQuizVariables>;
}
export const updateQuizRef: UpdateQuizRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateQuizRef:
```typescript
const name = updateQuizRef.operationName;
console.log(name);
```

### Variables
The `UpdateQuiz` mutation requires an argument of type `UpdateQuizVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateQuizVariables {
  id: UUIDString;
  passingScore: number;
}
```
### Return Type
Recall that executing the `UpdateQuiz` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateQuizData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateQuizData {
  quiz_update?: Quiz_Key | null;
}
```
### Using `UpdateQuiz`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateQuiz, UpdateQuizVariables } from '@dataconnect/generated';

// The `UpdateQuiz` mutation requires an argument of type `UpdateQuizVariables`:
const updateQuizVars: UpdateQuizVariables = {
  id: ..., 
  passingScore: ..., 
};

// Call the `updateQuiz()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateQuiz(updateQuizVars);
// Variables can be defined inline as well.
const { data } = await updateQuiz({ id: ..., passingScore: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateQuiz(dataConnect, updateQuizVars);

console.log(data.quiz_update);

// Or, you can use the `Promise` API.
updateQuiz(updateQuizVars).then((response) => {
  const data = response.data;
  console.log(data.quiz_update);
});
```

### Using `UpdateQuiz`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateQuizRef, UpdateQuizVariables } from '@dataconnect/generated';

// The `UpdateQuiz` mutation requires an argument of type `UpdateQuizVariables`:
const updateQuizVars: UpdateQuizVariables = {
  id: ..., 
  passingScore: ..., 
};

// Call the `updateQuizRef()` function to get a reference to the mutation.
const ref = updateQuizRef(updateQuizVars);
// Variables can be defined inline as well.
const ref = updateQuizRef({ id: ..., passingScore: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateQuizRef(dataConnect, updateQuizVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.quiz_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.quiz_update);
});
```

## DeleteQuiz
You can execute the `DeleteQuiz` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteQuiz(vars: DeleteQuizVariables): MutationPromise<DeleteQuizData, DeleteQuizVariables>;

interface DeleteQuizRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteQuizVariables): MutationRef<DeleteQuizData, DeleteQuizVariables>;
}
export const deleteQuizRef: DeleteQuizRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteQuiz(dc: DataConnect, vars: DeleteQuizVariables): MutationPromise<DeleteQuizData, DeleteQuizVariables>;

interface DeleteQuizRef {
  ...
  (dc: DataConnect, vars: DeleteQuizVariables): MutationRef<DeleteQuizData, DeleteQuizVariables>;
}
export const deleteQuizRef: DeleteQuizRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteQuizRef:
```typescript
const name = deleteQuizRef.operationName;
console.log(name);
```

### Variables
The `DeleteQuiz` mutation requires an argument of type `DeleteQuizVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteQuizVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteQuiz` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteQuizData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteQuizData {
  quiz_delete?: Quiz_Key | null;
}
```
### Using `DeleteQuiz`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteQuiz, DeleteQuizVariables } from '@dataconnect/generated';

// The `DeleteQuiz` mutation requires an argument of type `DeleteQuizVariables`:
const deleteQuizVars: DeleteQuizVariables = {
  id: ..., 
};

// Call the `deleteQuiz()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteQuiz(deleteQuizVars);
// Variables can be defined inline as well.
const { data } = await deleteQuiz({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteQuiz(dataConnect, deleteQuizVars);

console.log(data.quiz_delete);

// Or, you can use the `Promise` API.
deleteQuiz(deleteQuizVars).then((response) => {
  const data = response.data;
  console.log(data.quiz_delete);
});
```

### Using `DeleteQuiz`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteQuizRef, DeleteQuizVariables } from '@dataconnect/generated';

// The `DeleteQuiz` mutation requires an argument of type `DeleteQuizVariables`:
const deleteQuizVars: DeleteQuizVariables = {
  id: ..., 
};

// Call the `deleteQuizRef()` function to get a reference to the mutation.
const ref = deleteQuizRef(deleteQuizVars);
// Variables can be defined inline as well.
const ref = deleteQuizRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteQuizRef(dataConnect, deleteQuizVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.quiz_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.quiz_delete);
});
```

## CreateUserProgress
You can execute the `CreateUserProgress` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUserProgress(vars: CreateUserProgressVariables): MutationPromise<CreateUserProgressData, CreateUserProgressVariables>;

interface CreateUserProgressRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserProgressVariables): MutationRef<CreateUserProgressData, CreateUserProgressVariables>;
}
export const createUserProgressRef: CreateUserProgressRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUserProgress(dc: DataConnect, vars: CreateUserProgressVariables): MutationPromise<CreateUserProgressData, CreateUserProgressVariables>;

interface CreateUserProgressRef {
  ...
  (dc: DataConnect, vars: CreateUserProgressVariables): MutationRef<CreateUserProgressData, CreateUserProgressVariables>;
}
export const createUserProgressRef: CreateUserProgressRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserProgressRef:
```typescript
const name = createUserProgressRef.operationName;
console.log(name);
```

### Variables
The `CreateUserProgress` mutation requires an argument of type `CreateUserProgressVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateUserProgressVariables {
  lessonId: UUIDString;
  score: number;
}
```
### Return Type
Recall that executing the `CreateUserProgress` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserProgressData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserProgressData {
  userProgress_insert: UserProgress_Key;
}
```
### Using `CreateUserProgress`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUserProgress, CreateUserProgressVariables } from '@dataconnect/generated';

// The `CreateUserProgress` mutation requires an argument of type `CreateUserProgressVariables`:
const createUserProgressVars: CreateUserProgressVariables = {
  lessonId: ..., 
  score: ..., 
};

// Call the `createUserProgress()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUserProgress(createUserProgressVars);
// Variables can be defined inline as well.
const { data } = await createUserProgress({ lessonId: ..., score: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUserProgress(dataConnect, createUserProgressVars);

console.log(data.userProgress_insert);

// Or, you can use the `Promise` API.
createUserProgress(createUserProgressVars).then((response) => {
  const data = response.data;
  console.log(data.userProgress_insert);
});
```

### Using `CreateUserProgress`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserProgressRef, CreateUserProgressVariables } from '@dataconnect/generated';

// The `CreateUserProgress` mutation requires an argument of type `CreateUserProgressVariables`:
const createUserProgressVars: CreateUserProgressVariables = {
  lessonId: ..., 
  score: ..., 
};

// Call the `createUserProgressRef()` function to get a reference to the mutation.
const ref = createUserProgressRef(createUserProgressVars);
// Variables can be defined inline as well.
const ref = createUserProgressRef({ lessonId: ..., score: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserProgressRef(dataConnect, createUserProgressVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userProgress_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userProgress_insert);
});
```

## UpdateUserProgress
You can execute the `UpdateUserProgress` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateUserProgress(vars: UpdateUserProgressVariables): MutationPromise<UpdateUserProgressData, UpdateUserProgressVariables>;

interface UpdateUserProgressRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserProgressVariables): MutationRef<UpdateUserProgressData, UpdateUserProgressVariables>;
}
export const updateUserProgressRef: UpdateUserProgressRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateUserProgress(dc: DataConnect, vars: UpdateUserProgressVariables): MutationPromise<UpdateUserProgressData, UpdateUserProgressVariables>;

interface UpdateUserProgressRef {
  ...
  (dc: DataConnect, vars: UpdateUserProgressVariables): MutationRef<UpdateUserProgressData, UpdateUserProgressVariables>;
}
export const updateUserProgressRef: UpdateUserProgressRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateUserProgressRef:
```typescript
const name = updateUserProgressRef.operationName;
console.log(name);
```

### Variables
The `UpdateUserProgress` mutation requires an argument of type `UpdateUserProgressVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateUserProgressVariables {
  id: UUIDString;
  score: number;
}
```
### Return Type
Recall that executing the `UpdateUserProgress` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateUserProgressData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateUserProgressData {
  userProgress_update?: UserProgress_Key | null;
}
```
### Using `UpdateUserProgress`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateUserProgress, UpdateUserProgressVariables } from '@dataconnect/generated';

// The `UpdateUserProgress` mutation requires an argument of type `UpdateUserProgressVariables`:
const updateUserProgressVars: UpdateUserProgressVariables = {
  id: ..., 
  score: ..., 
};

// Call the `updateUserProgress()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateUserProgress(updateUserProgressVars);
// Variables can be defined inline as well.
const { data } = await updateUserProgress({ id: ..., score: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateUserProgress(dataConnect, updateUserProgressVars);

console.log(data.userProgress_update);

// Or, you can use the `Promise` API.
updateUserProgress(updateUserProgressVars).then((response) => {
  const data = response.data;
  console.log(data.userProgress_update);
});
```

### Using `UpdateUserProgress`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateUserProgressRef, UpdateUserProgressVariables } from '@dataconnect/generated';

// The `UpdateUserProgress` mutation requires an argument of type `UpdateUserProgressVariables`:
const updateUserProgressVars: UpdateUserProgressVariables = {
  id: ..., 
  score: ..., 
};

// Call the `updateUserProgressRef()` function to get a reference to the mutation.
const ref = updateUserProgressRef(updateUserProgressVars);
// Variables can be defined inline as well.
const ref = updateUserProgressRef({ id: ..., score: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateUserProgressRef(dataConnect, updateUserProgressVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userProgress_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userProgress_update);
});
```

## DeleteUserProgress
You can execute the `DeleteUserProgress` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteUserProgress(vars: DeleteUserProgressVariables): MutationPromise<DeleteUserProgressData, DeleteUserProgressVariables>;

interface DeleteUserProgressRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUserProgressVariables): MutationRef<DeleteUserProgressData, DeleteUserProgressVariables>;
}
export const deleteUserProgressRef: DeleteUserProgressRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteUserProgress(dc: DataConnect, vars: DeleteUserProgressVariables): MutationPromise<DeleteUserProgressData, DeleteUserProgressVariables>;

interface DeleteUserProgressRef {
  ...
  (dc: DataConnect, vars: DeleteUserProgressVariables): MutationRef<DeleteUserProgressData, DeleteUserProgressVariables>;
}
export const deleteUserProgressRef: DeleteUserProgressRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteUserProgressRef:
```typescript
const name = deleteUserProgressRef.operationName;
console.log(name);
```

### Variables
The `DeleteUserProgress` mutation requires an argument of type `DeleteUserProgressVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteUserProgressVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteUserProgress` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteUserProgressData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteUserProgressData {
  userProgress_delete?: UserProgress_Key | null;
}
```
### Using `DeleteUserProgress`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteUserProgress, DeleteUserProgressVariables } from '@dataconnect/generated';

// The `DeleteUserProgress` mutation requires an argument of type `DeleteUserProgressVariables`:
const deleteUserProgressVars: DeleteUserProgressVariables = {
  id: ..., 
};

// Call the `deleteUserProgress()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteUserProgress(deleteUserProgressVars);
// Variables can be defined inline as well.
const { data } = await deleteUserProgress({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteUserProgress(dataConnect, deleteUserProgressVars);

console.log(data.userProgress_delete);

// Or, you can use the `Promise` API.
deleteUserProgress(deleteUserProgressVars).then((response) => {
  const data = response.data;
  console.log(data.userProgress_delete);
});
```

### Using `DeleteUserProgress`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteUserProgressRef, DeleteUserProgressVariables } from '@dataconnect/generated';

// The `DeleteUserProgress` mutation requires an argument of type `DeleteUserProgressVariables`:
const deleteUserProgressVars: DeleteUserProgressVariables = {
  id: ..., 
};

// Call the `deleteUserProgressRef()` function to get a reference to the mutation.
const ref = deleteUserProgressRef(deleteUserProgressVars);
// Variables can be defined inline as well.
const ref = deleteUserProgressRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteUserProgressRef(dataConnect, deleteUserProgressVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.userProgress_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.userProgress_delete);
});
```

## CreateBadge
You can execute the `CreateBadge` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createBadge(vars: CreateBadgeVariables): MutationPromise<CreateBadgeData, CreateBadgeVariables>;

interface CreateBadgeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBadgeVariables): MutationRef<CreateBadgeData, CreateBadgeVariables>;
}
export const createBadgeRef: CreateBadgeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createBadge(dc: DataConnect, vars: CreateBadgeVariables): MutationPromise<CreateBadgeData, CreateBadgeVariables>;

interface CreateBadgeRef {
  ...
  (dc: DataConnect, vars: CreateBadgeVariables): MutationRef<CreateBadgeData, CreateBadgeVariables>;
}
export const createBadgeRef: CreateBadgeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createBadgeRef:
```typescript
const name = createBadgeRef.operationName;
console.log(name);
```

### Variables
The `CreateBadge` mutation requires an argument of type `CreateBadgeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateBadgeVariables {
  userId: UUIDString;
  name: string;
}
```
### Return Type
Recall that executing the `CreateBadge` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateBadgeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateBadgeData {
  badge_insert: Badge_Key;
}
```
### Using `CreateBadge`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createBadge, CreateBadgeVariables } from '@dataconnect/generated';

// The `CreateBadge` mutation requires an argument of type `CreateBadgeVariables`:
const createBadgeVars: CreateBadgeVariables = {
  userId: ..., 
  name: ..., 
};

// Call the `createBadge()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createBadge(createBadgeVars);
// Variables can be defined inline as well.
const { data } = await createBadge({ userId: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createBadge(dataConnect, createBadgeVars);

console.log(data.badge_insert);

// Or, you can use the `Promise` API.
createBadge(createBadgeVars).then((response) => {
  const data = response.data;
  console.log(data.badge_insert);
});
```

### Using `CreateBadge`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createBadgeRef, CreateBadgeVariables } from '@dataconnect/generated';

// The `CreateBadge` mutation requires an argument of type `CreateBadgeVariables`:
const createBadgeVars: CreateBadgeVariables = {
  userId: ..., 
  name: ..., 
};

// Call the `createBadgeRef()` function to get a reference to the mutation.
const ref = createBadgeRef(createBadgeVars);
// Variables can be defined inline as well.
const ref = createBadgeRef({ userId: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createBadgeRef(dataConnect, createBadgeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.badge_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.badge_insert);
});
```

## UpdateBadge
You can execute the `UpdateBadge` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateBadge(vars: UpdateBadgeVariables): MutationPromise<UpdateBadgeData, UpdateBadgeVariables>;

interface UpdateBadgeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBadgeVariables): MutationRef<UpdateBadgeData, UpdateBadgeVariables>;
}
export const updateBadgeRef: UpdateBadgeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateBadge(dc: DataConnect, vars: UpdateBadgeVariables): MutationPromise<UpdateBadgeData, UpdateBadgeVariables>;

interface UpdateBadgeRef {
  ...
  (dc: DataConnect, vars: UpdateBadgeVariables): MutationRef<UpdateBadgeData, UpdateBadgeVariables>;
}
export const updateBadgeRef: UpdateBadgeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateBadgeRef:
```typescript
const name = updateBadgeRef.operationName;
console.log(name);
```

### Variables
The `UpdateBadge` mutation requires an argument of type `UpdateBadgeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateBadgeVariables {
  id: UUIDString;
  name: string;
}
```
### Return Type
Recall that executing the `UpdateBadge` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateBadgeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateBadgeData {
  badge_update?: Badge_Key | null;
}
```
### Using `UpdateBadge`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateBadge, UpdateBadgeVariables } from '@dataconnect/generated';

// The `UpdateBadge` mutation requires an argument of type `UpdateBadgeVariables`:
const updateBadgeVars: UpdateBadgeVariables = {
  id: ..., 
  name: ..., 
};

// Call the `updateBadge()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateBadge(updateBadgeVars);
// Variables can be defined inline as well.
const { data } = await updateBadge({ id: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateBadge(dataConnect, updateBadgeVars);

console.log(data.badge_update);

// Or, you can use the `Promise` API.
updateBadge(updateBadgeVars).then((response) => {
  const data = response.data;
  console.log(data.badge_update);
});
```

### Using `UpdateBadge`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateBadgeRef, UpdateBadgeVariables } from '@dataconnect/generated';

// The `UpdateBadge` mutation requires an argument of type `UpdateBadgeVariables`:
const updateBadgeVars: UpdateBadgeVariables = {
  id: ..., 
  name: ..., 
};

// Call the `updateBadgeRef()` function to get a reference to the mutation.
const ref = updateBadgeRef(updateBadgeVars);
// Variables can be defined inline as well.
const ref = updateBadgeRef({ id: ..., name: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateBadgeRef(dataConnect, updateBadgeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.badge_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.badge_update);
});
```

## DeleteBadge
You can execute the `DeleteBadge` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
deleteBadge(vars: DeleteBadgeVariables): MutationPromise<DeleteBadgeData, DeleteBadgeVariables>;

interface DeleteBadgeRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteBadgeVariables): MutationRef<DeleteBadgeData, DeleteBadgeVariables>;
}
export const deleteBadgeRef: DeleteBadgeRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
deleteBadge(dc: DataConnect, vars: DeleteBadgeVariables): MutationPromise<DeleteBadgeData, DeleteBadgeVariables>;

interface DeleteBadgeRef {
  ...
  (dc: DataConnect, vars: DeleteBadgeVariables): MutationRef<DeleteBadgeData, DeleteBadgeVariables>;
}
export const deleteBadgeRef: DeleteBadgeRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the deleteBadgeRef:
```typescript
const name = deleteBadgeRef.operationName;
console.log(name);
```

### Variables
The `DeleteBadge` mutation requires an argument of type `DeleteBadgeVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface DeleteBadgeVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `DeleteBadge` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `DeleteBadgeData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface DeleteBadgeData {
  badge_delete?: Badge_Key | null;
}
```
### Using `DeleteBadge`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, deleteBadge, DeleteBadgeVariables } from '@dataconnect/generated';

// The `DeleteBadge` mutation requires an argument of type `DeleteBadgeVariables`:
const deleteBadgeVars: DeleteBadgeVariables = {
  id: ..., 
};

// Call the `deleteBadge()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await deleteBadge(deleteBadgeVars);
// Variables can be defined inline as well.
const { data } = await deleteBadge({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await deleteBadge(dataConnect, deleteBadgeVars);

console.log(data.badge_delete);

// Or, you can use the `Promise` API.
deleteBadge(deleteBadgeVars).then((response) => {
  const data = response.data;
  console.log(data.badge_delete);
});
```

### Using `DeleteBadge`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, deleteBadgeRef, DeleteBadgeVariables } from '@dataconnect/generated';

// The `DeleteBadge` mutation requires an argument of type `DeleteBadgeVariables`:
const deleteBadgeVars: DeleteBadgeVariables = {
  id: ..., 
};

// Call the `deleteBadgeRef()` function to get a reference to the mutation.
const ref = deleteBadgeRef(deleteBadgeVars);
// Variables can be defined inline as well.
const ref = deleteBadgeRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = deleteBadgeRef(dataConnect, deleteBadgeVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.badge_delete);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.badge_delete);
});
```

