import { ChartInput } from "../shared/types";
import { functions } from '@dynatrace-sdk/app-utils';
import { metricsClient } from '@dynatrace-sdk/client-classic-environment-v2';

export default async function (payload: ChartInput) {
  const input: { data: { id: string; method: string; hostname: string; port: string; path: string; cookieName: string; cookieValue: string; csrf: string; postBody: string; } } = {
    data: {
      id:"api-request",
      method: 'GET',
      hostname: payload.hostname,
      port: payload.port,
      path: '?{"request":"getCharts"}',
      cookieName: payload.cookieName,
      cookieValue: payload.cookieValue,
      csrf: payload.csrf,
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

    const metricsData = `Chart,hostname=${payload.hostname},port=${payload.port},name=${chart_name},uid=${chart_response.data.charts[i].uid},comment=${comment},position=${chart_response.data.charts[i].position} 1`;

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
        hostname: payload.hostname,
        port: payload.port,
        path: `?{"request":"getDashboardKeyPerformanceIndicators","uid":${chart_response.data.charts[i].uid}}`,
        cookieName: payload.cookieName,
        cookieValue: payload.cookieValue,
        csrf: payload.csrf,
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

      const metricsData = `KPI,hostname=${payload.hostname},port=${payload.port},name=${kpi_name},uid=${kpi_response.data.keyPerformanceIndicators[j].uid},chart=${chart_name},tooltip=${tooltip},position=${kpi_response.data.keyPerformanceIndicators[j].position},instance=${kpi_response.data.keyPerformanceIndicators[j].instance},unit=${kpi_response.data.keyPerformanceIndicators[j].unit} 1`;

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
          hostname: payload.hostname,
          port: payload.port,
          path: `?{"request":"postRequest"}`,
          cookieName: payload.cookieName,
          cookieValue: payload.cookieValue,
          csrf: payload.csrf,
          postBody: `{"request":"getDashboardKeyPerformanceIndicatorData","uid":${kpi_response.data.keyPerformanceIndicators[j].uid},"data":{"from":${from},"to":${to},"instance":${payload.instance}}}`
        }
      }

      const dashboard_response = await functions.call('get-data', input).then((res) => res.json());
      for (let k = 0; k < dashboard_response.data.keyPerformanceIndicatorData.timestamps.length; k++) {
        const metricsData = `KPI_Data,hostname=${payload.hostname},port=${payload.port},name=${kpi_name},uid=${kpi_response.data.keyPerformanceIndicators[j].uid},chart=${chart_name},tooltip=${tooltip},position=${kpi_response.data.keyPerformanceIndicators[j].position},instance=${kpi_response.data.keyPerformanceIndicators[j].instance},unit=${kpi_response.data.keyPerformanceIndicators[j].unit} ${dashboard_response.data.keyPerformanceIndicatorData.values[k]} ${dashboard_response.data.keyPerformanceIndicatorData.timestamps[k] * 1000}`;

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
