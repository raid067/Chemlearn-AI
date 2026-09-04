import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Badge_Key {
  id: UUIDString;
  __typename?: 'Badge_Key';
}

export interface Chapter_Key {
  id: UUIDString;
  __typename?: 'Chapter_Key';
}

export interface CreateBadgeData {
  badge_insert: Badge_Key;
}

export interface CreateBadgeVariables {
  userId: UUIDString;
  name: string;
}

export interface CreateChapterData {
  chapter_insert: Chapter_Key;
}

export interface CreateLessonData {
  lesson_insert: Lesson_Key;
}

export interface CreateLessonVariables {
  chapterId: UUIDString;
  title: string;
  body: string;
}

export interface CreateQuizData {
  quiz_insert: Quiz_Key;
}

export interface CreateQuizVariables {
  lessonId: UUIDString;
  title: string;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserProgressData {
  userProgress_insert: UserProgress_Key;
}

export interface CreateUserProgressVariables {
  lessonId: UUIDString;
  score: number;
}

export interface DeleteBadgeData {
  badge_delete?: Badge_Key | null;
}

export interface DeleteBadgeVariables {
  id: UUIDString;
}

export interface DeleteChapterData {
  chapter_delete?: Chapter_Key | null;
}

export interface DeleteChapterVariables {
  id: UUIDString;
}

export interface DeleteLessonData {
  lesson_delete?: Lesson_Key | null;
}

export interface DeleteLessonVariables {
  id: UUIDString;
}

export interface DeleteQuizData {
  quiz_delete?: Quiz_Key | null;
}

export interface DeleteQuizVariables {
  id: UUIDString;
}

export interface DeleteUserData {
  user_delete?: User_Key | null;
}

export interface DeleteUserProgressData {
  userProgress_delete?: UserProgress_Key | null;
}

export interface DeleteUserProgressVariables {
  id: UUIDString;
}

export interface GetChapterData {
  chapter?: {
    title: string;
    description?: string | null;
    lessons_on_chapter: ({
      title: string;
    })[];
  };
}

export interface GetChapterVariables {
  id: UUIDString;
}

export interface GetCurrentUserData {
  user?: {
    name: string;
    email: string;
    points?: number | null;
  };
}

export interface GetLessonData {
  lesson?: {
    title: string;
    contentBody: string;
  };
}

export interface GetLessonVariables {
  id: UUIDString;
}

export interface GetQuizData {
  quiz?: {
    title: string;
    passingScore: number;
  };
}

export interface GetQuizVariables {
  id: UUIDString;
}

export interface GetUserBadgesData {
  badges: ({
    name: string;
    criteriaDescription: string;
  })[];
}

export interface GetUserProgressData {
  userProgresses: ({
    score: number;
    status: string;
    lesson: {
      title: string;
    };
  })[];
}

export interface Lesson_Key {
  id: UUIDString;
  __typename?: 'Lesson_Key';
}

export interface ListAllProgressData {
  userProgresses: ({
    user: {
      name: string;
    };
    score: number;
  })[];
}

export interface ListBadgesData {
  badges: ({
    name: string;
    user: {
      name: string;
    };
  })[];
}

export interface ListChaptersData {
  chapters: ({
    title: string;
    chapterNumber: number;
  })[];
}

export interface ListLessonsData {
  lessons: ({
    title: string;
  })[];
}

export interface ListQuizzesData {
  quizzes: ({
    title: string;
  })[];
}

export interface ListUsersData {
  users: ({
    name: string;
    schoolName?: string | null;
  })[];
}

export interface Quiz_Key {
  id: UUIDString;
  __typename?: 'Quiz_Key';
}

export interface UpdateBadgeData {
  badge_update?: Badge_Key | null;
}

export interface UpdateBadgeVariables {
  id: UUIDString;
  name: string;
}

export interface UpdateChapterData {
  chapter_update?: Chapter_Key | null;
}

export interface UpdateChapterVariables {
  id: UUIDString;
  title: string;
}

export interface UpdateLessonData {
  lesson_update?: Lesson_Key | null;
}

export interface UpdateLessonVariables {
  id: UUIDString;
  title: string;
}

export interface UpdateQuizData {
  quiz_update?: Quiz_Key | null;
}

export interface UpdateQuizVariables {
  id: UUIDString;
  passingScore: number;
}

export interface UpdateUserData {
  user_update?: User_Key | null;
}

export interface UpdateUserProgressData {
  userProgress_update?: UserProgress_Key | null;
}

export interface UpdateUserProgressVariables {
  id: UUIDString;
  score: number;
}

export interface UserProgress_Key {
  id: UUIDString;
  __typename?: 'UserProgress_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface UpdateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<UpdateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<UpdateUserData, undefined>;
  operationName: string;
}
export const updateUserRef: UpdateUserRef;

export function updateUser(): MutationPromise<UpdateUserData, undefined>;
export function updateUser(dc: DataConnect): MutationPromise<UpdateUserData, undefined>;

interface DeleteUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<DeleteUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<DeleteUserData, undefined>;
  operationName: string;
}
export const deleteUserRef: DeleteUserRef;

