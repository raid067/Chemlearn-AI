# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createUser, updateUser, deleteUser, getCurrentUser, listUsers, createChapter, updateChapter, deleteChapter, getChapter, listChapters } from '@dataconnect/generated';


// Operation CreateUser: 
const { data } = await CreateUser(dataConnect);

// Operation UpdateUser: 
const { data } = await UpdateUser(dataConnect);

// Operation DeleteUser: 
const { data } = await DeleteUser(dataConnect);

// Operation GetCurrentUser: 
const { data } = await GetCurrentUser(dataConnect);

// Operation ListUsers: 
const { data } = await ListUsers(dataConnect);

// Operation CreateChapter: 
const { data } = await CreateChapter(dataConnect);

// Operation UpdateChapter:  For variables, look at type UpdateChapterVars in ../index.d.ts
const { data } = await UpdateChapter(dataConnect, updateChapterVars);

// Operation DeleteChapter:  For variables, look at type DeleteChapterVars in ../index.d.ts
const { data } = await DeleteChapter(dataConnect, deleteChapterVars);

// Operation GetChapter:  For variables, look at type GetChapterVars in ../index.d.ts
const { data } = await GetChapter(dataConnect, getChapterVars);

// Operation ListChapters: 
const { data } = await ListChapters(dataConnect);


```