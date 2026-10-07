import React, { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Building2,
  XCircle,
  RotateCcw
} from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { ActionMenu } from '../../components/ui/Dropdown';
import { EmptyState } from '../../components/ui/EmptyState';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { PropertyDetailModal } from './PropertyDetailModal';
import { Property, PropertyLocationCategory } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../components/ui/Toast';

interface PropertiesListPageProps {
  initialSearch?: string;
  onOpenPropertyForm: (property?: Property) => void;
  selectedProperty?: Property | null;
  onClearSelectedProperty?: () => void;
}

export const PropertiesListPage: React.FC<PropertiesListPageProps> = ({
  initialSearch = '',
  onOpenPropertyForm,
  selectedProperty,
  onClearSelectedProperty,
}) => {
  const { showToast } = useToast();

  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters state
  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [countries, setCountries] = useState<PropertyLocationCategory[]>([]);
  const [cities, setCities] = useState<PropertyLocationCategory[]>([]);
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Detail and confirmation modal states
  const [viewProperty, setViewProperty] = useState<Property | null>(selectedProperty || null);
  const [deleteProperty, setDeleteProperty] = useState<Property | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (selectedProperty) setViewProperty(selectedProperty);
  }, [selectedProperty]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.getPropertyLocationCategories('Country'),
      api.getPropertyLocationCategories('City'),
    ])
      .then(([countryItems, cityItems]) => {
        if (cancelled) return;
        setCountries(countryItems);
        setCities(cityItems);
      })
      .catch((err: any) => {
        if (!cancelled) showToast(err.message || 'Failed to load location categories.', 'error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loadProperties = async () => {
    try {
      setIsLoading(true);
      const data = await api.getProperties({
        search: search || undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        location: cityFilter !== 'All'
          ? cityFilter
          : countryFilter !== 'All'
            ? countryFilter
            : undefined,
      });
      setProperties(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load properties', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter, countryFilter, cityFilter]);

  // Client-side sorting & pagination
  const processedProperties = useMemo(() => {
    let list = [...properties];
    if (countryFilter !== 'All') {
      list = list.filter(property => property.location.toLocaleLowerCase().includes(countryFilter.toLocaleLowerCase()));
    }
    if (cityFilter !== 'All') {
      list = list.filter(property => property.location.toLocaleLowerCase().includes(cityFilter.toLocaleLowerCase()));
    }
    if (priceSort === 'asc') list.sort((a, b) => a.price - b.price);
    if (priceSort === 'desc') list.sort((a, b) => b.price - a.price);
    return list;
  }, [properties, countryFilter, cityFilter, priceSort]);

  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedProperties.slice(start, start + pageSize);
  }, [processedProperties, currentPage, pageSize]);

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setStatusFilter('All');
    setCountryFilter('All');
    setCityFilter('All');
    setPriceSort('none');
    setCurrentPage(1);
  };

  const hasActiveFilters = search || typeFilter !== 'All' || statusFilter !== 'All' || countryFilter !== 'All' || cityFilter !== 'All' || priceSort !== 'none';

  const handleDeleteConfirm = async () => {
    if (!deleteProperty) return;
    setIsDeleting(true);
    try {
      await api.deleteProperty(deleteProperty.id);
      showToast('Property deleted successfully.', 'success');
      setDeleteProperty(null);
      loadProperties();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete property.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatCurrency = (val: number) => `Rs ${val.toLocaleString('en-PK')}`;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Real Estate Properties"
        subtitle="Manage commercial, residential, apartment, villa, and plot listings"
        action={
          <Button
            variant="accent"
            onClick={() => onOpenPropertyForm()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Property
          </Button>
        }
      />

      {/* Filter and Search Bar Card */}
      <Card noPadding>
        <div className="p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC]/50 dark:bg-[#0B1030]/30">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search properties by title, area..."
              width="w-full sm:w-64"
            />

            <div className="w-full sm:w-36">
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Types' },
                  { value: 'Residential', label: 'Residential' },
                  { value: 'Apartment', label: 'Apartment' },
                  { value: 'Commercial', label: 'Commercial' },
                  { value: 'Villa', label: 'Villa' },
                  { value: 'Plot', label: 'Plot' },
                ]}
              />
            </div>

            <div className="w-full sm:w-36">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Status' },
                  { value: 'Active', label: 'Active' },
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Sold', label: 'Sold' },
                ]}
              />
            </div>

            <div className="w-full sm:w-36">
              <Select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Countries' },
                  ...countries.map(country => ({ value: country.name, label: country.name })),
                ]}
              />
            </div>

            <div className="w-full sm:w-36">
              <Select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                options={[
                  { value: 'All', label: 'All Cities' },
                  ...cities.map(city => ({ value: city.name, label: city.name })),
                ]}
              />
            </div>

            <div className="w-full sm:w-36">
              <Select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as any)}
                options={[
                  { value: 'none', label: 'Sort Price' },
                  { value: 'asc', label: 'Price: Low to High' },
                  { value: 'desc', label: 'Price: High to Low' },
                ]}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#FF7817] hover:bg-[#FFF0E4] dark:hover:bg-[#252B5C] rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <TableSkeleton rows={6} cols={6} />
          ) : processedProperties.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-8 h-8" />}
              title="No properties match criteria"
              description={
                hasActiveFilters
                  ? 'Try clearing your search terms or filters to view available property listings.'
                  : 'Get started by creating your first property listing.'
              }
              actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add Property'}
              onAction={
                hasActiveFilters
                  ? resetFilters
                  : () => onOpenPropertyForm()
              }
            />
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#D9DDE8] dark:border-[#252B5C] bg-[#F8F9FC] dark:bg-[#0B1030] text-[#5F667A] dark:text-[#8A90A2] font-semibold">
                  <th className="py-3.5 px-5">Property</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9DDE8] dark:divide-[#252B5C]">
                {paginatedProperties.map((prop) => (
                  <tr
                    key={prop.id}
                    className="hover:bg-[#EEF0F5]/50 dark:hover:bg-[#252B5C]/30 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={prop.image}
                          alt={prop.title}
                          className="w-12 h-12 rounded-lg object-cover border border-[#D9DDE8] dark:border-[#252B5C] shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <button
                              type="button"
                              onClick={() => setViewProperty(prop)}
                              className="font-bold text-sm text-[#171A2B] dark:text-white truncate hover:text-[#FF7817] cursor-pointer text-left"
                            >
                              {prop.title}
                            </button>
                            {prop.buy_rent && (
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                prop.buy_rent === 'Rent'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : 'bg-[#FFF0E4] text-[#FF7817] dark:bg-[#252B5C]'
                              }`}>
                                {prop.buy_rent}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#8A90A2] block truncate">
                            {prop.sqm ? `${prop.sqm} SQM • ` : ''}
                            {prop.bedrooms ? `${prop.bedrooms} Beds • ` : ''}
                            {prop.address || prop.location}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 dark:bg-[#252B5C] text-[#5F667A] dark:text-[#D9DDE8]">
                        {prop.property_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#171A2B] dark:text-[#D9DDE8] font-medium">
                      {prop.location}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm text-[#171A2B] dark:text-white whitespace-nowrap">
                      {formatCurrency(prop.price)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          prop.status === 'Active'
                            ? 'active'
                            : prop.status === 'Pending'
                            ? 'pending'
                            : 'sold'
                        }
                      >
                        {prop.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-[#8A90A2] whitespace-nowrap">
                      {formatDate(prop.created_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <ActionMenu
                        actions={[
                          {
                            label: 'View Details',
                            icon: <Eye className="w-4 h-4 text-blue-500" />,
                            onClick: () => setViewProperty(prop),
                          },
                          {
                            label: 'Edit Property',
                            icon: <Edit2 className="w-4 h-4 text-[#FF7817]" />,
                            onClick: () => onOpenPropertyForm(prop),
                          },
                          {
                            label: 'Delete',
                            icon: <Trash2 className="w-4 h-4 text-rose-500" />,
                            onClick: () => setDeleteProperty(prop),
                            variant: 'danger',
                          },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {processedProperties.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalItems={processedProperties.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      {/* Property Details Modal */}
      <PropertyDetailModal
        property={viewProperty}
        isOpen={!!viewProperty}
        onClose={() => {
          setViewProperty(null);
          if (onClearSelectedProperty) onClearSelectedProperty();
        }}
        onEdit={(prop) => {
          setViewProperty(null);
          onOpenPropertyForm(prop);
        }}
        onDelete={(prop) => setDeleteProperty(prop)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteProperty}
        onClose={() => setDeleteProperty(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        title="Delete Property Listing"
        message={`Are you sure you want to permanently delete "${deleteProperty?.title}"? This record cannot be recovered.`}
      />
    </div>
  );
};
