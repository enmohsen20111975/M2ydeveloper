const jwt = require('jsonwebtoken');
require('dotenv').config();

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwbGFuIjoibm9ybWFsIiwic291cmNlIjoiZ2xtaW52ZXN0bWVudCIsImFtb3VudCI6OTksImN1cnJlbmN5IjoiRUdQIiwidXNlcl9pZCI6ImNtb29haTcwdzAwMDA0eWQxZ2liOTVtdjIiLCJwYXltZW50X3R5cGUiOiJjYXJkIiwiYmlsbGluZ19wZXJpb2QiOiJtb250aGx5IiwicmV0dXJuX3N1Y2Nlc3MiOiJodHRwczovL2ludmlzdC5tMnkubmV0Lz9wYXltZW50PXN1Y2Nlc3MmcGxhbj1ub3JtYWwiLCJyZXR1cm5fZmFpbCI6Imh0dHBzOi8vaW52aXN0Lm0yeS5uZXQvP3BheW1lbnQ9ZmFpbGVkIiwiaWF0IjoxNzc3NzUwODA2LCJleHAiOjE3Nzc3NTI2MDZ9.RYkyZDSZavfsom_mllElVSgpDEtoIiFWC1wXLwV087M";

const SHARED_SECRET = process.env.SHARED_SECRET;

console.log('SHARED_SECRET:', SHARED_SECRET);
console.log('Token:', token);

try {
  const decoded = jwt.verify(token, SHARED_SECRET, { algorithms: ['HS256'] });
  console.log('JWT Verified successfully:', decoded);
} catch (error) {
  console.error('JWT Verification failed:', error.message);
}