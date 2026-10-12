import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, Eye, Plus, Search, Send, SquarePen, ScrollText, Trash2 } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import { downloadQuotationPdf } from '../../utils/quotationPdf';
import type { Quotation, QuotationCurrency, QuotationItem, QuotationStatus } from '../../types';

type FormErrors = Partial<Record<
  'quotationNumber' | 'customerName' | 'customerEmail' | 'quotationDate' | 'validityDays' |
  'preparedBy' | 'items',
  string
>>;

let lineSeed = 0;

const createLineItem = (): QuotationItem => ({
  id: `line-${Date.now()}-${lineSeed += 1}`,
  service: '',
  description: '',
  quantity: 1,
  unitPrice: 0,
});

const today = (): string => new Date().toISOString().slice(0, 10);

const createQuotationNumber = (): string =>
  `AW-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

const calculateTotal = (items: QuotationItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

const formatMoney = (amount: number, currency: QuotationCurrency): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

const formatDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const statusStyles: Record<QuotationStatus, string> = {
  Draft: 'bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300',
  Sent: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  Accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  Expired: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

const actionIconClass = 'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-transparent text-[#5F667A] transition-colors hover:border-[#D9DDE8] hover:bg-white hover:text-[#0F4C81] dark:text-[#AEB4C7] dark:hover:border-[#3A4070] dark:hover:bg-[#252B5C] dark:hover:text-white';

export const QuotationsPage: React.FC = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Quotation | null>(null);
  const [deleting, setDeleting] = useState<Quotation | null>(null);
  const [previewing, setPreviewing] = useState<Quotation | null>(null);

  const [quotationNumber, setQuotationNumber] = useState(createQuotationNumber);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [quotationDate, setQuotationDate] = useState(today);
  const [validityDays, setValidityDays] = useState(15);
  const [currency, setCurrency] = useState<QuotationCurrency>('USD');
  const [status, setStatus] = useState<QuotationStatus>('Draft');
  const [items, setItems] = useState<QuotationItem[]>([createLineItem()]);
  const [terms, setTerms] = useState('Payment can be made by bank transfer or another agreed method.\nThis quotation is valid for the period shown above.');
  const [notes, setNotes] = useState('Thank you for choosing AW Ali Company. We look forward to serving you.');
  const [preparedBy, setPreparedBy] = useState('AW ALI COMPANY');
  const [errors, setErrors] = useState<FormErrors>({});
  const { showToast } = useToast();

  const total = useMemo(() => calculateTotal(items), [items]);

  const loadQuotations = useCallback(async () => {
    setIsLoading(true);
    try {
      setQuotations(await api.getQuotations());
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load quotations.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadQuotations();
  }, [loadQuotations]);

  const filteredQuotations = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotations.filter(item => {
      const matchesSearch = !term ||
        item.quotationNumber.toLowerCase().includes(term) ||
        item.customerName.toLowerCase().includes(term) ||
        item.customerEmail.toLowerCase().includes(term) ||
        item.items.some(line => line.service.toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, statusFilter]);

  const resetForm = () => {
    setQuotationNumber(createQuotationNumber());
    setCustomerName('');
    setCustomerEmail('');
    setCustomerPhone('');
    setQuotationDate(today());
    setValidityDays(15);
    setCurrency('USD');
    setStatus('Draft');
    setItems([createLineItem()]);
    setTerms('Payment can be made by bank transfer or another agreed method.\nThis quotation is valid for the period shown above.');
    setNotes('Thank you for choosing AW Ali Company. We look forward to serving you.');
    setPreparedBy('AW ALI COMPANY');
    setErrors({});
  };

  const openCreateForm = () => {
    setEditing(null);
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (quotation: Quotation) => {
    setEditing(quotation);
    setQuotationNumber(quotation.quotationNumber);
    setCustomerName(quotation.customerName);
    setCustomerEmail(quotation.customerEmail);
    setCustomerPhone(quotation.customerPhone);
    setQuotationDate(quotation.quotationDate);
    setValidityDays(quotation.validityDays);
    setCurrency(quotation.currency);
    setStatus(quotation.status);
    setItems(quotation.items.map(item => ({ ...item })));
    setTerms(quotation.terms);
    setNotes(quotation.notes);
    setPreparedBy(quotation.preparedBy);
    setErrors({});
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    resetForm();
  };

  const updateLineItem = <K extends keyof QuotationItem>(
    id: string,
    field: K,
    value: QuotationItem[K],
  ) => {
    setItems(current => current.map(item => item.id === id ? { ...item, [field]: value } : item));
    setErrors(current => ({ ...current, items: undefined }));
  };

  const removeLineItem = (id: string) => {
    setItems(current => current.length === 1 ? current : current.filter(item => item.id !== id));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};
    const cleanItems = items.map(item => ({
      ...item,
      service: item.service.trim(),
      description: item.description.trim(),
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    }));

    if (!quotationNumber.trim()) nextErrors.quotationNumber = 'Quotation number is required.';
    if (!customerName.trim()) nextErrors.customerName = 'Customer name is required.';
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      nextErrors.customerEmail = 'Enter a valid email address.';
    }
    if (!quotationDate) nextErrors.quotationDate = 'Quotation date is required.';
    if (!Number.isInteger(validityDays) || validityDays < 1 || validityDays > 365) {
      nextErrors.validityDays = 'Validity must be between 1 and 365 days.';
    }
    if (!preparedBy.trim()) nextErrors.preparedBy = 'Prepared by is required.';
    if (cleanItems.length === 0 || cleanItems.some(item =>
      !item.service || !Number.isFinite(item.quantity) || item.quantity <= 0 ||
      !Number.isFinite(item.unitPrice) || item.unitPrice < 0
    )) {
      nextErrors.items = 'Every line needs a service, quantity above 0, and a valid unit price.';
    } else if (calculateTotal(cleanItems) <= 0) {
      nextErrors.items = 'The quotation total must be greater than zero.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload = {
      quotationNumber: quotationNumber.trim(),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      quotationDate,
      validityDays,
      currency,
      status,
      items: cleanItems,
      terms: terms.trim(),
      notes: notes.trim(),
      preparedBy: preparedBy.trim(),
    };

    setIsSaving(true);
    try {
      if (editing) {
        await api.updateQuotation(editing.id, payload);
        showToast('Quotation updated successfully.', 'success');
      } else {
        await api.createQuotation(payload);
        showToast('Quotation created successfully.', 'success');
      }
      closeForm();
      await loadQuotations();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save quotation.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsSaving(true);
    try {
      await api.deleteQuotation(deleting.id);
      showToast('Quotation deleted successfully.', 'success');
      setDeleting(null);
      await loadQuotations();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete quotation.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isFormOpen) {
    return (
      <div className="space-y-6">
        <PageHeader
          title={editing ? 'Edit Quotation' : 'Create Quotation'}
          subtitle="Complete the customer, validity, service, pricing, and terms information."
          action={<Button type="button" variant="secondary" onClick={closeForm} disabled={isSaving}>Back to Quotations</Button>}
        />

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="overflow-hidden rounded-xl border border-[#D9DDE8] bg-white shadow-xs dark:border-[#252B5C] dark:bg-[#151A46]">
            <div className="border-b border-[#D9DDE8] bg-[#0F4C81] px-5 py-4 dark:border-[#252B5C]">
              <h2 className="text-lg font-bold text-white">Quotation Details</h2>
              <p className="mt-1 text-sm text-blue-100">Reference number, customer, date, and validity.</p>
            </div>
            <div className="space-y-5 p-5 sm:p-7">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Input label="Quotation Number *" value={quotationNumber} onChange={event => { setQuotationNumber(event.target.value); setErrors(current => ({ ...current, quotationNumber: undefined })); }} placeholder="AW-2026-0114" error={errors.quotationNumber} autoFocus />
                <Input type="date" label="Quotation Date *" value={quotationDate} onChange={event => { setQuotationDate(event.target.value); setErrors(current => ({ ...current, quotationDate: undefined })); }} error={errors.quotationDate} />
                <Input type="number" min={1} max={365} label="Validity (Days) *" value={validityDays} onChange={event => { setValidityDays(Number(event.target.value)); setErrors(current => ({ ...current, validityDays: undefined })); }} error={errors.validityDays} />
                <Select label="Status *" value={status} onChange={event => setStatus(event.target.value as QuotationStatus)} options={[
                  { value: 'Draft', label: 'Draft' }, { value: 'Sent', label: 'Sent' },
                  { value: 'Accepted', label: 'Accepted' }, { value: 'Expired', label: 'Expired' },
                ]} />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input label="Customer Name *" value={customerName} onChange={event => { setCustomerName(event.target.value); setErrors(current => ({ ...current, customerName: undefined })); }} placeholder="e.g. Cabaas Yusuf" error={errors.customerName} />
                <Input type="email" label="Customer Email" value={customerEmail} onChange={event => { setCustomerEmail(event.target.value); setErrors(current => ({ ...current, customerEmail: undefined })); }} placeholder="customer@example.com" error={errors.customerEmail} />
                <Input type="tel" label="Customer Phone" value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} placeholder="+252 61 0000000" />
                <Input label="Prepared By *" value={preparedBy} onChange={event => { setPreparedBy(event.target.value); setErrors(current => ({ ...current, preparedBy: undefined })); }} placeholder="AW ALI COMPANY" error={errors.preparedBy} />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-[#D9DDE8] bg-white shadow-xs dark:border-[#252B5C] dark:bg-[#151A46]">
            <div className="flex flex-col gap-3 border-b border-[#D9DDE8] px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-[#252B5C]">
              <div>
                <h2 className="text-lg font-bold text-[#171A2B] dark:text-white">Services & Pricing</h2>
                <p className="mt-1 text-sm text-[#8A90A2]">Add every service included in this quotation.</p>
              </div>
              <Button type="button" variant="secondary" size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setItems(current => [...current, createLineItem()])}>
                Add Service Line
              </Button>
            </div>

            <div className="space-y-4 p-5 sm:p-7">
              {items.map((item, index) => (
                <div key={item.id} className="rounded-xl border border-[#D9DDE8] bg-[#F8F9FC] p-4 dark:border-[#252B5C] dark:bg-[#0B1030]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0F4C81] dark:text-blue-300">Service {index + 1}</span>
                    <button type="button" onClick={() => removeLineItem(item.id)} disabled={items.length === 1} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-rose-300 dark:hover:bg-rose-950/30" aria-label={`Remove service ${index + 1}`}>
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-3">
                      <Input id={`service-${item.id}`} label="Service *" value={item.service} onChange={event => updateLineItem(item.id, 'service', event.target.value)} placeholder="e.g. Hospital service" />
                    </div>
                    <div className="lg:col-span-4">
                      <Input id={`description-${item.id}`} label="Description / Details" value={item.description} onChange={event => updateLineItem(item.id, 'description', event.target.value)} placeholder="Brief service details" />
                    </div>
                    <div className="lg:col-span-1">
                      <Input id={`quantity-${item.id}`} type="number" min={0.01} step="0.01" label="Qty *" value={item.quantity} onChange={event => updateLineItem(item.id, 'quantity', Number(event.target.value))} />
                    </div>
                    <div className="lg:col-span-2">
                      <Input id={`price-${item.id}`} type="number" min={0} step="0.01" label={`Unit Price (${currency}) *`} value={item.unitPrice} onChange={event => updateLineItem(item.id, 'unitPrice', Number(event.target.value))} />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="mb-1.5 block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8]">Amount</label>
                      <div className="flex h-11 items-center rounded-lg border border-[#D9DDE8] bg-white px-3.5 text-sm font-bold text-[#0F4C81] dark:border-[#252B5C] dark:bg-[#151A46] dark:text-blue-300">
                        {formatMoney(item.quantity * item.unitPrice, currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {errors.items ? <p className="text-sm font-medium text-rose-500">{errors.items}</p> : null}

              <div className="flex flex-col gap-4 rounded-xl bg-[#EAF3FA] px-5 py-4 sm:flex-row sm:items-center sm:justify-between dark:bg-[#0F4C81]/25">
                <Select label="Currency" value={currency} onChange={event => setCurrency(event.target.value as QuotationCurrency)} className="sm:w-44" options={[
                  { value: 'USD', label: 'USD - US Dollar' }, { value: 'EUR', label: 'EUR - Euro' },
                  { value: 'GBP', label: 'GBP - British Pound' }, { value: 'TRY', label: 'TRY - Turkish Lira' },
                ]} />
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#5F667A] dark:text-[#AEB4C7]">Grand Total</p>
                  <p className="mt-1 text-3xl font-black text-[#0F4C81] dark:text-blue-300">{formatMoney(total, currency)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-[#D9DDE8] bg-white p-5 shadow-xs sm:p-7 dark:border-[#252B5C] dark:bg-[#151A46]">
            <div className="grid gap-5 lg:grid-cols-2">
              <Textarea label="Terms & Conditions" value={terms} onChange={event => setTerms(event.target.value)} placeholder="Payment method, validity, and other conditions." helperText="These terms will appear with the quotation." />
              <Textarea label="Closing Note" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Add a short message for the customer." helperText="Optional message shown at the end of the quotation." />
            </div>
            <div className="mt-6 flex justify-end gap-3 border-t border-[#D9DDE8] pt-5 dark:border-[#252B5C]">
              <Button type="button" variant="secondary" onClick={closeForm} disabled={isSaving}>Cancel</Button>
              <Button type="submit" variant="accent" size="lg" isLoading={isSaving} leftIcon={<CheckCircle2 className="h-5 w-5" />}>
                {editing ? 'Save Changes' : 'Create Quotation'}
              </Button>
            </div>
          </section>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        subtitle="Create, review, and manage customer quotations from one place."
        action={<Button variant="accent" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateForm}>Add Quotation</Button>}
      />

      <section className="overflow-hidden rounded-xl border border-[#D9DDE8] bg-white shadow-xs dark:border-[#252B5C] dark:bg-[#151A46]">
        <div className="flex flex-col gap-4 border-b border-[#D9DDE8] p-5 lg:flex-row lg:items-end lg:justify-between dark:border-[#252B5C]">
          <div className="relative w-full lg:max-w-lg">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A90A2]" />
            <input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search number, customer, email, or service..." aria-label="Search quotations" className="h-12 w-full rounded-xl border border-[#D9DDE8] bg-white pl-12 pr-4 text-sm text-[#171A2B] outline-none focus:border-[#FF7817] focus:ring-2 focus:ring-[#FF7817]/25 dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-white" />
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end lg:w-auto">
            <Select label="Status" value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="sm:w-44" options={[
              { value: 'All', label: 'All Statuses' }, { value: 'Draft', label: 'Draft' },
              { value: 'Sent', label: 'Sent' }, { value: 'Accepted', label: 'Accepted' }, { value: 'Expired', label: 'Expired' },
            ]} />
            <div className="flex h-11 items-center gap-2 whitespace-nowrap text-sm font-semibold text-[#5F667A] dark:text-[#D9DDE8]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FF7817]" />
              {filteredQuotations.length} {filteredQuotations.length === 1 ? 'quotation' : 'quotations'}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6" aria-label="Loading quotations">
            {[0, 1, 2].map(index => <div key={index} className="h-20 animate-pulse rounded-lg bg-[#EEF0F5] dark:bg-[#252B5C]" />)}
          </div>
        ) : filteredQuotations.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="h-8 w-8" />}
            title={search || statusFilter !== 'All' ? 'No matching quotations' : 'No quotations yet'}
            description={search || statusFilter !== 'All' ? 'Try a different search term or status.' : 'Create the first customer quotation to show it here.'}
            actionLabel={search || statusFilter !== 'All' ? undefined : 'Add Quotation'}
            onAction={search || statusFilter !== 'All' ? undefined : openCreateForm}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1260px] text-left">
              <thead className="bg-[#F8F9FC] text-[11px] font-bold uppercase tracking-wider text-[#5F667A] dark:bg-[#0E1335] dark:text-[#8A90A2]">
                <tr>
                  <th className="px-6 py-4">Quotation</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date & Validity</th>
                  <th className="px-6 py-4">Services</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#252B5C]">
                {filteredQuotations.map(quotation => (
                  <tr key={quotation.id} className="transition-colors hover:bg-[#FFF8F2] dark:hover:bg-[#1A2053]">
                    <td className="px-6 py-5">
                      <p className="font-bold text-[#0F4C81] dark:text-blue-300">{quotation.quotationNumber}</p>
                      <p className="mt-1 text-xs text-[#8A90A2]">Prepared by {quotation.preparedBy}</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-[#171A2B] dark:text-white">{quotation.customerName}</p>
                      <p className="mt-1 text-xs text-[#8A90A2]">{quotation.customerEmail || quotation.customerPhone || 'No contact added'}</p>
                    </td>
                    <td className="px-6 py-5 text-sm text-[#5F667A] dark:text-[#D9DDE8]">
                      <p>{formatDate(quotation.quotationDate)}</p>
                      <p className="mt-1 text-xs text-[#8A90A2]">Valid for {quotation.validityDays} days</p>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-[#171A2B] dark:text-white">{quotation.items.length} {quotation.items.length === 1 ? 'service' : 'services'}</p>
                      <p className="mt-1 max-w-xs truncate text-xs text-[#8A90A2]">{quotation.items.map(item => item.service).join(', ')}</p>
                    </td>
                    <td className="whitespace-nowrap px-6 py-5 text-base font-black text-[#171A2B] dark:text-white">{formatMoney(calculateTotal(quotation.items), quotation.currency)}</td>
                    <td className="px-6 py-5"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[quotation.status]}`}>{quotation.status}</span></td>
                    <td className="relative z-20 px-4 py-5">
                      <div className="flex items-center justify-center gap-1 whitespace-nowrap">
                        <span className={actionIconClass} title="Send by email - coming soon" aria-label="Send by email - coming soon">
                          <Send className="h-[18px] w-[18px]" />
                        </span>
                        <button type="button" onClick={() => { void downloadQuotationPdf(quotation); }} className={actionIconClass} title="Download PDF" aria-label={`Download ${quotation.quotationNumber} as PDF`}>
                          <Download className="h-[18px] w-[18px]" />
                        </button>
                        <button type="button" onClick={() => setPreviewing(quotation)} className={actionIconClass} title="View quotation" aria-label={`View ${quotation.quotationNumber}`}>
                          <Eye className="h-[18px] w-[18px]" />
                        </button>
                        <button type="button" onClick={() => openEditForm(quotation)} className={actionIconClass} title="Edit quotation" aria-label={`Edit ${quotation.quotationNumber}`}>
                          <SquarePen className="h-[18px] w-[18px]" />
                        </button>
                        <button type="button" onClick={() => setDeleting(quotation)} className={`${actionIconClass} hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-900 dark:hover:bg-rose-950/30 dark:hover:text-rose-300`} title="Delete quotation" aria-label={`Delete ${quotation.quotationNumber}`}>
                          <Trash2 className="h-[18px] w-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal
        isOpen={Boolean(previewing)}
        onClose={() => setPreviewing(null)}
        title={previewing ? `Quotation ${previewing.quotationNumber}` : 'Quotation Preview'}
        maxWidth="4xl"
      >
        {previewing ? (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button variant="accent" leftIcon={<Download className="h-4 w-4" />} onClick={() => { void downloadQuotationPdf(previewing); }}>
                Download PDF
              </Button>
            </div>

            <article className="overflow-hidden rounded-xl border border-[#C9D8E6] bg-white text-[#0F4C81] shadow-sm">
              <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">AW ALI COMPANY</h3>
                  <p className="mt-2 text-sm italic text-[#5F667A]">Consulting • Health • Education • Real Estate • Import & Export</p>
                </div>
                <div className="rounded-lg bg-[#EAF3FA] px-5 py-3 text-sm leading-6">
                  <p>Mogadishu, Somalia</p>
                  <p>+252 61 3295050</p>
                  <p>info@awalicompany.com</p>
                </div>
              </div>

              <div className="flex flex-col bg-[#0F4C81] px-6 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
                <h4 className="text-xl font-black">QUOTATION</h4>
                <span className="mt-1 text-sm font-bold sm:mt-0">{previewing.quotationNumber}</span>
              </div>

              <div className="grid gap-px bg-[#C9D8E6] sm:grid-cols-3">
                <div className="bg-[#F5F9FC] p-5 sm:col-span-1">
                  <p className="text-xs font-bold uppercase tracking-wider">Client</p>
                  <p className="mt-2 text-base font-black">{previewing.customerName}</p>
                  <p className="mt-1 text-xs text-[#5F667A]">{[previewing.customerEmail, previewing.customerPhone].filter(Boolean).join(' • ') || 'No contact added'}</p>
                </div>
                <div className="bg-[#F5F9FC] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider">Date</p>
                  <p className="mt-2 font-bold">{formatDate(previewing.quotationDate)}</p>
                </div>
                <div className="bg-[#F5F9FC] p-5">
                  <p className="text-xs font-bold uppercase tracking-wider">Validity</p>
                  <p className="mt-2 font-bold">{previewing.validityDays} Days</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left text-sm">
                  <thead className="bg-[#1660A6] text-white">
                    <tr>
                      <th className="px-4 py-3">No.</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Qty</th>
                      <th className="px-4 py-3 text-right">Unit Price</th>
                      <th className="px-4 py-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D9E3EC]">
                    {previewing.items.map((item, index) => (
                      <tr key={item.id} className="even:bg-[#F5F9FC]">
                        <td className="px-4 py-3 font-bold">{index + 1}</td>
                        <td className="px-4 py-3 font-bold">{item.service}</td>
                        <td className="px-4 py-3 text-[#5F667A]">{item.description || '—'}</td>
                        <td className="px-4 py-3 text-right">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">{formatMoney(item.unitPrice, previewing.currency)}</td>
                        <td className="px-4 py-3 text-right font-bold">{formatMoney(item.quantity * item.unitPrice, previewing.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} />
                      <td className="bg-[#EAF3FA] px-4 py-4 text-right font-black">GRAND TOTAL</td>
                      <td className="bg-[#0F4C81] px-4 py-4 text-right text-lg font-black text-white">{formatMoney(calculateTotal(previewing.items), previewing.currency)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="grid gap-px bg-[#C9D8E6] sm:grid-cols-2">
                <div className="bg-[#F8FAFC] p-5">
                  <p className="text-xs font-black uppercase tracking-wider text-[#5F667A]">Terms & Conditions</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#5F667A]">{previewing.terms || 'No additional terms.'}</p>
                </div>
                <div className="bg-[#F8FAFC] p-5 text-center">
                  <p className="text-xs font-black uppercase tracking-wider text-[#5F667A]">Thank You</p>
                  <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[#5F667A]">{previewing.notes || 'Thank you for choosing AW Ali Company.'}</p>
                </div>
              </div>

              <div className="flex items-end justify-between px-6 py-7 text-sm">
                <div><p className="font-bold">Prepared by</p><p className="mt-3 text-[#5F667A]">{previewing.preparedBy}</p></div>
                <div className="text-right"><p className="font-bold">Client</p><p className="mt-3 text-[#5F667A]">{previewing.customerName}</p></div>
              </div>
            </article>
          </div>
        ) : null}
      </Modal>

      <ConfirmModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Quotation"
        message={`Are you sure you want to delete “${deleting?.quotationNumber || ''}”? This record will be permanently removed.`}
        confirmText="Delete Quotation"
        isLoading={isSaving}
      />
    </div>
  );
};
