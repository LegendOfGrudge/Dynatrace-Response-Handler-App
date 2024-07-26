import React, { useState } from "react";
import { Flex, Heading, Paragraph, Strong, useCurrentTheme } from "@dynatrace/strato-components-preview";
import { Card } from "../components/Card";
import { functions } from '@dynatrace-sdk/app-utils';

export const Home = () => {
  const theme = useCurrentTheme();
  const [ method, setMethod ] = useState('POST');
  const [ hostname, setHostname ] = useState('localhost');
  const [ port, setPort ] = useState('8001');
  const [ path, setPath ] = useState('?{%22request%22:%22postRequest%22}');
  const [ postBody, setPostBody ] = useState('{"request":"login","data":{"login":"user","password":"12345678"}}');
  const [ csrf, setCSRF ] = useState('');
  const [ cookieName, setCookieName ] = useState('');
  const [ cookieValue, setCookieValue ] = useState('');
  const METHOD_OPTIONS = [
    {
      label: 'GET',
      value: 'GET',
    },
    {
      label: 'POST',
      value: 'POST',
    },
  ];

  async function send() {
    const input: { data: { id: string; method: string; hostname: string; port: string; path: string; postBody: string; } } = {
      data: {
        id:"api-request",
        method: method,
        hostname: hostname,
        port: port,
        path: path,
        postBody: postBody
      }
    }

    const response = await functions.call('get-response', input).then((res) => res.json());
    console.log(response);
    const cookie = response.cookies[0];
    const cookieName = cookie.substring(0, cookie.indexOf('='));
    const cookieValue = cookie.substring(cookie.indexOf('=')+1, cookie.length);
    setCookieName(cookieName);
    setCookieValue(cookieValue);
    setCSRF(response.data.csrfToken);
    localStorage.setItem("cookieName", cookieName);
    localStorage.setItem("cookieValue", cookieValue);
    localStorage.setItem("csrf", response.data.csrfToken);
  }

  return (
    <Flex flexDirection="column" alignItems="center" padding={32}>
      <img
        src="./assets/Dynatrace_Logo.svg"
        alt="Dynatrace Logo"
        width={150}
        height={150}
        style={{ paddingBottom: 32 }}
      ></img>

      <div className="inline-field-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
        <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ width: '80px' }}>Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            style={{ width: '120px' }}
          >
            {METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ width: '80px' }}>Hostname</label>
          <input
            type="text"
            defaultValue={hostname}
            style={{ width: '180px' }}
            onBlur={(e) => setHostname(e.target.value)}
          />
        </div>
        <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ width: '80px' }}>Port</label>
          <input
            type="text"
            defaultValue={port}
            style={{ width: '180px' }}
            onBlur={(e) => setPort(e.target.value)}
          />
        </div>
        <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ width: '80px' }}>Path</label>
          <input
            type="text"
            defaultValue={path}
            style={{ width: '180px' }}
            onBlur={(e) => setPath(e.target.value)}
          />
        </div>
        {method === 'POST' && (
          <div className="inline-field" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label>POST Body</label>
            <textarea
              defaultValue={postBody}
              cols={80}
              rows={4}
              onBlur={(e) => setPostBody(e.target.value)}
            />
          </div>
        )}
        <button onClick={send}>Click Me!</button>
        <p>Cookie: {cookieValue}</p>
        <p>CSRF: {csrf}</p>
      </div>

      <Flex gap={48} paddingTop={64} flexFlow="wrap">
        <Card
          href="/data"
          inAppLink
          imgSrc={theme === "light" ? "./assets/data.png" : "./assets/data_dark.png"}
          name="Explore data"
        />
        <Card
          href="https://dt-url.net/developers"
          imgSrc={theme === "light" ? "./assets/devportal.png" : "./assets/devportal_dark.png"}
          name="Dynatrace Developer"
        />
        <Card
          href="https://dt-url.net/devcommunity"
          imgSrc={theme === "light" ? "./assets/community.png" : "./assets/community_dark.png"}
          name="Developer Community"
        />
      </Flex>
    </Flex>
  );
};