export function deleteUser(): MutationPromise<DeleteUserData, undefined>;
export function deleteUser(dc: DataConnect): MutationPromise<DeleteUserData, undefined>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface CreateChapterRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateChapterData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateChapterData, undefined>;
  operationName: string;
}
export const createChapterRef: CreateChapterRef;

export function createChapter(): MutationPromise<CreateChapterData, undefined>;
export function createChapter(dc: DataConnect): MutationPromise<CreateChapterData, undefined>;

interface UpdateChapterRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateChapterVariables): MutationRef<UpdateChapterData, UpdateChapterVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateChapterVariables): MutationRef<UpdateChapterData, UpdateChapterVariables>;
  operationName: string;
}
export const updateChapterRef: UpdateChapterRef;

export function updateChapter(vars: UpdateChapterVariables): MutationPromise<UpdateChapterData, UpdateChapterVariables>;
export function updateChapter(dc: DataConnect, vars: UpdateChapterVariables): MutationPromise<UpdateChapterData, UpdateChapterVariables>;

interface DeleteChapterRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteChapterVariables): MutationRef<DeleteChapterData, DeleteChapterVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteChapterVariables): MutationRef<DeleteChapterData, DeleteChapterVariables>;
  operationName: string;
}
export const deleteChapterRef: DeleteChapterRef;

export function deleteChapter(vars: DeleteChapterVariables): MutationPromise<DeleteChapterData, DeleteChapterVariables>;
export function deleteChapter(dc: DataConnect, vars: DeleteChapterVariables): MutationPromise<DeleteChapterData, DeleteChapterVariables>;

interface GetChapterRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetChapterVariables): QueryRef<GetChapterData, GetChapterVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetChapterVariables): QueryRef<GetChapterData, GetChapterVariables>;
  operationName: string;
}
export const getChapterRef: GetChapterRef;

export function getChapter(vars: GetChapterVariables, options?: ExecuteQueryOptions): QueryPromise<GetChapterData, GetChapterVariables>;
export function getChapter(dc: DataConnect, vars: GetChapterVariables, options?: ExecuteQueryOptions): QueryPromise<GetChapterData, GetChapterVariables>;

interface ListChaptersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListChaptersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListChaptersData, undefined>;
  operationName: string;
}
export const listChaptersRef: ListChaptersRef;

export function listChapters(options?: ExecuteQueryOptions): QueryPromise<ListChaptersData, undefined>;
export function listChapters(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListChaptersData, undefined>;

interface CreateLessonRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateLessonVariables): MutationRef<CreateLessonData, CreateLessonVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateLessonVariables): MutationRef<CreateLessonData, CreateLessonVariables>;
  operationName: string;
}
export const createLessonRef: CreateLessonRef;

export function createLesson(vars: CreateLessonVariables): MutationPromise<CreateLessonData, CreateLessonVariables>;
export function createLesson(dc: DataConnect, vars: CreateLessonVariables): MutationPromise<CreateLessonData, CreateLessonVariables>;

interface UpdateLessonRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateLessonVariables): MutationRef<UpdateLessonData, UpdateLessonVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateLessonVariables): MutationRef<UpdateLessonData, UpdateLessonVariables>;
  operationName: string;
}
export const updateLessonRef: UpdateLessonRef;

export function updateLesson(vars: UpdateLessonVariables): MutationPromise<UpdateLessonData, UpdateLessonVariables>;
export function updateLesson(dc: DataConnect, vars: UpdateLessonVariables): MutationPromise<UpdateLessonData, UpdateLessonVariables>;

