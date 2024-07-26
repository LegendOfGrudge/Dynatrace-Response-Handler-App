import { Input } from '../shared/types';
import https from 'https';

export default async function (payload: Input) {
  console.log(`Hostname: ${payload.hostname}`);
  console.log(`Port: ${payload.port}`);
  console.log(`Path: ${payload.path}`);
  console.log(`Body: ${payload.postBody}`);

  const data = payload.postBody;

  const options = {
    hostname: payload.hostname,
    port: payload.port,
    path: payload.path,
    method: payload.method,
    rejectUnauthorized: false,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
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

    // Write data to request body
    req.write(data);
    req.end();
  });
}
  // fetch("https://swapi.dev/api/people/1/", {
  //   method: "GET",
  //   redirect: "follow"
  // })
  // .then((response) => response.text())
  // .then((result) => console.log(result))
  // .catch((error) => console.error(error));
