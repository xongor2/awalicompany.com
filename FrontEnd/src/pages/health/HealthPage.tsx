import React from 'react';
import { HeartPulse } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export const HealthPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Health"
        subtitle="Manage health services and records from one place."
      />

      <Card noPadding>
        <EmptyState
          icon={<HeartPulse className="h-8 w-8" />}
          title="No health records yet"
          description="Health information added to the system will appear here."
        />
      </Card>
    </div>
  );
};
