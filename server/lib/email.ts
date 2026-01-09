import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then((data: any) => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
// Always call this function again to get a fresh client.
export async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const gmail = await getUncachableGmailClient();
    
    const subject = "Welcome to Boardy - Let's Get Playing!";
    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h1 style="color: #8b5cf6; margin-bottom: 24px;">Welcome to Boardy!</h1>
        <p style="font-size: 16px; color: #475569; line-height: 1.6;">Hi ${name},</p>
        <p style="font-size: 16px; color: #475569; line-height: 1.6;">We're thrilled to have you join our community of board game enthusiasts. Boardy is your home for discovering and playing the best games with friends.</p>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
          <h2 style="font-size: 18px; color: #1e293b; margin-top: 0;">What you can do:</h2>
          <ul style="color: #475569; line-height: 1.6;">
            <li>Browse and rent from our extensive collection</li>
            <li>Join our Saturday Night Gaming events</li>
            <li>Connect with fellow gamers nearby</li>
          </ul>
        </div>

        <div style="text-align: center; margin-top: 32px;">
          <a href="https://${process.env.REPLIT_DEV_DOMAIN}" style="background-color: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Explore Games</a>
        </div>

        <hr style="margin-top: 40px; border: 0; border-top: 1px solid #e2e8f0;" />
        <p style="font-size: 14px; color: #94a3b8; text-align: center;">Happy gaming!<br/>The Boardy Team</p>
      </div>
    `;

    const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
    const messageParts = [
      `From: Boardy <me>`,
      `To: ${to}`,
      `Content-Type: text/html; charset=utf-8`,
      `MIME-Version: 1.0`,
      `Subject: ${utf8Subject}`,
      ``,
      htmlBody,
    ];
    const message = messageParts.join('\n');

    // The body needs to be base64url encoded.
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    
    console.log(`Welcome email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}
