import { useFilePickerContext } from '../../hooks';

export function FilePickerCount({ label }: { label: string }) {
  const [{ files }] = useFilePickerContext();
  return (
    <p>
      {label} ({files.length})
    </p>
  );
}
