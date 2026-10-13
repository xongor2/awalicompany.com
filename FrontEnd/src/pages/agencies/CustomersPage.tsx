import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ContactRound, Download, Edit3, Eye, FileImage, MapPin, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { EmptyState } from '../../components/ui/EmptyState';
import { ActionMenu } from '../../components/ui/Dropdown';
import { Modal } from '../../components/ui/Modal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { useToast } from '../../components/ui/Toast';
import { api } from '../../services/api';
import type { Customer, CustomerService } from '../../types';

type FormErrors = Partial<Record<'fullName' | 'email' | 'phone' | 'service' | 'amount' | 'receipt', string>>;

const serviceOptions = [
  { value: '', label: 'Select a service' },
  { value: 'Health', label: 'Health' },
  { value: 'Education', label: 'Education' },
  { value: 'Real Estate', label: 'Real Estate' },
  { value: 'Consulting', label: 'Consulting' },
];

const formatAmount = (amount: number | null): string => amount == null
  ? '—'
  : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState<Customer | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState<CustomerService | ''>('');
  const [serviceInfo, setServiceInfo] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const { showToast } = useToast();

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      setCustomers(await api.getCustomers());
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to load customers.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { void loadCustomers(); }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers.filter(customer => {
      const matchesSearch = !term || [customer.fullName, customer.email, customer.phone, customer.country, customer.city, customer.service, customer.serviceInfo, customer.createdByName, customer.createdByEmail]
        .some(value => value.toLowerCase().includes(term));
      return matchesSearch && (serviceFilter === 'All' || customer.service === serviceFilter);
    });
  }, [customers, search, serviceFilter]);

  const resetForm = () => {
    setFullName(''); setEmail(''); setPhone(''); setCountry(''); setCity('');
    setService(''); setServiceInfo(''); setAmount(''); setReceipt(''); setStep(1); setErrors({});
  };

  const openCreateForm = () => { setEditing(null); resetForm(); setIsFormOpen(true); };

  const openEditForm = (customer: Customer) => {
    setEditing(customer); setFullName(customer.fullName); setEmail(customer.email); setPhone(customer.phone);
    setCountry(customer.country); setCity(customer.city); setService(customer.service); setServiceInfo(customer.serviceInfo);
    setAmount(customer.amount == null ? '' : String(customer.amount)); setReceipt(customer.receipt);
    setStep(1); setErrors({}); setIsFormOpen(true);
  };

  const openServiceCompletionForm = (customer: Customer) => {
    openEditForm(customer);
    setStep(2);
  };

  const closeForm = () => { setIsFormOpen(false); setEditing(null); resetForm(); };

  const validateCustomerDetails = (): boolean => {
    const nextErrors: FormErrors = {};
    if (!fullName.trim()) nextErrors.fullName = 'Full name is required.';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (!phone.trim()) nextErrors.phone = 'Phone number is required.';
    if (!service) nextErrors.service = 'Select a service.';
    setErrors(current => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const goToServiceDetails = () => { if (validateCustomerDetails()) setStep(2); };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors(current => ({ ...current, receipt: 'Select a valid image file.' })); return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors(current => ({ ...current, receipt: 'Receipt image must be smaller than 5 MB.' })); return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceipt(reader.result); setErrors(current => ({ ...current, receipt: undefined }));
      }
    };
    reader.onerror = () => setErrors(current => ({ ...current, receipt: 'Unable to read this image.' }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateCustomerDetails()) { setStep(1); return; }
    const numericAmount = amount.trim() === '' ? null : Number(amount);
    if (numericAmount !== null && (!Number.isFinite(numericAmount) || numericAmount < 0)) {
      setErrors(current => ({ ...current, amount: 'Enter a valid amount.' })); return;
    }
    const payload = {
      fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), country: country.trim(), city: city.trim(),
      service: service as CustomerService, serviceInfo: serviceInfo.trim(), amount: numericAmount, receipt,
    };
    setIsSaving(true);
    try {
      if (editing) {
        await api.updateCustomer(editing.id, payload); showToast('Customer updated successfully.', 'success');
      } else {
        await api.createCustomer(payload); showToast('Customer added successfully.', 'success');
      }
      closeForm(); await loadCustomers();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to save customer.', 'error');
    } finally { setIsSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsSaving(true);
    try {
      await api.deleteCustomer(deleting.id); showToast('Customer deleted successfully.', 'success');
      setDeleting(null); await loadCustomers();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete customer.', 'error');
    } finally { setIsSaving(false); }
  };

  const downloadReceipt = (customer: Customer) => {
    if (!customer.receipt) {
      showToast('No receipt has been uploaded for this customer yet.', 'info');
      return;
    }

    const mimeMatch = customer.receipt.match(/^data:image\/([a-zA-Z0-9.+-]+);base64,/);
    const rawExtension = mimeMatch?.[1]?.toLowerCase() || 'png';
    const extension = rawExtension === 'jpeg' ? 'jpg' : rawExtension === 'svg+xml' ? 'svg' : rawExtension;
    const customerName = customer.fullName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'customer';
    const link = document.createElement('a');
    link.href = customer.receipt;
    link.download = `${customerName}-receipt.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast('Receipt download started.', 'success');
  };

  if (isFormOpen) {
    return (
      <div className="space-y-6">
        <PageHeader title={editing ? 'Edit Customer' : 'Add Customer'} subtitle="Enter the customer details first, then add service completion information when available." action={<Button type="button" variant="secondary" onClick={closeForm} disabled={isSaving}>Back to Customers</Button>} />

        <div className="mx-auto flex w-full max-w-3xl items-center px-2" aria-label="Customer form progress">
          {[{ number: 1, label: 'Customer Details' }, { number: 2, label: 'Service Details' }].map((item, index) => (
            <React.Fragment key={item.number}>
              <button type="button" onClick={() => item.number === 1 ? setStep(1) : goToServiceDetails()} className="flex items-center gap-2 text-left">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${step >= item.number ? 'bg-[#FF7817] text-white' : 'bg-[#E8EAF0] text-[#8A90A2] dark:bg-[#252B5C]'}`}>{item.number}</span>
                <span className={`hidden text-sm font-semibold sm:block ${step >= item.number ? 'text-[#171A2B] dark:text-white' : 'text-[#8A90A2]'}`}>{item.label}</span>
              </button>
              {index === 0 && <div className={`mx-4 h-0.5 flex-1 ${step === 2 ? 'bg-[#FF7817]' : 'bg-[#D9DDE8] dark:bg-[#252B5C]'}`} />}
            </React.Fragment>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-[#D9DDE8] bg-white shadow-xs dark:border-[#252B5C] dark:bg-[#151A46]">
          <div className="border-b border-[#D9DDE8] bg-[#0F4C81] px-5 py-4 dark:border-[#252B5C]">
            <h2 className="text-lg font-bold text-white">{step === 1 ? 'Customer Details' : 'Service Completion Details'}</h2>
            <p className="mt-1 text-sm text-blue-100">{step === 1 ? 'Fields marked with * are required.' : 'These fields are optional and can be completed after the service is delivered.'}</p>
          </div>
          <div className="space-y-5 p-5 sm:p-7">
            {step === 1 ? (
              <>
                <Input label="Full Name *" value={fullName} onChange={event => { setFullName(event.target.value); setErrors(current => ({ ...current, fullName: undefined })); }} placeholder="Enter the customer’s full name" error={errors.fullName} autoFocus />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input type="email" label="Email" value={email} onChange={event => { setEmail(event.target.value); setErrors(current => ({ ...current, email: undefined })); }} placeholder="customer@example.com" error={errors.email} />
                  <Input type="tel" label="Phone *" value={phone} onChange={event => { setPhone(event.target.value); setErrors(current => ({ ...current, phone: undefined })); }} placeholder="e.g. +252 61 0000000" error={errors.phone} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Country" value={country} onChange={event => setCountry(event.target.value)} placeholder="e.g. Somalia" />
                  <Input label="City" value={city} onChange={event => setCity(event.target.value)} placeholder="e.g. Mogadishu" />
                </div>
                <Select label="Service *" value={service} onChange={event => { setService(event.target.value as CustomerService | ''); setErrors(current => ({ ...current, service: undefined })); }} options={serviceOptions} error={errors.service} />
                <div className="flex justify-end gap-3 border-t border-[#D9DDE8] pt-5 dark:border-[#252B5C]">
                  <Button type="button" variant="secondary" onClick={closeForm}>Cancel</Button>
                  <Button type="button" variant="accent" onClick={goToServiceDetails}>Continue to Service Details</Button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-xl border border-blue-100 bg-[#F3F8FC] p-4 text-sm text-[#0F4C81] dark:border-[#2A4771] dark:bg-[#0F4C81]/20 dark:text-blue-200">Add these details when the customer’s service has been completed. You may save the customer now and update this section later.</div>
                <Textarea label="Service Information" value={serviceInfo} onChange={event => setServiceInfo(event.target.value)} placeholder="Describe the service provided to the customer" />
                <Input type="number" min={0} step="0.01" label="Amount (USD)" value={amount} onChange={event => { setAmount(event.target.value); setErrors(current => ({ ...current, amount: undefined })); }} placeholder="e.g. 500.00" error={errors.amount} />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8]">Receipt</label>
                  {receipt ? (
                    <div className="relative overflow-hidden rounded-xl border border-[#D9DDE8] bg-[#F8F9FC] dark:border-[#252B5C] dark:bg-[#0B1030]">
                      <img src={receipt} alt="Uploaded receipt" className="mx-auto max-h-80 w-full object-contain" />
                      <button type="button" onClick={() => setReceipt('')} className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#0B1030]/80 text-white hover:bg-rose-600" aria-label="Remove receipt"><X className="h-4 w-4" /></button>
                      <label className="absolute bottom-3 right-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-[#151A46] shadow-lg"><Upload className="h-4 w-4 text-[#FF7817]" /> Replace Receipt<input type="file" accept="image/*" onChange={handleReceiptUpload} className="sr-only" /></label>
                    </div>
                  ) : (
                    <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#C5CBE0] bg-[#F8F9FC] px-6 py-8 text-center hover:border-[#FF7817] dark:border-[#3A4070] dark:bg-[#0B1030]">
                      <FileImage className="mb-3 h-8 w-8 text-[#FF7817]" /><span className="text-sm font-bold text-[#151A46] dark:text-white">Upload Receipt Image</span><span className="mt-1 text-xs text-[#8A90A2]">PNG, JPG or WebP · maximum 5 MB</span><input type="file" accept="image/*" onChange={handleReceiptUpload} className="sr-only" />
                    </label>
                  )}
                  {errors.receipt && <p className="mt-2 text-xs font-medium text-rose-500">{errors.receipt}</p>}
                </div>
                <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#D9DDE8] pt-5 sm:flex-row dark:border-[#252B5C]">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} disabled={isSaving}>Back</Button>
                  <Button type="submit" variant="accent" size="lg" isLoading={isSaving} leftIcon={<CheckCircle2 className="h-5 w-5" />}>{editing ? 'Save Changes' : 'Save Customer'}</Button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Customers" subtitle="Manage customer records and completed service information from one place." action={<Button variant="accent" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateForm}>Add Customer</Button>} />

      <section className="overflow-hidden rounded-xl border border-[#D9DDE8] bg-white shadow-xs dark:border-[#252B5C] dark:bg-[#151A46]">
        <div className="flex flex-col gap-4 border-b border-[#D9DDE8] p-5 lg:flex-row lg:items-end dark:border-[#252B5C]">
          <div className="relative flex-1"><Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8A90A2]" /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by name, phone, email, location, or service..." className="h-11 w-full rounded-lg border border-[#D9DDE8] bg-white pl-12 pr-4 text-sm text-[#171A2B] outline-none focus:border-[#FF7817] focus:ring-2 focus:ring-[#FF7817]/25 dark:border-[#252B5C] dark:bg-[#0B1030] dark:text-white" /></div>
          <Select label="Service" value={serviceFilter} onChange={event => setServiceFilter(event.target.value)} className="lg:w-52" options={[{ value: 'All', label: 'All Services' }, ...serviceOptions.slice(1)]} />
          <div className="flex h-11 items-center gap-2 whitespace-nowrap text-sm font-semibold text-[#5F667A] dark:text-[#D9DDE8]"><span className="h-2.5 w-2.5 rounded-full bg-[#FF7817]" />{filteredCustomers.length} {filteredCustomers.length === 1 ? 'customer' : 'customers'}</div>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-6">{[0, 1, 2].map(index => <div key={index} className="h-20 animate-pulse rounded-lg bg-[#EEF0F5] dark:bg-[#252B5C]" />)}</div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState icon={<ContactRound className="h-8 w-8" />} title={search || serviceFilter !== 'All' ? 'No matching customers' : 'No customers yet'} description={search || serviceFilter !== 'All' ? 'Try adjusting your search or service filter.' : 'Add the first customer record to get started.'} actionLabel={!search && serviceFilter === 'All' ? 'Add Customer' : undefined} onAction={!search && serviceFilter === 'All' ? openCreateForm : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1320px] text-left">
              <thead className="bg-[#F8F9FC] text-[11px] font-bold uppercase tracking-wider text-[#5F667A] dark:bg-[#0E1335] dark:text-[#8A90A2]"><tr><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Recorded By</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Location</th><th className="px-6 py-4">Service</th><th className="px-6 py-4">Service Record</th><th className="px-6 py-4">Amount</th><th className="px-6 py-4">Added</th><th className="px-6 py-4 text-center">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#252B5C]">
                {filteredCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    tabIndex={0}
                    aria-label={`Complete service details for ${customer.fullName}`}
                    onClick={() => openServiceCompletionForm(customer)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        openServiceCompletionForm(customer);
                      }
                    }}
                    className="cursor-pointer transition-colors hover:bg-[#FFF8F2] focus:bg-[#FFF8F2] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF7817] dark:hover:bg-[#1A2053] dark:focus:bg-[#1A2053]"
                  >
                    <td className="px-6 py-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF0E4] font-bold text-[#FF7817] dark:bg-[#252B5C]">{customer.fullName.charAt(0).toUpperCase()}</span><span className="font-semibold text-[#171A2B] dark:text-white">{customer.fullName}</span></div></td>
                    <td className="px-6 py-5">
                      {customer.createdByName ? (
                        <div><p className="text-sm font-semibold text-[#171A2B] dark:text-white">{customer.createdByName}</p><p className="mt-0.5 text-xs text-[#8A90A2]">{customer.createdByEmail}</p></div>
                      ) : <span className="text-sm text-[#8A90A2]">Not recorded</span>}
                    </td>
                    <td className="px-6 py-5"><p className="text-sm font-medium text-[#171A2B] dark:text-white">{customer.phone}</p><p className="mt-0.5 text-xs text-[#8A90A2]">{customer.email || 'No email provided'}</p></td>
                    <td className="px-6 py-5"><div className="flex items-center gap-1.5 text-sm text-[#5F667A] dark:text-[#D9DDE8]"><MapPin className="h-4 w-4 shrink-0 text-[#FF7817]" />{[customer.city, customer.country].filter(Boolean).join(', ') || 'Not provided'}</div></td>
                    <td className="px-6 py-5"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#0F4C81] dark:bg-blue-500/15 dark:text-blue-300">{customer.service}</span></td>
                    <td className="px-6 py-5"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${customer.serviceInfo || customer.amount !== null || customer.receipt ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'}`}>{customer.serviceInfo || customer.amount !== null || customer.receipt ? 'Completed' : 'Pending'}</span></td>
                    <td className="px-6 py-5 text-sm font-bold text-[#171A2B] dark:text-white">{formatAmount(customer.amount)}</td>
                    <td className="whitespace-nowrap px-6 py-5 text-sm text-[#5F667A] dark:text-[#AEB4C7]">{new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-6 py-5 text-center" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => downloadReceipt(customer)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#5F667A] transition-colors hover:bg-[#FFF0E4] hover:text-[#FF7817] focus:outline-none focus:ring-2 focus:ring-[#FF7817]/40 dark:text-[#AEB4C7] dark:hover:bg-[#252B5C] dark:hover:text-[#FF9B52]"
                          aria-label={`Download receipt for ${customer.fullName}`}
                          title="Download Receipt"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setViewing(customer)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#5F667A] transition-colors hover:bg-[#FFF0E4] hover:text-[#FF7817] focus:outline-none focus:ring-2 focus:ring-[#FF7817]/40 dark:text-[#AEB4C7] dark:hover:bg-[#252B5C] dark:hover:text-[#FF9B52]"
                          aria-label={`View details for ${customer.fullName}`}
                          title="View Customer"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <ActionMenu actions={[{ label: 'Edit Customer', icon: <Edit3 className="h-4 w-4" />, onClick: () => openEditForm(customer) }, { label: 'Complete Service Details', icon: <CheckCircle2 className="h-4 w-4" />, onClick: () => openServiceCompletionForm(customer) }, { label: 'Delete Customer', icon: <Trash2 className="h-4 w-4" />, onClick: () => setDeleting(customer), variant: 'danger' }]} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal isOpen={Boolean(viewing)} onClose={() => setViewing(null)} title="Customer Details" maxWidth="2xl">
        {viewing && <div className="space-y-5">
          <div className="grid gap-4 rounded-xl bg-[#F8F9FC] p-5 sm:grid-cols-2 dark:bg-[#0B1030]">
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#8A90A2]">Full Name</p><p className="mt-1 font-semibold text-[#171A2B] dark:text-white">{viewing.fullName}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-[#8A90A2]">Service</p><p className="mt-1 font-semibold text-[#171A2B] dark:text-white">{viewing.service}</p></div>
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#8A90A2]">Phone</p><p className="mt-1 text-sm text-[#171A2B] dark:text-white">{viewing.phone}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-[#8A90A2]">Email</p><p className="mt-1 text-sm text-[#171A2B] dark:text-white">{viewing.email || 'Not provided'}</p></div>
            <div><p className="text-xs font-bold uppercase tracking-wider text-[#8A90A2]">Country</p><p className="mt-1 text-sm text-[#171A2B] dark:text-white">{viewing.country || 'Not provided'}</p></div><div><p className="text-xs font-bold uppercase tracking-wider text-[#8A90A2]">City</p><p className="mt-1 text-sm text-[#171A2B] dark:text-white">{viewing.city || 'Not provided'}</p></div>
            <div className="sm:col-span-2"><p className="text-xs font-bold uppercase tracking-wider text-[#8A90A2]">Recorded By</p><p className="mt-1 text-sm font-semibold text-[#171A2B] dark:text-white">{viewing.createdByName || 'Not recorded'}</p>{viewing.createdByEmail && <p className="mt-0.5 text-xs text-[#8A90A2]">{viewing.createdByEmail}</p>}</div>
          </div>
          <div><p className="text-xs font-bold uppercase tracking-wider text-[#8A90A2]">Service Information</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#171A2B] dark:text-[#D9DDE8]">{viewing.serviceInfo || 'Service details have not been added yet.'}</p></div>
          <div><p className="text-xs font-bold uppercase tracking-wider text-[#8A90A2]">Amount</p><p className="mt-1 text-xl font-bold text-[#0F4C81] dark:text-blue-300">{formatAmount(viewing.amount)}</p></div>
          {viewing.receipt && <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8A90A2]">Receipt</p><img src={viewing.receipt} alt={`Receipt for ${viewing.fullName}`} className="max-h-[420px] w-full rounded-xl border border-[#D9DDE8] object-contain dark:border-[#252B5C]" /></div>}
          <div className="flex justify-end"><Button variant="secondary" onClick={() => setViewing(null)}>Close</Button></div>
        </div>}
      </Modal>

      <ConfirmModal isOpen={Boolean(deleting)} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Delete Customer" message={`Are you sure you want to delete “${deleting?.fullName || ''}”? This customer record will be permanently removed.`} confirmText="Delete Customer" isLoading={isSaving} />
    </div>
  );
};
