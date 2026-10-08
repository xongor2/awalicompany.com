import React from 'react';
import { Settings } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

export const SettingsPage: React.FC = () => (
  <div className="space-y-6">
    <PageHeader
      title="Settings"
      subtitle="Manage system preferences and website configuration from one place."
    />

    <Card noPadding>
      <EmptyState
        icon={<Settings className="h-8 w-8" />}
        title="Settings"
        description="Website and system configuration options will appear here."
      />
    </Card>
  </div>
);
