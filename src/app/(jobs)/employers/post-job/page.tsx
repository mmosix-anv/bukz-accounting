import type { Metadata } from 'next';
import { PostJobForm } from './post-job-form';
import type { JobPostingPackageSetting } from '@bukz/db';
import { getPlatformSettingDefault, getJobPostingPackageSettingKey } from '@bukz/db';

export const metadata: Metadata = { title: 'Post a Job | BUKZ Jobs' };

export default function PostJobPage() {
  const packages: JobPostingPackageSetting[] = [
    getPlatformSettingDefault(getJobPostingPackageSettingKey('single')) as JobPostingPackageSetting,
    getPlatformSettingDefault(getJobPostingPackageSettingKey('triple')) as JobPostingPackageSetting,
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Post a Job</h1>
        <p className="mt-1 text-slate-500">Reach thousands of qualified accounting &amp; finance professionals</p>
      </div>
      <PostJobForm packages={packages} />
    </div>
  );
}