interface DeleteLessonRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteLessonVariables): MutationRef<DeleteLessonData, DeleteLessonVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteLessonVariables): MutationRef<DeleteLessonData, DeleteLessonVariables>;
  operationName: string;
}
export const deleteLessonRef: DeleteLessonRef;

export function deleteLesson(vars: DeleteLessonVariables): MutationPromise<DeleteLessonData, DeleteLessonVariables>;
export function deleteLesson(dc: DataConnect, vars: DeleteLessonVariables): MutationPromise<DeleteLessonData, DeleteLessonVariables>;

interface GetLessonRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetLessonVariables): QueryRef<GetLessonData, GetLessonVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetLessonVariables): QueryRef<GetLessonData, GetLessonVariables>;
  operationName: string;
}
export const getLessonRef: GetLessonRef;

export function getLesson(vars: GetLessonVariables, options?: ExecuteQueryOptions): QueryPromise<GetLessonData, GetLessonVariables>;
export function getLesson(dc: DataConnect, vars: GetLessonVariables, options?: ExecuteQueryOptions): QueryPromise<GetLessonData, GetLessonVariables>;

interface ListLessonsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListLessonsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListLessonsData, undefined>;
  operationName: string;
}
export const listLessonsRef: ListLessonsRef;

export function listLessons(options?: ExecuteQueryOptions): QueryPromise<ListLessonsData, undefined>;
export function listLessons(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListLessonsData, undefined>;

interface CreateQuizRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateQuizVariables): MutationRef<CreateQuizData, CreateQuizVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateQuizVariables): MutationRef<CreateQuizData, CreateQuizVariables>;
  operationName: string;
}
export const createQuizRef: CreateQuizRef;

export function createQuiz(vars: CreateQuizVariables): MutationPromise<CreateQuizData, CreateQuizVariables>;
export function createQuiz(dc: DataConnect, vars: CreateQuizVariables): MutationPromise<CreateQuizData, CreateQuizVariables>;

interface UpdateQuizRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateQuizVariables): MutationRef<UpdateQuizData, UpdateQuizVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateQuizVariables): MutationRef<UpdateQuizData, UpdateQuizVariables>;
  operationName: string;
}
export const updateQuizRef: UpdateQuizRef;

export function updateQuiz(vars: UpdateQuizVariables): MutationPromise<UpdateQuizData, UpdateQuizVariables>;
export function updateQuiz(dc: DataConnect, vars: UpdateQuizVariables): MutationPromise<UpdateQuizData, UpdateQuizVariables>;

interface DeleteQuizRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteQuizVariables): MutationRef<DeleteQuizData, DeleteQuizVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteQuizVariables): MutationRef<DeleteQuizData, DeleteQuizVariables>;
  operationName: string;
}
export const deleteQuizRef: DeleteQuizRef;

export function deleteQuiz(vars: DeleteQuizVariables): MutationPromise<DeleteQuizData, DeleteQuizVariables>;
export function deleteQuiz(dc: DataConnect, vars: DeleteQuizVariables): MutationPromise<DeleteQuizData, DeleteQuizVariables>;

interface GetQuizRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetQuizVariables): QueryRef<GetQuizData, GetQuizVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetQuizVariables): QueryRef<GetQuizData, GetQuizVariables>;
  operationName: string;
}
export const getQuizRef: GetQuizRef;

export function getQuiz(vars: GetQuizVariables, options?: ExecuteQueryOptions): QueryPromise<GetQuizData, GetQuizVariables>;
export function getQuiz(dc: DataConnect, vars: GetQuizVariables, options?: ExecuteQueryOptions): QueryPromise<GetQuizData, GetQuizVariables>;

interface ListQuizzesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListQuizzesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListQuizzesData, undefined>;
  operationName: string;
}
export const listQuizzesRef: ListQuizzesRef;

export function listQuizzes(options?: ExecuteQueryOptions): QueryPromise<ListQuizzesData, undefined>;
export function listQuizzes(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListQuizzesData, undefined>;

interface CreateUserProgressRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserProgressVariables): MutationRef<CreateUserProgressData, CreateUserProgressVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserProgressVariables): MutationRef<CreateUserProgressData, CreateUserProgressVariables>;
  operationName: string;
}
export const createUserProgressRef: CreateUserProgressRef;

export function createUserProgress(vars: CreateUserProgressVariables): MutationPromise<CreateUserProgressData, CreateUserProgressVariables>;
export function createUserProgress(dc: DataConnect, vars: CreateUserProgressVariables): MutationPromise<CreateUserProgressData, CreateUserProgressVariables>;

