import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const judge0Config = {
  baseURL: process.env.JUDGE0_API_URL || 'http://localhost:2358',
  headers: {
    'Content-Type': 'application/json',
  }
};



// Add API key if provided
if (process.env.JUDGE0_API_KEY) {
  judge0Config.headers['X-Auth-Token'] = process.env.JUDGE0_API_KEY;
}

const judge0Client = axios.create(judge0Config);

// Language ID mapping (string to number)
export const LANGUAGE_MAP = {
  'c': 50,           // C (GCC 9.2.0)
  'cpp': 54,         // C++ (GCC 9.2.0)
  'java': 62,        // Java (OpenJDK 13.0.1)
  'python': 71,      // Python (3.8.1)
  'javascript': 63,  // JavaScript (Node.js 12.14.0)
  'go': 60,          // Go (1.13.5)
  'rust': 73         // Rust (1.40.0)
};

// Reverse mapping (number to string)
export const LANGUAGE_ID_MAP = {
  50: 'c',
  54: 'cpp',
  62: 'java',
  71: 'python',
  63: 'javascript',
  60: 'go',
  73: 'rust'
};

export default judge0Client;
