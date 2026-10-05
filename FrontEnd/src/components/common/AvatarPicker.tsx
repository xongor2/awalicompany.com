import React, { ChangeEvent, useId, useState } from 'react';
import { ImagePlus, Loader2 } from 'lucide-react';
import { NATURE_AVATARS } from '../../constants/natureAvatars';
import { prepareAvatarImage } from '../../utils/avatarImage';

interface AvatarPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const AvatarPicker: React.FC<AvatarPickerProps> = ({
  value,
  onChange,
  label = 'Profile Avatar',
}) => {
  const inputId = useId();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsProcessing(true);
    setError('');
    try {
      onChange(await prepareAvatarImage(file));
    } catch (uploadError: any) {
      setError(uploadError.message || 'Unable to process the selected image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-[#171A2B] dark:text-[#D9DDE8]">{label}</legend>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#D9DDE8] bg-[#F8F9FC] p-3 dark:border-[#252B5C] dark:bg-[#0B1030]">
        <img
          src={value}
          alt="Selected profile avatar preview"
          className="h-16 w-16 rounded-full border-2 border-[#FF7817] object-cover shadow-sm"
        />
        <div className="min-w-[180px] flex-1">
          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="sr-only"
          />
          <label
            htmlFor={inputId}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#151A46] px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-[#252B5C] focus-within:ring-2 focus-within:ring-[#FF7817] dark:bg-[#FF7817] dark:hover:bg-[#D95D00]"
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {isProcessing ? 'Processing...' : 'Upload Photo'}
          </label>
          <p className="mt-1.5 text-[11px] text-[#8A90A2]">JPG, PNG, or WebP · maximum 8 MB</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs text-[#8A90A2]">Nature presets:</span>
        {NATURE_AVATARS.map((url, index) => (
          <button
            key={url}
            type="button"
            onClick={() => {
              setError('');
              onChange(url);
            }}
            aria-label={`Select nature avatar ${index + 1}`}
            className={`h-8 w-8 cursor-pointer overflow-hidden rounded-full border-2 transition-all ${
              value === url
                ? 'scale-110 border-[#FF7817] shadow-sm'
                : 'border-transparent opacity-75 hover:opacity-100'
            }`}
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>

      {error ? <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p> : null}
    </fieldset>
  );
};
