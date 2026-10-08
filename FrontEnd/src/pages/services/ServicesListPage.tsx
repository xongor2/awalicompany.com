import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  BriefcaseBusiness,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  RotateCcw,
  GraduationCap,
  TrendingUp,
  Globe2,
  Building
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { ActionMenu } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { ServiceDetailModal } from './ServiceDetailModal';
import { ServiceFormModal } from './ServiceFormModal';
import { Service } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

interface ServicesListPageProps {
  initialSearch?: string;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
}

export const ServicesListPage: React.FC<ServicesListPageProps> = ({
  initialSearch = '',
  isAddModalOpen = false,
  onCloseAddModal,
}) => {
  const { showToast } = useToast();

  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState(initialSearch);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(isAddModalOpen);
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null);
  const [viewService, setViewService] = useState<Service | null>(null);
  const [deleteService, setDeleteService] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isAddModalOpen) setIsFormOpen(true);
  }, [isAddModalOpen]);

  const loadServices = async () => {
    try {
      setIsLoading(true);
      const data = await api.getServices({
        search: search || undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      setServices(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load services', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [search, categoryFilter, statusFilter]);

  const handleDeleteConfirm = async () => {
    if (!deleteService) return;
    setIsDeleting(true);
    try {
      await api.deleteService(deleteService.id);
      showToast('Service deleted successfully.', 'success');
      setDeleteService(null);
      loadServices();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete service.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Education':
        return <GraduationCap className="w-4 h-4 text-blue-500" />;
      case 'Consulting':
        return <TrendingUp className="w-4 h-4 text-[#FF7817]" />;
      case 'Import / Export':
        return <Globe2 className="w-4 h-4 text-[#FF7817]" />;
      case 'Real Estate':
        return <Building className="w-4 h-4 text-purple-500" />;
      default:
        return <BriefcaseBusiness className="w-4 h-4 text-[#8A90A2]" />;
    }
  };

  const stripHtml = (html?: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
  };

  const categories = ['All', 'Education', 'Consulting', 'Import / Export', 'Real Estate'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Consulting"
        subtitle="Manage AW Ali Company consulting services and engagements"
        action={
          <Button
            variant="accent"
            onClick={() => {
              setServiceToEdit(null);
              setIsFormOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Service
          </Button>
        }
      />

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#151A46] text-white dark:bg-[#FF7817] shadow-sm'
                  : 'bg-white dark:bg-[#151A46] text-[#5F667A] dark:text-[#D9DDE8] border border-[#D9DDE8] dark:border-[#252B5C] hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search & Status Filter */}
        <div className="flex items-center gap-3">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search service title, scope..."
            width="w-full sm:w-64"
          />

          <div className="w-32">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Active', label: 'Active' },
                { value: 'Pending', label: 'Pending' },
                { value: 'Inactive', label: 'Inactive' },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </Card>
          ))}
        </div>
      ) : services.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BriefcaseBusiness className="w-8 h-8" />}
            title="No services match criteria"
            description="Adjust your category filter or search terms to see available services."
            actionLabel="Reset Search"
            onAction={() => {
              setSearch('');
              setCategoryFilter('All');
              setStatusFilter('All');
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <Card
              key={svc.id}
              className="flex flex-col h-full hover:border-[#FF7817]/40 transition-all overflow-hidden"
              noPadding
            >
              {/* Image banner */}
              <div className="relative aspect-video max-h-48 overflow-hidden bg-gray-100 dark:bg-[#0B1030]">
                <img
                  src={svc.image}
                  alt={svc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[#151A46]/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1.5">
                  {getCategoryIcon(svc.category)}
                  <span>{svc.category}</span>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={
                      svc.status === 'Active'
                        ? 'active'
                        : svc.status === 'Pending'
                        ? 'pending'
                        : 'inactive'
                    }
                  >
                    {svc.status}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    onClick={() => setViewService(svc)}
                    className="font-heading text-base font-bold text-[#171A2B] dark:text-white hover:text-[#FF7817] cursor-pointer mb-2 leading-snug"
                  >
                    {svc.title || svc.name}
                  </h3>
                  <p className="text-xs text-[#5F667A] dark:text-[#8A90A2] line-clamp-3 leading-relaxed mb-4">
                    {stripHtml(svc.description)}
                  </p>

                  {/* Feature pills */}
                  {svc.features && svc.features.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      {svc.features.slice(0, 3).map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-[11px] text-[#171A2B] dark:text-[#D9DDE8]"
                        >
                          <CheckCircle2 className="w-3 h-3 text-[#FF7817] shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer with Action Menu */}
                <div className="pt-3 border-t border-[#D9DDE8] dark:border-[#252B5C] flex items-center justify-between">
                  <button
                    onClick={() => setViewService(svc)}
                    className="text-xs font-semibold text-[#FF7817] hover:underline"
                  >
                    View Details
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setServiceToEdit(svc);
                        setIsFormOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-[#8A90A2] hover:text-[#FF7817] hover:bg-[#EEF0F5] dark:hover:bg-[#252B5C] transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteService(svc)}
                      className="p-1.5 rounded-lg text-[#8A90A2] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Service Form Modal */}
      <ServiceFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setServiceToEdit(null);
          if (onCloseAddModal) onCloseAddModal();
        }}
        onSuccess={loadServices}
        serviceToEdit={serviceToEdit}
      />

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={viewService}
        isOpen={!!viewService}
        onClose={() => setViewService(null)}
        onEdit={(svc) => {
          setServiceToEdit(svc);
          setIsFormOpen(true);
        }}
        onDelete={(svc) => setDeleteService(svc)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteService}
        onClose={() => setDeleteService(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Service Offering"
        message={`Are you sure you want to permanently delete "${deleteService?.name}" from company catalog?`}
      />
    </div>
  );
};
