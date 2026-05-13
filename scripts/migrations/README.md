# Database Migrations

This directory contains database schema migrations for the Student Management System.

## Schema Version

Current version: **1.0.0**

## Migration Files

Migration files are named with a timestamp prefix followed by a descriptive name:

- `001_initial_schema.ts`
- `002_add_comments_field.ts`
- etc.

## Creating a New Migration

1. Copy `template.ts` to a new file with an appropriate name
2. Update the `version`, `description`, and migration functions
3. Implement the `migrate()` function with your schema changes
4. Implement the `rollback()` function to revert changes
5. Test locally before applying to production

## Example Migration

```typescript
// scripts/migrations/002_add_comments_field.ts
import { connectDB, closeDB } from '@/lib/mongodb';
import StudentModel from '@/models/Student';

export const version = '1.1.0';
export const description = 'Add comments field to Student';

export async function migrate() {
  await connectDB();
  // Add the field with a default value
  await StudentModel.updateMany({}, { $set: { comments: [] } });
  console.log('✅ Migration completed');
  await closeDB();
}

export async function rollback() {
  await connectDB();
  // Remove the field
  await StudentModel.updateMany({}, { $unset: { comments: 1 } });
  console.log('✅ Rollback completed');
  await closeDB();
}
```

## Running Migrations

### Apply a Migration

```bash
ts-node migrations/001_initial_schema.ts
```

### Rollback a Migration

```bash
ts-node -e "import('./001_initial_schema.ts').then(m => m.rollback())"
```

## Best Practices

1. **Test migrations locally first** - Always test on a local database copy
2. **Keep migrations atomic** - Each migration should handle one logical change
3. **Document changes** - Include comments explaining what and why
4. **Version tracking** - Update the schema version in package.json
5. **Backup data** - Always backup production data before running migrations
6. **Dry run** - Test rollback procedures in staging
7. **Monitor performance** - Large migrations may need to be done in chunks

## Rollback Procedures

All migrations must include a rollback function to revert changes if needed:

```typescript
export async function rollback() {
  // Revert all changes made in migrate()
}
```

## Schema Versioning

Schema version is tracked in `package.json` under `scripts.schema:version`.
Update this when you create a new migration.

## Support

For questions about migrations, refer to the main documentation.
