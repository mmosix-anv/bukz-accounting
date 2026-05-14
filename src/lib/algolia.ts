import { algoliasearch } from 'algoliasearch';

export const algoliaAdmin = algoliasearch(
  process.env['NEXT_PUBLIC_ALGOLIA_APP_ID'] ?? '',
  process.env['ALGOLIA_ADMIN_KEY'] ?? '',
);

export const JOBS_INDEX = 'bukz_jobs';
export const LEARN_INDEX = 'bukz_learn';
