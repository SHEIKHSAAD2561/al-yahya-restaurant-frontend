'use client';

import { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Loader2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from '@/components/ui/table';
import { downloadBlob } from '@/lib/download-blob';
import { useImportProductsMutation } from '../hooks/use-import-products-mutation';
import { buildImportTemplateCsv } from '../utils/import-template';
import type { ProductImportResult } from '../types/product';

interface ImportProductsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * SIMPLE products only (same limitation the backend's importer has) — matches
 * Rewaa's own reference behavior, which calls out variants/composites as "not
 * available here directly" too. Each row is validated the same way a manual
 * save would be, so results always include a per-row pass/fail.
 */
export function ImportProductsDialog({ open, onOpenChange }: ImportProductsDialogProps) {
  const t = useTranslations('products');
  const tCommon = useTranslations('common');
  const inputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportProductsMutation();
  const [result, setResult] = useState<ProductImportResult | null>(null);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setResult(null);
      importMutation.reset();
    }
    onOpenChange(next);
  }

  function handleFile(file: File) {
    importMutation.mutate(file, { onSuccess: setResult });
  }

  const failedCount = result ? result.results.filter((row) => row.status === 'error').length : 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('form.importProducts')}</DialogTitle>
        </DialogHeader>

        {!result ? (
          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-zinc-900">{t('form.importStep1')}</p>
              <p className="mb-2 text-xs text-zinc-500">{t('form.importStep1Hint')}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadBlob(buildImportTemplateCsv(), 'products-import-template.csv')}
              >
                <Download className="size-4" />
                {t('form.downloadTemplate')}
              </Button>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-900">{t('form.importStep2')}</p>
              <p className="text-xs text-zinc-500">{t('form.importStep2Hint')}</p>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-zinc-900">{t('form.importStep3')}</p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = '';
                  if (file) handleFile(file);
                }}
              />
              <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const file = event.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
                className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/60 p-6 text-center"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="size-6 animate-spin text-brand" />
                    <p className="text-sm text-zinc-500">{t('form.importing')}</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-zinc-500">{t('form.dropCsvHere')}</p>
                    <Button type="button" size="sm" onClick={() => inputRef.current?.click()}>
                      <Upload className="size-4" />
                      {t('form.browseFiles')}
                    </Button>
                    <p className="text-xs text-zinc-400">{t('form.acceptedCsv')}</p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg bg-brand-muted px-3 py-2 text-sm text-zinc-800">
              {failedCount === 0 ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle className="size-4 shrink-0 text-amber-600" />
              )}
              {t('form.importSummary', { imported: result.imported, total: result.total })}
            </div>
            {result.results.some((row) => row.message) && (
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHead>
                    <tr>
                      <TableHeaderCell>{t('form.importRow')}</TableHeaderCell>
                      <TableHeaderCell>{t('form.sku')}</TableHeaderCell>
                      <TableHeaderCell>{tCommon('somethingWentWrong')}</TableHeaderCell>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {result.results
                      .filter((row) => row.message)
                      .map((row) => (
                        <TableRow key={row.row}>
                          <TableCell>{row.row}</TableCell>
                          <TableCell dir="ltr" className="rtl:text-end">
                            {row.sku}
                          </TableCell>
                          <TableCell className={row.status === 'error' ? 'text-red-600' : 'text-amber-600'}>
                            {row.message}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {result ? (
            <>
              <Button type="button" variant="outline" onClick={() => setResult(null)}>
                {t('form.importAnotherFile')}
              </Button>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                {tCommon('done')}
              </Button>
            </>
          ) : (
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
              {tCommon('cancel')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
