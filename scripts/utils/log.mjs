// scripts/utils/log.mjs

export const log = {
  sect: (n) => console.log(`[=] ${n} Start`),
  end: (n) => console.log(`[=] ${n} Complete`),
  step: (n) => console.log(`[-] ${n}`),
  work: (n) => console.log(`[*] ${n}`),
  find: (n) => console.log(`[+] ${n}`),
  warn: (n) => console.log(`[?] ${n}`),
  fail: (n) => console.error(`[!] ${n}`),
};
