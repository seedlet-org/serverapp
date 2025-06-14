import { compareSync, genSaltSync, hashSync } from 'bcryptjs';

export function hashValue(value: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(value, salt);
  return hash;
}

export function compareValue(value: string, hash: string) {
  return compareSync(value, hash);
}
export function generateOTP() {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}
