import test from 'node:test';
import assert from 'node:assert/strict';
import {
  checkWebhookSourceIp,
  isWebhookIpAllowlistConfigured,
} from '../src/settlements/utils/payout-webhook-security';

test('지급 웹훅 원본 IP는 exact IP와 CIDR allowlist를 지원한다', () => {
  const allowlist = '203.0.113.10, 198.51.100.0/24, 2001:db8::/32';

  assert.equal(checkWebhookSourceIp('203.0.113.10', allowlist), 'allowed');
  assert.equal(checkWebhookSourceIp('198.51.100.77', allowlist), 'allowed');
  assert.equal(checkWebhookSourceIp('2001:db8::7', allowlist), 'allowed');
  assert.equal(checkWebhookSourceIp('192.0.2.1', allowlist), 'denied');
});

test('IPv4-mapped IPv6 주소를 정규화한다', () => {
  assert.equal(
    checkWebhookSourceIp('::ffff:203.0.113.10', '203.0.113.10'),
    'allowed',
  );
});

test('allowlist 누락 또는 잘못된 항목은 안전하게 설정 오류로 처리한다', () => {
  assert.equal(isWebhookIpAllowlistConfigured('203.0.113.0/24'), true);
  assert.equal(isWebhookIpAllowlistConfigured(undefined), false);
  assert.equal(checkWebhookSourceIp('203.0.113.10', undefined), 'misconfigured');
  assert.equal(
    checkWebhookSourceIp('203.0.113.10', 'not-an-ip'),
    'misconfigured',
  );
  assert.equal(
    checkWebhookSourceIp('203.0.113.10', '203.0.113.0/99'),
    'misconfigured',
  );
});
