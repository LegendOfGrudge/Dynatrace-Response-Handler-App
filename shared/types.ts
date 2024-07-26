export type Input = {
  id: string;
  method: string;
  hostname: string;
  port: string;
  path: string;
  postBody: string;
}

export type TokenInput = {
  id: string;
  method: string;
  hostname: string;
  port: string;
  path: string;
  cookieName: string;
  cookieValue: string;
  csrf: string;
  postBody: string;
}