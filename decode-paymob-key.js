// Decode the Paymob API key JWT
const token = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFMU9USXdNQ3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5tTnB5R0lhOUFvX2Y4M2ZRWTJSNWVadnBrc1lNUVFMZkdzTTRmNy15bGJvRVZLT0pQS0JKbUZ0UHRNZ09udUZhSy1hbjMyWTJudUVKci1LOEJuVlB3Zw==";

console.log('Token:', token);

const parts = token.split('.');
console.log('Number of parts:', parts.length);

if (parts.length >= 2) {
  try {
    const headerDecoded = Buffer.from(parts[0], 'base64').toString('utf8');
    console.log('Header (decoded):', headerDecoded);
    const headerParsed = JSON.parse(headerDecoded);
    console.log('Header (parsed):', headerParsed);
  } catch (e) {
    console.error('Error decoding header:', e.message);
  }
  
  try {
    const payloadDecoded = Buffer.from(parts[1], 'base64').toString('utf8');
    console.log('Payload (decoded):', payloadDecoded);
    const payloadParsed = JSON.parse(payloadDecoded);
    console.log('Payload (parsed):', payloadParsed);
  } catch (e) {
    console.error('Error decoding payload:', e.message);
  }
} else {
  console.log('Token does not appear to be a valid JWT (less than 2 parts)');
}