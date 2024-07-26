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
    const input: { data: { id: string; method: string; hostname: string; port: string; path: string; cookieName: string; cookieValue: string; csrf: string; postBody: string; } } = {
      data: {
        id:"api-request",
        method: 'GET',
        hostname: hostname,
        port: port,
        path: '?{"request":"getCharts"}',
        cookieName: cookie_name,
        cookieValue: cookie_value,
        csrf: csrf,
        postBody: ''
      }
    }

    const chart_response = await functions.call('get-data', input).then((res) => res.json());
    for (let i = 0; i < chart_response.data.charts.length; i++) {
      console.log(`Chart: ${chart_response.data.charts[i].name}:${chart_response.data.charts[i].uid}`);

      let chart_name = chart_response.data.charts[i].name;
      let comment = chart_response.data.charts[i].comment;
      chart_name = chart_name.replaceAll(' ', '_');
      comment = comment.replaceAll(' ', '_');

      const metricsData = `Chart,hostname=${hostname},port=${port},name=${chart_name},uid=${chart_response.data.charts[i].uid},comment=${comment},position=${chart_response.data.charts[i].position} 1`;

      metricsClient
          .ingest({
              body: metricsData
          })
          .then((response) => {
              console.log(response);
          })
          .catch((e) => {
              console.error(e);
          });
      const input: { data: { id: string; method: string; hostname: string; port: string; path: string; cookieName: string; cookieValue: string; csrf: string; postBody: string; } } = {
        data: {
          id:"api-request",
          method: 'GET',
          hostname: hostname,
          port: port,
          path: `?{"request":"getDashboardKeyPerformanceIndicators","uid":${chart_response.data.charts[i].uid}}`,
          cookieName: cookie_name,
          cookieValue: cookie_value,
          csrf: csrf,
          postBody: ''
        }
      }

      const kpi_response = await functions.call('get-data', input).then((res) => res.json());

      let date = new Date();
      let to = date.getTime() / 1000;
      let from = to - 3600;
      for (let j = 0; j < kpi_response.data.keyPerformanceIndicators.length; j++) {
        console.log(`KPI: ${kpi_response.data.keyPerformanceIndicators[j].name}:${kpi_response.data.keyPerformanceIndicators[j].uid}`);

        let kpi_name = kpi_response.data.keyPerformanceIndicators[j].name;
        let tooltip = kpi_response.data.keyPerformanceIndicators[j].tooltip;
        kpi_name = kpi_name.replaceAll(' ', '_');
        tooltip = tooltip.replaceAll(' ', '_');

        const metricsData = `KPI,hostname=${hostname},port=${port},name=${kpi_name},uid=${kpi_response.data.keyPerformanceIndicators[j].uid},chart=${chart_name},tooltip=${tooltip},position=${kpi_response.data.keyPerformanceIndicators[j].position},instance=${kpi_response.data.keyPerformanceIndicators[j].instance},unit=${kpi_response.data.keyPerformanceIndicators[j].unit} 1`;

        metricsClient
            .ingest({
                body: metricsData
            })
            .then((response) => {
                console.log(response);
            })
            .catch((e) => {
                console.error(e);
            });

        const input: { data: { id: string; method: string; hostname: string; port: string; path: string; cookieName: string; cookieValue: string; csrf: string; postBody: string; } } = {
          data: {
            id:"api-request",
            method: 'POST',
            hostname: hostname,
            port: port,
            path: `?{"request":"postRequest"}`,
            cookieName: cookie_name,
            cookieValue: cookie_value,
            csrf: csrf,
            postBody: `{"request":"getDashboardKeyPerformanceIndicatorData","uid":${kpi_response.data.keyPerformanceIndicators[j].uid},"data":{"from":${from},"to":${to},"instance":${instance}}}`
          }
        }

        const dashboard_response = await functions.call('get-data', input).then((res) => res.json());
        for (let k = 0; k < dashboard_response.data.keyPerformanceIndicatorData.timestamps.length; k++) {
          const metricsData = `KPI_Data,hostname=${hostname},port=${port},name=${kpi_name},uid=${kpi_response.data.keyPerformanceIndicators[j].uid},chart=${chart_name},tooltip=${tooltip},position=${kpi_response.data.keyPerformanceIndicators[j].position},instance=${kpi_response.data.keyPerformanceIndicators[j].instance},unit=${kpi_response.data.keyPerformanceIndicators[j].unit} ${dashboard_response.data.keyPerformanceIndicatorData.values[k]} ${dashboard_response.data.keyPerformanceIndicatorData.timestamps[k] * 1000}`;

          metricsClient
            .ingest({
                body: metricsData
            })
            .then((response) => {
                console.log(response);
            })
            .catch((e) => {
                console.error(e);
            });
        }
      }
    }
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
            <label style={{ width: '85px' }}>Hostname</label>
            <input
              type="text"
              defaultValue={hostname}
              style={{ width: '180px' }}
              onBlur={(e) => setHostname(e.target.value)}
            />
          </div>
          <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '85px' }}>Port</label>
            <input
              type="text"
              defaultValue={port}
              style={{ width: '180px' }}
              onBlur={(e) => setPort(e.target.value)}
            />
          </div>
          <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '85px' }}>Instance</label>
            <input
              type="text"
              defaultValue={instance}
              style={{ width: '180px' }}
              onBlur={(e) => setInstance(e.target.value)}
            />
          </div>
          <br />
          <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '85px' }}>Cookie Name</label>
            <input
              type="text"
              defaultValue={cookie_name}
              style={{ width: '180px' }}
              disabled
            />
          </div>
          <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '85px' }}>Cookie Value</label>
            <input
              type="text"
              defaultValue={cookie_value}
              style={{ width: '180px' }}
              disabled
            />
          </div>
          <div className="inline-field" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ width: '85px' }}>CSRF Token</label>
            <input
              type="text"
              defaultValue={csrf}
              style={{ width: '180px' }}
              disabled
            />
          </div>
          <button onClick={send}>Get Data</button>
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
