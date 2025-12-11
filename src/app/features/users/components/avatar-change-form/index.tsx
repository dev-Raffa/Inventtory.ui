import Cropper from 'react-easy-crop';
import { Loader2, ZoomIn, ZoomOut, ImageIcon } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Slider } from '@/app/components/ui/slider';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/app/components/ui/avatar';

import {
  FilePicker,
  FilePickerButton,
  FilePickerInput
} from '@/app/components/shared/file-picker';

import { useAvatarChange } from './hook';

type AvatarChangeFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AvatarChangeForm({
  onSuccess,
  onCancel
}: AvatarChangeFormProps) {
  const {
    files,
    setFiles,
    crop,
    setCrop,
    zoom,
    setZoom,
    onCropComplete,
    isSubmitting,
    handleSave,
    userAvatar
  } = useAvatarChange({ onSuccess });

  const hasFile = files.length > 0;

  return (
    <div className="space-y-6">
      {!hasFile && (
        <div className="flex flex-col items-center justify-center gap-6 py-8">
          <Avatar className="h-32 w-32 border-4 border-muted">
            <AvatarImage src={userAvatar} className="object-cover" />
            <AvatarFallback className="text-4xl bg-muted">
              <ImageIcon className="h-12 w-12 opacity-50" />
            </AvatarFallback>
          </Avatar>

          <FilePicker
            files={files}
            onFilesChange={setFiles}
            maxFiles={1}
            accept="image/*"
          >
            <FilePickerInput />
            <label className="cursor-pointer">
              <FilePickerButton label="carregar foto" />
            </label>
          </FilePicker>

          <p className="text-sm text-muted-foreground text-center">
            Formatos suportados: JPG, PNG, WEBP.
          </p>
        </div>
      )}

      {hasFile && (
        <div className="flex flex-col gap-4">
          <div className="relative h-[300px] w-full bg-black/5 rounded-md overflow-hidden border">
            <Cropper
              image={files[0].src}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
              cropShape="round"
              showGrid={false}
            />
          </div>

          <div className="flex items-center gap-4 px-2">
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={(val) => setZoom(val[0])}
              className="flex-1"
            />
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Arraste para ajustar e use o slider para ampliar.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={hasFile ? () => setFiles([]) : onCancel}
          disabled={isSubmitting}
        >
          {hasFile ? 'Trocar Imagem' : 'Cancelar'}
        </Button>

        {hasFile && (
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Avatar
          </Button>
        )}
      </div>
    </div>
  );
}
