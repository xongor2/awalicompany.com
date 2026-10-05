import React from 'react';
import { BriefcaseBusiness, CheckCircle2, Calendar, Edit2, Trash2 } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Service } from '../../types';

interface ServiceDetailModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  service,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!service) return null;

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Service Information" maxWidth="lg">
      <div className="space-y-5">
        {/* Banner */}
        <div className="relative rounded-xl overflow-hidden aspect-video max-h-56 bg-gray-100 dark:bg-[#0B1030] border border-[#D9DDE8] dark:border-[#252B5C]">
          <img
            src={service.image}
            alt={service.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <Badge
              variant={
                service.status === 'Active'
                  ? 'active'
                  : service.status === 'Pending'
                  ? 'pending'
                  : 'inactive'
              }
            >
              {service.status}
            </Badge>
          </div>
          <div className="absolute bottom-3 left-3 bg-[#151A46]/90 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-xs font-semibold">
            {service.category}
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="font-heading text-xl font-bold text-[#171A2B] dark:text-white">
            {service.name}
          </h2>
          <p className="text-xs text-[#8A90A2] mt-1">
            Category: <span className="text-[#FF7817] font-semibold">{service.category}</span>
          </p>
        </div>

        {/* Description / Info */}
        <div>
          <h4 className="text-xs font-bold text-[#171A2B] dark:text-white uppercase tracking-wider mb-2">
            Scope & Overview
          </h4>
          {service.description?.includes('<') ? (
            <div
              className="text-xs text-[#5F667A] dark:text-[#D9DDE8] leading-relaxed prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: service.description }}
            />
          ) : (
            <p className="text-xs text-[#5F667A] dark:text-[#D9DDE8] leading-relaxed whitespace-pre-line">
              {service.description || 'No detailed overview provided.'}
            </p>
          )}
        </div>

        {/* Deliverables / Features */}
        {service.features && service.features.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-[#171A2B] dark:text-white uppercase tracking-wider mb-2">
              Key Capabilities & Inclusions
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {service.features.map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 rounded-lg bg-[#F8F9FC] dark:bg-[#0B1030] border border-[#D9DDE8] dark:border-[#252B5C] text-xs text-[#171A2B] dark:text-[#D9DDE8]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FF7817] shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="pt-3 border-t border-[#D9DDE8] dark:border-[#252B5C] flex items-center justify-between text-[11px] text-[#8A90A2]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Introduced {formatDate(service.created_at)}</span>
          </div>
          <span>ID: {service.id}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onClose();
              onDelete(service);
            }}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Service
          </Button>
          <Button
            variant="accent"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(service);
            }}
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            Edit Service
          </Button>
        </div>
      </div>
    </Modal>
  );
};
