export function queryParam(url: string, key: string): string {
  const query = url.split('?')[1]?.split('#')[0] || '';
  const match = query.split('&').find(part => part.startsWith(`${key}=`));
  if (!match) {
    return '';
  }
  return decodeURIComponent(match.slice(key.length + 1).replace(/\+/g, ' '));
}