interface UpdateUserProgressRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateUserProgressVariables): MutationRef<UpdateUserProgressData, UpdateUserProgressVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateUserProgressVariables): MutationRef<UpdateUserProgressData, UpdateUserProgressVariables>;
  operationName: string;
}
export const updateUserProgressRef: UpdateUserProgressRef;

export function updateUserProgress(vars: UpdateUserProgressVariables): MutationPromise<UpdateUserProgressData, UpdateUserProgressVariables>;
export function updateUserProgress(dc: DataConnect, vars: UpdateUserProgressVariables): MutationPromise<UpdateUserProgressData, UpdateUserProgressVariables>;

interface DeleteUserProgressRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteUserProgressVariables): MutationRef<DeleteUserProgressData, DeleteUserProgressVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteUserProgressVariables): MutationRef<DeleteUserProgressData, DeleteUserProgressVariables>;
  operationName: string;
}
export const deleteUserProgressRef: DeleteUserProgressRef;

export function deleteUserProgress(vars: DeleteUserProgressVariables): MutationPromise<DeleteUserProgressData, DeleteUserProgressVariables>;
export function deleteUserProgress(dc: DataConnect, vars: DeleteUserProgressVariables): MutationPromise<DeleteUserProgressData, DeleteUserProgressVariables>;

interface GetUserProgressRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserProgressData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserProgressData, undefined>;
  operationName: string;
}
export const getUserProgressRef: GetUserProgressRef;

export function getUserProgress(options?: ExecuteQueryOptions): QueryPromise<GetUserProgressData, undefined>;
export function getUserProgress(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserProgressData, undefined>;

interface ListAllProgressRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllProgressData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllProgressData, undefined>;
  operationName: string;
}
export const listAllProgressRef: ListAllProgressRef;

export function listAllProgress(options?: ExecuteQueryOptions): QueryPromise<ListAllProgressData, undefined>;
export function listAllProgress(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListAllProgressData, undefined>;

interface CreateBadgeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBadgeVariables): MutationRef<CreateBadgeData, CreateBadgeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBadgeVariables): MutationRef<CreateBadgeData, CreateBadgeVariables>;
  operationName: string;
}
export const createBadgeRef: CreateBadgeRef;

export function createBadge(vars: CreateBadgeVariables): MutationPromise<CreateBadgeData, CreateBadgeVariables>;
export function createBadge(dc: DataConnect, vars: CreateBadgeVariables): MutationPromise<CreateBadgeData, CreateBadgeVariables>;

interface UpdateBadgeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateBadgeVariables): MutationRef<UpdateBadgeData, UpdateBadgeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateBadgeVariables): MutationRef<UpdateBadgeData, UpdateBadgeVariables>;
  operationName: string;
}
export const updateBadgeRef: UpdateBadgeRef;

export function updateBadge(vars: UpdateBadgeVariables): MutationPromise<UpdateBadgeData, UpdateBadgeVariables>;
export function updateBadge(dc: DataConnect, vars: UpdateBadgeVariables): MutationPromise<UpdateBadgeData, UpdateBadgeVariables>;

interface DeleteBadgeRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: DeleteBadgeVariables): MutationRef<DeleteBadgeData, DeleteBadgeVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: DeleteBadgeVariables): MutationRef<DeleteBadgeData, DeleteBadgeVariables>;
  operationName: string;
}
export const deleteBadgeRef: DeleteBadgeRef;

export function deleteBadge(vars: DeleteBadgeVariables): MutationPromise<DeleteBadgeData, DeleteBadgeVariables>;
export function deleteBadge(dc: DataConnect, vars: DeleteBadgeVariables): MutationPromise<DeleteBadgeData, DeleteBadgeVariables>;

interface GetUserBadgesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserBadgesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserBadgesData, undefined>;
  operationName: string;
}
export const getUserBadgesRef: GetUserBadgesRef;

export function getUserBadges(options?: ExecuteQueryOptions): QueryPromise<GetUserBadgesData, undefined>;
export function getUserBadges(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetUserBadgesData, undefined>;

interface ListBadgesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListBadgesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListBadgesData, undefined>;
  operationName: string;
}
export const listBadgesRef: ListBadgesRef;

export function listBadges(options?: ExecuteQueryOptions): QueryPromise<ListBadgesData, undefined>;
export function listBadges(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListBadgesData, undefined>;

