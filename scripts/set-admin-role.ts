import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const EMAIL = 'admin@bukzaccounting.co.uk';

async function run() {
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error('Failed to list users:', listError.message);
    process.exit(1);
  }

  const target = users.find((u) => u.email === EMAIL);
  if (!target) {
    console.error(`No user found with email: ${EMAIL}`);
    process.exit(1);
  }

  const { error } = await supabase.auth.admin.updateUserById(target.id, {
    user_metadata: { ...target.user_metadata, role: 'admin' },
  });

  if (error) {
    console.error('Failed to update user_metadata:', error.message);
    process.exit(1);
  }

  console.log(`✓ Set role=admin in user_metadata for ${EMAIL} (id: ${target.id})`);
}

void run();
