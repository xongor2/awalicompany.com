import type { jsPDF } from 'jspdf';
import type { Quotation, QuotationCurrency, QuotationItem } from '../types';

const NAVY = [15, 76, 129] as const;
const LIGHT_BLUE = [234, 243, 250] as const;
const SLATE = [82, 96, 115] as const;

const money = (amount: number, currency: QuotationCurrency): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

const total = (items: QuotationItem[]): number =>
  items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

const safeFilename = (value: string): string =>
  value.replace(/[^a-z0-9_-]+/gi, '-').replace(/^-+|-+$/g, '') || 'quotation';

export const createQuotationPdf = async (quotation: Quotation): Promise<jsPDF> => {
  const { jsPDF: PdfDocument } = await import('jspdf');
  const doc = new PdfDocument({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 18;

  const drawCompanyHeader = (continuation = false) => {
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(continuation ? 16 : 22);
    doc.text('AW ALI COMPANY', margin, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Mogadishu, Somalia', pageWidth - margin, y - 5, { align: 'right' });
    doc.text('+252 61 3295050', pageWidth - margin, y, { align: 'right' });
    doc.text('info@awalicompany.com', pageWidth - margin, y + 5, { align: 'right' });
    y += continuation ? 10 : 14;

    doc.setFillColor(...NAVY);
    doc.rect(margin, y, contentWidth, 13, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(continuation ? 'QUOTATION - CONTINUED' : 'QUOTATION', margin + 4, y + 8.5);
    doc.setFontSize(9);
    doc.text(quotation.quotationNumber, pageWidth - margin - 4, y + 8.5, { align: 'right' });
    y += 19;
  };

  const addPage = () => {
    doc.addPage();
    y = 18;
    drawCompanyHeader(true);
  };

  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - 20) addPage();
  };

  const drawTableHeader = () => {
    doc.setFillColor(22, 96, 166);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('NO.', margin + 3, y + 6.5);
    doc.text('SERVICE', margin + 15, y + 6.5);
    doc.text('DESCRIPTION', margin + 66, y + 6.5);
    doc.text('QTY', margin + 128, y + 6.5, { align: 'right' });
    doc.text('UNIT PRICE', margin + 154, y + 6.5, { align: 'right' });
    doc.text('AMOUNT', pageWidth - margin - 3, y + 6.5, { align: 'right' });
    y += 10;
  };

  drawCompanyHeader();

  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(margin, y, contentWidth, 25, 'F');
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('CLIENT', margin + 4, y + 6);
  doc.text('DATE', margin + 98, y + 6);
  doc.text('VALIDITY', margin + 142, y + 6);
  doc.setFontSize(11);
  doc.text(quotation.customerName, margin + 4, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const contact = [quotation.customerEmail, quotation.customerPhone].filter(Boolean).join('  |  ');
  if (contact) doc.text(contact, margin + 4, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(quotation.quotationDate, margin + 98, y + 14);
  doc.text(`${quotation.validityDays} days`, margin + 142, y + 14);
  y += 32;

  drawTableHeader();
  quotation.items.forEach((item, index) => {
    const serviceLines = doc.splitTextToSize(item.service, 46) as string[];
    const descriptionLines = doc.splitTextToSize(item.description || '-', 55) as string[];
    const lineCount = Math.max(serviceLines.length, descriptionLines.length, 1);
    const rowHeight = Math.max(12, 5 + lineCount * 4.3);
    if (y + rowHeight > pageHeight - 28) {
      addPage();
      drawTableHeader();
    }
    if (index % 2 === 1) {
      doc.setFillColor(246, 249, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    doc.setDrawColor(207, 219, 231);
    doc.rect(margin, y, contentWidth, rowHeight);
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(String(index + 1), margin + 5, y + 7);
    doc.text(serviceLines, margin + 15, y + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(descriptionLines, margin + 66, y + 7);
    doc.text(String(item.quantity), margin + 128, y + 7, { align: 'right' });
    doc.text(money(item.unitPrice, quotation.currency), margin + 154, y + 7, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.text(money(item.quantity * item.unitPrice, quotation.currency), pageWidth - margin - 3, y + 7, { align: 'right' });
    y += rowHeight;
  });

  ensureSpace(18);
  doc.setFillColor(...LIGHT_BLUE);
  doc.rect(margin, y, contentWidth - 55, 14, 'F');
  doc.setFillColor(...NAVY);
  doc.rect(pageWidth - margin - 55, y, 55, 14, 'F');
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GRAND TOTAL', pageWidth - margin - 61, y + 9, { align: 'right' });
  doc.setTextColor(255, 255, 255);
  doc.text(money(total(quotation.items), quotation.currency), pageWidth - margin - 4, y + 9, { align: 'right' });
  y += 22;

  const termsLines = doc.splitTextToSize(quotation.terms || 'No additional terms.', contentWidth / 2 - 8) as string[];
  const noteLines = doc.splitTextToSize(quotation.notes || 'Thank you for choosing AW Ali Company.', contentWidth / 2 - 8) as string[];
  const detailsHeight = Math.max(28, 15 + Math.max(termsLines.length, noteLines.length) * 4.2);
  ensureSpace(detailsHeight + 18);
  doc.setFillColor(247, 249, 252);
  doc.rect(margin, y, contentWidth, detailsHeight, 'F');
  doc.setDrawColor(207, 219, 231);
  doc.rect(margin, y, contentWidth, detailsHeight);
  doc.line(pageWidth / 2, y, pageWidth / 2, y + detailsHeight);
  doc.setTextColor(...SLATE);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TERMS & CONDITIONS', margin + 4, y + 7);
  doc.text('THANK YOU', pageWidth / 2 + 4, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(termsLines, margin + 4, y + 13);
  doc.text(noteLines, pageWidth / 2 + 4, y + 13);
  y += detailsHeight + 10;

  ensureSpace(18);
  doc.setTextColor(...NAVY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Prepared by', margin + 2, y);
  doc.text('Client', pageWidth - margin - 2, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.preparedBy, margin + 2, y + 8);
  doc.text(quotation.customerName, pageWidth - margin - 2, y + 8, { align: 'right' });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(207, 219, 231);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
    doc.setTextColor(...NAVY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('AW ALI COMPANY  |  +252 61 3295050  |  info@awalicompany.com  |  awalicompany.com', margin, pageHeight - 7);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 7, { align: 'right' });
  }

  doc.setProperties({
    title: `Quotation ${quotation.quotationNumber}`,
    subject: `Quotation for ${quotation.customerName}`,
    author: 'AW Ali Company',
  });
  return doc;
};

export const downloadQuotationPdf = async (quotation: Quotation): Promise<void> => {
  const doc = await createQuotationPdf(quotation);
  doc.save(`${safeFilename(quotation.quotationNumber)}.pdf`);
};
