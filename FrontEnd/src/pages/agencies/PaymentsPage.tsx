import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CreditCard, Eye, UsersRound, WalletCards } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { SearchInput } from '../../components/ui/SearchInput';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import type { AgencyPayment } from '../../types';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatCurrency = (amount: number): string => currencyFormatter.format(amount);

const formatMonth = (month: string): string => new Date(`${month}-01T00:00:00`).toLocaleDateString('en-US', {
  month: 'long',
  year: 'numeric',
});

const formatDate = (value: string): string => new Date(value).toLocaleDateString('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

export const PaymentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [payments, setPayments] = useState<AgencyPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<AgencyPayment | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      setPayments(await api.getPayments());
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load payments.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments]);

  const filteredPayments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return payments;
    return payments.filter(payment =>
      payment.agencyName.toLowerCase().includes(term)
      || payment.agencyEmail.toLowerCase().includes(term)
      || formatMonth(payment.month).toLowerCase().includes(term)
      || payment.details.some(detail => detail.customerName.toLowerCase().includes(term))
    );
  }, [payments, search]);

  const totals = useMemo(() => filteredPayments.reduce((summary, payment) => ({
    customers: summary.customers + payment.customerCount,
    serviceAmount: summary.serviceAmount + payment.serviceAmount,
    commissionAmount: summary.commissionAmount + payment.commissionAmount,
  }), { customers: 0, serviceAmount: 0, commissionAmount: 0 }), [filteredPayments]);

  const closeDetails = useCallback(() => setSelectedPayment(null), []);
  const openDetails = useCallback((payment: AgencyPayment) => setSelectedPayment(payment), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        subtitle="Monthly Agency commissions calculated from completed customer services."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#5F667A] dark:text-[#8A90A2]">Customers</p>
            <p className="mt-1 text-2xl font-semibold text-[#171A2B] dark:text-white">{totals.customers}</p>
          </div>
          <span className="rounded-xl bg-[#FFF0E4] p-3 text-[#FF7817] dark:bg-[#252B5C]">
            <UsersRound className="h-5 w-5" />
          </span>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#5F667A] dark:text-[#8A90A2]">Service Amount</p>
            <p className="mt-1 text-2xl font-semibold text-[#171A2B] dark:text-white">{formatCurrency(totals.serviceAmount)}</p>
          </div>
          <span className="rounded-xl bg-[#FFF0E4] p-3 text-[#FF7817] dark:bg-[#252B5C]">
            <WalletCards className="h-5 w-5" />
          </span>
        </Card>
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#5F667A] dark:text-[#8A90A2]">Commission Amount</p>
            <p className="mt-1 text-2xl font-semibold text-[#171A2B] dark:text-white">{formatCurrency(totals.commissionAmount)}</p>
          </div>
          <span className="rounded-xl bg-[#FFF0E4] p-3 text-[#FF7817] dark:bg-[#252B5C]">
            <CreditCard className="h-5 w-5" />
          </span>
        </Card>
      </div>

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-[#D9DDE8] p-5 dark:border-[#252B5C] sm:flex-row sm:items-center sm:justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search Agency, month, or customer..."
            width="w-full sm:w-96"
          />
          <p className="text-sm font-medium text-[#5F667A] dark:text-[#8A90A2]">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-[#FF7817]" />
            {filteredPayments.length} monthly {filteredPayments.length === 1 ? 'payment' : 'payments'}
          </p>
        </div>

        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center text-sm text-[#5F667A] dark:text-[#8A90A2]">
            Loading payments...
          </div>
        ) : filteredPayments.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="h-8 w-8" />}
            title={search ? 'No matching payments' : 'No payments yet'}
            description={search
              ? 'Try a different Agency, month, or customer name.'
              : 'Payments appear after a customer service amount and its matching commission have been recorded.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left">
              <thead className="bg-[#F7F8FB] text-xs uppercase tracking-wide text-[#5F667A] dark:bg-[#0B1030] dark:text-[#8A90A2]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Agency</th>
                  <th className="px-6 py-4 font-semibold">Month</th>
                  <th className="px-6 py-4 font-semibold">Customers</th>
                  <th className="px-6 py-4 font-semibold">Service Amount</th>
                  <th className="px-6 py-4 font-semibold">Commission Amount</th>
                  <th className="px-6 py-4 text-center font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E9F0] dark:divide-[#252B5C]">
                {filteredPayments.map(payment => (
                  <tr
                    key={payment.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`View ${payment.agencyName} payment details for ${formatMonth(payment.month)}`}
                    onClick={() => openDetails(payment)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openDetails(payment);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-[#FFF8F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF7817] dark:hover:bg-[#1B2050]"
                  >
                    <td className="px-6 py-5">
                      <p className="font-semibold text-[#171A2B] dark:text-white">{payment.agencyName}</p>
                      <p className="mt-0.5 text-sm text-[#8A90A2]">{payment.agencyEmail}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-[#171A2B] dark:text-white">
                        <CalendarDays className="h-4 w-4 text-[#FF7817]" />
                        {formatMonth(payment.month)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-[#171A2B] dark:text-white">{payment.customerCount}</td>
                    <td className="px-6 py-5 text-sm font-medium text-[#171A2B] dark:text-white">{formatCurrency(payment.serviceAmount)}</td>
                    <td className="px-6 py-5 font-semibold text-[#FF7817]">{formatCurrency(payment.commissionAmount)}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex rounded-lg p-2 text-[#5F667A] transition-colors group-hover:text-[#FF7817] dark:text-[#8A90A2]">
                        <Eye className="h-5 w-5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={selectedPayment !== null}
        onClose={closeDetails}
        maxWidth="5xl"
        title={selectedPayment
          ? `${selectedPayment.agencyName} — ${formatMonth(selectedPayment.month)}`
          : 'Payment Details'}
      >
        {selectedPayment && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[#F7F8FB] p-4 dark:bg-[#0B1030]">
                <p className="text-xs uppercase tracking-wide text-[#8A90A2]">Customers</p>
                <p className="mt-1 text-xl font-semibold text-[#171A2B] dark:text-white">{selectedPayment.customerCount}</p>
              </div>
              <div className="rounded-xl bg-[#F7F8FB] p-4 dark:bg-[#0B1030]">
                <p className="text-xs uppercase tracking-wide text-[#8A90A2]">Service Amount</p>
                <p className="mt-1 text-xl font-semibold text-[#171A2B] dark:text-white">{formatCurrency(selectedPayment.serviceAmount)}</p>
              </div>
              <div className="rounded-xl bg-[#FFF0E4] p-4 dark:bg-[#252B5C]">
                <p className="text-xs uppercase tracking-wide text-[#8A90A2]">Commission Amount</p>
                <p className="mt-1 text-xl font-semibold text-[#FF7817]">{formatCurrency(selectedPayment.commissionAmount)}</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-[#D9DDE8] dark:border-[#252B5C]">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-[#F7F8FB] text-xs uppercase tracking-wide text-[#5F667A] dark:bg-[#0B1030] dark:text-[#8A90A2]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Customer</th>
                    <th className="px-4 py-3 font-semibold">Service</th>
                    <th className="px-4 py-3 font-semibold">Service Information</th>
                    <th className="px-4 py-3 font-semibold">Amount</th>
                    <th className="px-4 py-3 font-semibold">Rate</th>
                    <th className="px-4 py-3 font-semibold">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E9F0] dark:divide-[#252B5C]">
                  {selectedPayment.details.map(detail => (
                    <tr key={detail.customerId}>
                      <td className="px-4 py-4">
                        <p className="font-medium text-[#171A2B] dark:text-white">{detail.customerName}</p>
                        <p className="mt-0.5 text-xs text-[#8A90A2]">{formatDate(detail.registeredAt)}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#171A2B] dark:text-white">{detail.service}</td>
                      <td className="max-w-xs px-4 py-4 text-sm text-[#5F667A] dark:text-[#8A90A2]">{detail.serviceInfo || '—'}</td>
                      <td className="px-4 py-4 text-sm font-medium text-[#171A2B] dark:text-white">{formatCurrency(detail.serviceAmount)}</td>
                      <td className="px-4 py-4 text-sm font-medium text-[#171A2B] dark:text-white">{detail.commissionPercentage}%</td>
                      <td className="px-4 py-4 text-sm font-semibold text-[#FF7817]">{formatCurrency(detail.commissionAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
