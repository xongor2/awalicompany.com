import React from 'react';
import { Handshake } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export const ConsultingPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Consulting"
        subtitle="Manage consulting services and client engagements from one place."
      />

      <Card noPadding>
        <EmptyState
          icon={<Handshake className="h-8 w-8" />}
          title="No consulting records yet"
          description="Consulting information added to the system will appear here."
        />
      </Card>
    </div>
  );
};
