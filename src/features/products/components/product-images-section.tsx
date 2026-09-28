'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useUploadProductImageMutation } from '../hooks/use-upload-product-image-mutation';
import type { ProductFormValues } from '../schemas/product-form.schema';
import { FormSection } from './form-section';

const MAX_IMAGES = 30;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

/** Files upload as soon as they're picked (POST /products/images); the form
 * only holds the resulting URLs. First image = list thumbnail. */
export function ProductImagesSection({ readOnly }: { readOnly: boolean }) {
  const t = useTranslations('products');
  const { control, setValue, getValues } = useFormContext<ProductFormValues>();
  const imageUrls = useWatch({ control, name: 'imageUrls' });
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadProductImageMutation();

  async function handleFiles(files: File[]) {
    const room = MAX_IMAGES - getValues('imageUrls').length;
    if (files.length > room) toast.error(t('form.imagesLimit', { max: MAX_IMAGES }));
    for (const file of files.slice(0, Math.max(0, room))) {
      if (!ACCEPTED_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
        toast.error(t('form.imageRejected', { name: file.name }));
        continue;
      }
      try {
        const { url } = await uploadMutation.mutateAsync(file);
        setValue('imageUrls', [...getValues('imageUrls'), url], { shouldDirty: true });
      } catch {
        // Toasted by the mutation.
      }
    }
  }

  function remove(url: string) {
    setValue(
      'imageUrls',
      getValues('imageUrls').filter((candidate) => candidate !== url),
      { shouldDirty: true },
    );
  }

  return (
    <FormSection title={t('form.images')} hint={t('form.imagesHint')}>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          void handleFiles(files);
        }}
      />
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!readOnly) void handleFiles(Array.from(event.dataTransfer.files));
        }}
        className="rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/60 p-6"
      >
        {imageUrls.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            {imageUrls.map((url) => (
              <div key={url} className="relative size-20 overflow-hidden rounded-lg border border-zinc-200 bg-white">
                <Image src={url} alt="" fill className="object-cover" unoptimized />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => remove(url)}
                    aria-label={t('form.removeImage')}
                    className="absolute end-1 top-1 rounded-full bg-white/90 p-0.5 text-zinc-600 shadow hover:text-red-600"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {!readOnly ? (
          <div className="flex flex-col items-center gap-2 text-center text-xs text-zinc-500">
            <div className="flex items-center gap-2 text-sm">
              <ImageIcon className="size-5 text-zinc-400" />
              <span className="font-medium text-zinc-800">{t('form.dropImages')}</span>
              <span>{t('form.or')}</span>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploadMutation.isPending || imageUrls.length >= MAX_IMAGES}
                className="inline-flex items-center gap-1.5 rounded-md bg-brand-muted px-2.5 py-1 font-medium text-brand disabled:opacity-50"
              >
                {uploadMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {t('form.browseImages')}
              </button>
            </div>
            <p>{t('form.imagesRules', { max: MAX_IMAGES })}</p>
          </div>
        ) : (
          imageUrls.length === 0 && <p className="text-center text-sm text-zinc-400">{t('form.noImages')}</p>
        )}
      </div>
    </FormSection>
  );
}
