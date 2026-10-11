import React from 'react';
import { ReceiptText } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export const InvoicesPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader
      title="Invoices"
      subtitle="Review and manage invoices connected to agency customers."
    />

    <Card noPadding>
      <EmptyState
        icon={<ReceiptText className="h-8 w-8" />}
        title="No invoices yet"
        description="Invoices created for agency customers will appear here."
      />
    </Card>
  </div>
);
