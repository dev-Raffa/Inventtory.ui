export function getUserNameInitials(name: string): string {
  return name.toLowerCase() === 'desconhecido'
    ? 'DE'
    : name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'US';
}
