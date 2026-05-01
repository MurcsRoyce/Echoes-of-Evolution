/**
 * Best-effort public IPv4/IPv6 as seen from the internet (browser → ipify).
 * Not the same as Supabase’s server-side “last sign-in IP”, which is not available to the anon client.
 */
export async function fetchClientPublicIp() {
  const res = await fetch('https://api.ipify.org?format=json');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const ip = typeof data?.ip === 'string' ? data.ip.trim() : '';
  if (!ip) throw new Error('Empty response');
  return ip;
}
