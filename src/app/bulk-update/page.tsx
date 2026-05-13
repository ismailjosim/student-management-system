import { BulkUpdateHelp } from '@/components/bulk-update/BulkUpdateHelp';
import { BulkUpdateTabs } from '@/components/bulk-update/BulkUpdateTabs';

export default function BulkUpdatePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bulk Updates</h1>
        <p className="text-muted-foreground mt-1">
          Update multiple student records or assignments via batch data entry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <BulkUpdateHelp />
        </div>
        <div className="lg:col-span-2">
          <BulkUpdateTabs />
        </div>
      </div>
    </div>
  );
}
