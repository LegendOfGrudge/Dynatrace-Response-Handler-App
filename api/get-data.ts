import { TokenInput } from "../shared/types";
import https from 'https';

export default async function (payload: TokenInput) {
  console.log(`Hostname: ${payload.hostname}`);
  console.log(`Port: ${payload.port}`);
  console.log(`Path: ${payload.path}`);
  console.log(`Cookie Name: ${payload.cookieName}`);
  console.log(`Cookie Value: ${payload.cookieValue}`);
  console.log(`CSRF: ${payload.csrf}`);
  console.log(`Body: ${payload.postBody}`);

  const data = payload.postBody;
  let headers;

  if (payload.method === "GET")
  {
    headers = {
      'Content-Type': 'application/json',
      'Cookie': `${payload.cookieName}=${payload.cookieValue}`,
      'Csrftoken': payload.csrf
    }
  }
  else
  {
    headers = {
      'Content-Type': 'application/json',
      'Cookie': `${payload.cookieName}=${payload.cookieValue}`,
      'Csrftoken': payload.csrf,
      'Content-Length': data.length
    }
  }

  const options = {
    hostname: payload.hostname,
    port: payload.port,
    path: payload.path,
    method: payload.method,
    rejectUnauthorized: false,
    headers: headers
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let result = '';

      res.on('data', (chunk) => {
        result += chunk;
      });

      res.on('end', () => {
        try {
          const parsedResult = JSON.parse(result);
          const setCookieHeader = res.headers['set-cookie'];
          const cookies = setCookieHeader ? setCookieHeader.map(cookie => cookie.split(';')[0]) : [];

          resolve({
            data: parsedResult,
            cookies: cookies
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    // Handle request error
    req.on('error', (e) => {
      reject(e);
    });

    if (payload.method === "POST")
    {
      req.write(data);
    }

    req.end();
  });
}
