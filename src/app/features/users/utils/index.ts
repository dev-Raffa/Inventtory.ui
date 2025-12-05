export function getUserNameInitials(name: string): string {
  return (
    name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'
  );
}
