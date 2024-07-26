import React, { useState } from "react";
import { Flex, Heading, Paragraph, Strong, useCurrentTheme } from "@dynatrace/strato-components-preview";
import { Card } from "../components/Card";
import { functions } from '@dynatrace-sdk/app-utils';

import {
  FormField,
  Label,
  TextArea,
  TextInput,
  SelectV2,
} from '@dynatrace/strato-components-preview/forms';
import { Button } from '@dynatrace/strato-components-preview/buttons';

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
          <FormField>
            <Label style={{ width: '80px' }}>Method</Label>
            <SelectV2
              value={method}
              onChange={setMethod}
            >
              <SelectV2.Content>
                {METHOD_OPTIONS.map((option) => (
                  <SelectV2.Option key={option.value} value={option.value}>
                    {option.label}
                  </SelectV2.Option>
                ))}
              </SelectV2.Content>
            </SelectV2>
          </FormField>
        </div>
        <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FormField>
            <Label style={{ width: '80px' }}>Hostname</Label>
            <TextInput
              type="text"
              defaultValue={hostname}
              onChange={setHostname}
            />
          </FormField>
        </div>
        <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FormField>
            <Label style={{ width: '80px' }}>Port</Label>
            <TextInput
              type="text"
              defaultValue={port}
              onChange={setPort}
            />
          </FormField>
        </div>
        <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FormField>
            <Label style={{ width: '80px' }}>Path</Label>
            <TextInput
              type="text"
              defaultValue={path}
              onChange={setPath}
            />
          </FormField>
        </div>
        {method === 'POST' && (
          <div className="inline-field" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <FormField>
              <Label style={{ width: '80px' }}>POST Body</Label>
              <TextArea
                defaultValue={postBody}
                cols={80}
                rows={4}
                onChange={setPostBody}
              />
            </FormField>
          </div>
        )}
        <Button onClick={send}>Click Me!</Button>
        <Paragraph>Cookie: {cookieValue}</Paragraph>
        <Paragraph>CSRF: {csrf}</Paragraph>
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
