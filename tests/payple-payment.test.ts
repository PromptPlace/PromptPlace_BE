import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { resolvePaypleConfirmUrl, verifyPayplePayment, PayplePaymentResult } from '../src/purchases/utils/payple';

const callback: PayplePaymentResult = {
  PCD_PAY_RST: 'success',
  PCD_PAY_WORK: 'CERT',
  PCD_PAY_CODE: '0000',
  PCD_PAY_MSG: '인증완료',
  PCD_PAY_OID: 'pay-test',
  PCD_PAY_TYPE: 'card',
  PCD_PAY_TOTAL: '1000',
  PCD_PAY_REQKEY: 'request-key',
  PCD_AUTH_KEY: 'auth-key',
  PCD_USER_DEFINE1: JSON.stringify({ prompt_id: 10, user_id: 20 }),
  PCD_PAY_COFURL: 'https://demo-api-v2.payple.kr/api/v1/payments/cards/approval/confirm',
};

test('CERT 승인 URL은 Payple HTTPS 호스트만 허용한다', () => {
  assert.equal(resolvePaypleConfirmUrl(callback), callback.PCD_PAY_COFURL);
  assert.throws(() => resolvePaypleConfirmUrl({ ...callback, PCD_PAY_COFURL: 'https://example.com/confirm' }));
});

test('승인 응답과 인증 결과가 일치할 때만 결제를 확정한다', async () => {
  process.env.PAYPLE_PAY_CST_ID = 'merchant';
  process.env.PAYPLE_PAY_CUST_KEY = 'secret';
  const originalPost = axios.post;
  const approval: PayplePaymentResult = {
    ...callback,
    PCD_PAY_MSG: '카드결제완료',
    PCD_USER_DEFINE1: JSON.stringify({ prompt_id: 10, user_id: 20 }),
  };
  try {
    axios.post = (async (_url: string, body: any) => {
      assert.equal(body.PCD_PAY_REQKEY, 'request-key');
      return { data: approval };
    }) as typeof axios.post;
    const paid = await verifyPayplePayment(callback, { amount: 1000 });
    assert.equal(paid.payOid, 'pay-test');
    assert.equal(paid.customData.user_id, 20);

    approval.PCD_PAY_OID = 'other-order';
    await assert.rejects(verifyPayplePayment(callback, { amount: 1000 }));
    approval.PCD_PAY_OID = 'pay-test';
    approval.PCD_PAY_TOTAL = '2000';
    await assert.rejects(verifyPayplePayment(callback, { amount: 1000 }));
  } finally {
    axios.post = originalPost;
  }
});
