import {
  DQLEditor,
  Flex,
  Heading,
  Paragraph,
  QueryStateType,
  RunQueryButton,
  TimeseriesChart,
  convertToTimeseries,
  recommendVisualizations,
} from "@dynatrace/strato-components-preview";
import { useDqlQuery } from "@dynatrace-sdk/react-hooks";
import * as Colors from "@dynatrace/strato-design-tokens/colors";
import { ErrorIcon } from "@dynatrace/strato-icons";
import React, { useState } from "react";
import { functions } from '@dynatrace-sdk/app-utils';
import { metricsClient } from '@dynatrace-sdk/client-classic-environment-v2';

import {
  FormField,
  Label,
  TextInput,
} from '@dynatrace/strato-components-preview/forms';
import { Button } from '@dynatrace/strato-components-preview/buttons';

export const Data = () => {
  const initialQuery = "fetch logs \n| summarize count(), by:{bin(timestamp, 1m)}";

  const [editorQueryString, setEditorQueryString] = useState<string>(initialQuery);
  const [queryString, setQueryString] = useState<string>(initialQuery);
  const [ hostname, setHostname ] = useState('localhost');
  const [ port, setPort ] = useState('8001');
  const [ instance, setInstance ] = useState('1');
  const [ csrf, setCSRF ] = useState(`${localStorage.getItem('csrf')}`);
  const [ cookie_name, setCookieName ] = useState(`${localStorage.getItem('cookieName')}`);
  const [ cookie_value, setCookieValue ] = useState(`${localStorage.getItem('cookieValue')}`);

  const { data, errorDetails, isLoading, cancel, refetch } = useDqlQuery({ body: { query: queryString } });

  const recommendations = recommendVisualizations(data?.records ?? [], data?.types ?? []);

  // onClickQuery function is executed when the "RUN QUERY" Button is clicked and fetches the data from Grail.
  function onClickQuery() {
    if (isLoading) {
      cancel();
    } else {
      if (queryString !== editorQueryString) setQueryString(editorQueryString);
      else refetch();
    }
  }

  async function send() {
    const input: { data: { id: string; hostname: string; port: string; cookieName: string; cookieValue: string; csrf: string; instance: string; } } = {
      data: {
        id: "chart-request",
        hostname: hostname,
        port: port,
        cookieName: cookie_name,
        cookieValue: cookie_value,
        csrf: csrf,
        instance: instance
      }
    }

    functions.call('get-charts', input);
  }

  let queryState: QueryStateType;
  if (errorDetails) {
    queryState = "error";
  } else if (isLoading) {
    queryState = "loading";
  } else if (data) {
    queryState = "success";
  } else {
    queryState = "idle";
  }

  return (
    <>
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
              <Label style={{ width: '80px' }}>Instance</Label>
              <TextInput
                type="text"
                defaultValue={instance}
                onChange={setInstance}
              />
            </FormField>
          </div>
          <br />
          <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FormField>
              <Label style={{ width: '80px' }}>Cookie Name</Label>
              <TextInput
                type="text"
                defaultValue={cookie_name}
                readOnly
              />
            </FormField>
          </div>
          <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FormField>
              <Label style={{ width: '80px' }}>Cookie Value</Label>
              <TextInput
                type="text"
                defaultValue={cookie_value}
                readOnly
              />
            </FormField>
          </div>
          <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FormField>
              <Label style={{ width: '80px' }}>CSRF Token</Label>
              <TextInput
                type="text"
                defaultValue={csrf}
                readOnly
              />
            </FormField>
          </div>
          <Button onClick={send}>Get Data</Button>
        </div>
      </Flex>

      <Flex flexDirection="column" padding={32}>
        <DQLEditor value={queryString} onChange={(event) => setEditorQueryString(event)} />
        <Flex justifyContent={errorDetails ? "space-between" : "flex-end"}>
          {errorDetails && (
            <Flex alignItems={"center"} style={{ color: Colors.default.Text.Critical.Default }}>
              <ErrorIcon />
              <Paragraph>{errorDetails?.details?.errorMessage}</Paragraph>
            </Flex>
          )}
          {!errorDetails && !data?.records && <Paragraph>no data available</Paragraph>}
          {!errorDetails && data?.records && !recommendations.includes("TimeSeriesChart") && (
            <Paragraph>use a query which has time series data</Paragraph>
          )}
          <RunQueryButton onClick={onClickQuery} queryState={queryState}></RunQueryButton>
        </Flex>
        {data?.records && recommendations.includes("TimeSeriesChart") && (
          <TimeseriesChart data={convertToTimeseries(data.records, data.types)} gapPolicy="connect" variant="line" />
        )}
      </Flex>
    </>
  );
};
