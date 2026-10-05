import { BlockList, isIP } from 'node:net';

type IpFamily = 'ipv4' | 'ipv6';
export type WebhookIpCheck = 'allowed' | 'denied' | 'misconfigured';

const normalizeRemoteAddress = (value: string): string =>
  value.startsWith('::ffff:') ? value.slice('::ffff:'.length) : value;

const buildAllowlist = (configuredAllowlist: string | undefined): BlockList | null => {
  const entries = configuredAllowlist
    ?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!entries?.length) return null;

  const allowlist = new BlockList();
  try {
    for (const entry of entries) {
      const [network, rawPrefix] = entry.split('/');
      const networkVersion = isIP(network);
      if (!networkVersion) return null;
      const networkFamily: IpFamily = networkVersion === 4 ? 'ipv4' : 'ipv6';

      if (rawPrefix === undefined) {
        allowlist.addAddress(network, networkFamily);
        continue;
      }

      const prefix = Number(rawPrefix);
      const maxPrefix = networkVersion === 4 ? 32 : 128;
      if (!Number.isInteger(prefix) || prefix < 0 || prefix > maxPrefix) {
        return null;
      }
      allowlist.addSubnet(network, prefix, networkFamily);
    }
  } catch {
    return null;
  }

  return allowlist;
};

export const isWebhookIpAllowlistConfigured = (
  configuredAllowlist: string | undefined,
): boolean => buildAllowlist(configuredAllowlist) !== null;

export const checkWebhookSourceIp = (
  remoteAddress: string | undefined,
  configuredAllowlist: string | undefined,
): WebhookIpCheck => {
  const allowlist = buildAllowlist(configuredAllowlist);
  if (!allowlist) return 'misconfigured';
  if (!remoteAddress) return 'denied';

  const address = normalizeRemoteAddress(remoteAddress);
  const addressVersion = isIP(address);
  if (!addressVersion) return 'denied';
  const addressFamily: IpFamily = addressVersion === 4 ? 'ipv4' : 'ipv6';

  return allowlist.check(address, addressFamily) ? 'allowed' : 'denied';
};
