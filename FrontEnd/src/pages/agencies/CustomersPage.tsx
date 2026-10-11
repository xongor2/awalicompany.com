import React from 'react';
import { ContactRound } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export const CustomersPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader
      title="Customers"
      subtitle="Manage customer records connected to agencies from one place."
    />

    <Card noPadding>
      <EmptyState
        icon={<ContactRound className="h-8 w-8" />}
        title="No customers yet"
        description="Customer records added to the agency system will appear here."
      />
    </Card>
  </div>
);
