const base64String = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFMU9USXdNQ3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5tTnB5R0lhOUFvX2Y4M2ZRWTJSNWVadnBrc1lNUVFMZkdzTTRmNy15bGJvRVZLT0pQS0JKbUZ0UHRNZ09udUZhSy1hbjMyWTJudUVKci1LOEJuVlB3Zw==";

// Decode base64
const buf = Buffer.from(base64String, 'base64');
const decoded = buf.toString('utf8');

console.log('Decoded string:', decoded);

// Try to parse as JSON if it looks like JSON
try {
  const parsed = JSON.parse(decoded);
  console.log('Parsed as JSON:', parsed);
} catch (e) {
  console.log('Not valid JSON');
  
  // Check if it's a JWT (has two dots)
  const parts = decoded.split('.');
  if (parts.length === 3) {
    console.log('Looks like a JWT token with 3 parts');
    
    // Try to decode each part
    try {
      const header = JSON.parse(Buffer.from(parts[0], 'base64').toString('utf8'));
      console.log('JWT Header:', header);
      
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      console.log('JWT Payload:', payload);
      
      console.log('JWT Signature (first 50 chars):', parts[2].substring(0, 50) + '...');
    } catch (parseError) {
      console.log('Error parsing JWT parts:', parseError.message);
    }
  }
}