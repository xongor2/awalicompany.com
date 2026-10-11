import React from 'react';
import { ScrollText } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export const QuotationsPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader
      title="Quotations"
      subtitle="Create, review, and manage customer quotations from one place."
    />

    <Card noPadding>
      <EmptyState
        icon={<ScrollText className="h-8 w-8" />}
        title="No quotations yet"
        description="Customer quotations added to the system will appear here."
      />
    </Card>
  </div>
);
