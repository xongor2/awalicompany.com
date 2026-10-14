import React from 'react';
import { CreditCard } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export const PaymentsPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader
      title="Payments"
      subtitle="Review and manage payments connected to Agency services."
    />

    <Card noPadding>
      <EmptyState
        icon={<CreditCard className="h-8 w-8" />}
        title="No payments yet"
        description="Agency payment records will appear here."
      />
    </Card>
  </div>
);
