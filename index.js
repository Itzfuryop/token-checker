import fs from 'fs';
import readline from 'readline';
import fetch from 'node-fetch';
import chalk from 'chalk';

// Create a readline interface to read the tokens file
const rl = readline.createInterface({
    input: fs.createReadStream('token.txt'),
    output: process.stdout,
    terminal: false
});

// Create a Set to store processed tokens
const processedTokens = new Set();

// Function to check if a token is valid and get the username
async function checkToken(token) {
    try {
        const response = await fetch('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: token }
        });

        if (response.ok) {
            const userData = await response.json();
            return { valid: true, username: userData.username };
        }
        return { valid: false, username: null };
    } catch (error) {
        return { valid: false, username: null };
    }
}

// Read tokens and channel IDs line by line and check them
rl.on('line', async (line) => {
    const [token, channelId] = line.split(' ');
    const trimmedToken = token.trim();

    // Skip if the token has already been processed
    if (processedTokens.has(trimmedToken)) {
        console.log(chalk.yellow(`Skipping duplicate token: ${trimmedToken}`));
        return; // Skip further processing for this token
    }

    // Add the token to the processed set
    processedTokens.add(trimmedToken);

    console.log(chalk.white(`Checking token: ${trimmedToken}`));

    const { valid, username } = await checkToken(trimmedToken);

    if (valid) {
        console.log(chalk.green(`- ${trimmedToken} | Valid | ${username} | ${channelId || 'none'}`));
        fs.appendFileSync('validtokens.txt', `${trimmedToken} | Valid | ${username} | ${channelId || 'none'}\n`);
    } else {
        console.log(chalk.red(`- ${trimmedToken} | Invalid | | ${channelId || 'none'}`));
    }
});

rl.on('close', () => {
    console.log(chalk.blue('Finished checking tokens.'));
});