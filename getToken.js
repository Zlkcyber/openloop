import fs from 'fs';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { logger } from './utils/logger.js';

// Path to the files
const filePath = './accounts.txt';
const tokenFilePath = './token.txt';
const proxyFilePath = './proxy.txt';

// Add delay function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Read proxy list
const getProxies = () => {
    try {
        return fs.readFileSync(proxyFilePath, 'utf8').split('\n').map(line => line.trim()).filter(Boolean);
    } catch (error) {
        console.error('Error reading proxy file:', error.message);
        return [];
    }
};

// Function to read and parse accounts
function readAccounts(filePath) {
    const accounts = [];
    const data = fs.readFileSync(filePath, 'utf-8');

    data.split('\n').forEach((line) => {
        // Match format: Email:email@example.com,password
        const match = line.match(/Email:(.+?),(.+)/);
        if (match) {
            const email = match[1].trim();
            const password = match[2].trim();
            accounts.push({ email, password });
        }
    });

    return accounts;
}

// Get random proxy
function getRandomProxy(proxies) {
    if (!proxies || proxies.length === 0) return null;
    // Return proxy address directly without 'http://' prefix
    return proxies[Math.floor(Math.random() * proxies.length)];
}

async function loginWithRetry(email, password, proxies, retries = 5) {
    for (let i = 0; i < retries; i++) {
        const proxy = getRandomProxy(proxies);
        // Create proxy agent using proxy string directly
        const proxyAgent = proxy ? new HttpsProxyAgent(proxy) : null;

        try {
            const loginPayload = { username: email, password };
            console.log(`Attempting login for email: ${email} (Attempt ${i + 1}/${retries})`);
            if (proxy) {
                console.log(`Using proxy: ${proxy}`);
            }
            
            const loginResponse = await fetch('https://api.openloop.so/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                },
                body: JSON.stringify(loginPayload),
                agent: proxyAgent,
                timeout: 10000 // 10 seconds timeout
            });

            if (!loginResponse.ok) {
                const errorText = await loginResponse.text();
                console.error(`Login failed for ${email}! Status: ${loginResponse.status}, Error: ${errorText}`);
                
                if (loginResponse.status === 429) { // Rate limit
                    console.log('Rate limit hit, waiting longer...');
                    await delay(3000); // Reduced wait time to 3 seconds
                    continue;
                }
                
                throw new Error(`Login failed! Status: ${loginResponse.status}`);
            }

            const loginData = await loginResponse.json();
            return loginData.data.accessToken;
        } catch (error) {
            if (error.message.includes('ENOTFOUND')) {
                console.log('Proxy connection failed, trying another proxy...');
                continue;
            }
            console.error(`Attempt ${i + 1} failed for ${email}:`, error.message);
            if (i < retries - 1) {
                const waitTime = Math.pow(2, i) * 500; // Reduced exponential backoff
                console.log(`Waiting ${waitTime}ms before retry...`);
                await delay(waitTime);
            } else {
                throw error;
            }
        }
    }
}

async function getToken() {
    console.log('Starting token retrieval process...');
    
    // Read proxy list
    const proxies = getProxies();
    console.log(`Loaded ${proxies.length} proxies`);

    const accounts = readAccounts(filePath);
    console.log(`Loaded ${accounts.length} accounts`);
    let successCount = 0;
    let failureCount = 0;

    for (const { email, password } of accounts) {
        try {
            // Reduce request interval to 500ms
            await delay(500);
            
            const token = await loginWithRetry(email, password, proxies);
            if (token) {
                fs.appendFileSync(tokenFilePath, token + '\n', 'utf8');
                console.log(`✅ Success: ${email}`);
                successCount++;
            }
        } catch (error) {
            console.error(`❌ Failed: ${email} - ${error.message}`);
            failureCount++;
            
            // If too many consecutive failures, increase wait time
            if (failureCount > 5) {
                console.log('Multiple failures detected, waiting for 5 seconds...');
                await delay(5000);
                failureCount = 0; // Reset failure count
            }
        }
        
        // Log progress
        console.log(`Progress: ${successCount + failureCount}/${accounts.length} (${successCount} successful, ${failureCount} failed)`);
    }
    
    console.log(`\nFinal Results:`);
    console.log(`Total Accounts: ${accounts.length}`);
    console.log(`Successful Logins: ${successCount}`);
    console.log(`Failed Logins: ${failureCount}`);
    console.log(`Success Rate: ${((successCount / accounts.length) * 100).toFixed(2)}%`);
}

// Immediately Invoked Function Expression (IIFE)
(async () => {
    console.log('Script started');
    try {
        await getToken();
        console.log('Script completed');
    } catch (error) {
        console.error('Script error:', error);
    }
})();

export default getToken;
