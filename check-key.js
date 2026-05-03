require('dotenv').config();
const key = process.env.PAYMOB_API_KEY;
console.log('Key length:', key.length);
console.log('Key:', key);
for (let i = 0; i < key.length; i++) {
  const code = key.charCodeAt(i);
  if (code > 127 || code < 32 && code !== 10 && code !== 13) {
    console.log(`Non-printable at index ${i}: ${code}`);
  }
}
// Also check for trailing newline
console.log('Ends with newline?', key.endsWith('\n'));
console.log('Ends with carriage return?', key.endsWith('\r'));