import { Input } from '@/app/components/ui/input';
import { useFilePickerContext } from '../../hooks';

export function FilePickerInput({ ...props }: React.ComponentProps<'input'>) {
  const [, { getInputProps }] = useFilePickerContext();

  return (
    <Input
      className="sr-only w-0.5"
      aria-label="Upload image file"
      formNoValidate
      {...props}
      {...getInputProps()}
    />
  );
}
