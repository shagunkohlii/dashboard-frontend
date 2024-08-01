import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import "./Dashboard.css";
Chart.register(...registerables);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState();

  const chartConfigs = [
    {
      id: "intensityChart",
      label: "Intensity by Region",
      key: "region",
      type: "pie",
    },
    {
      id: "likelihoodChart",
      label: "Likelihood by Country",
      key: "country",
      type: "bar",
    },
    {
      id: "relevanceChart",
      label: "Relevance by Country",
      key: "topic",
      type: "line",
    },
    { id: "topicsChart", label: "Topics", key: "relevance", type: "bar" },
    { id: "cityChart", label: "City", key: "intensity", type: "line" },
    { id: "regionChart", label: "Region", key: "intensity", type: "pie" },
    { id: "yearChart", label: "Year", key: "start_year", type: "doughnut" },
    { id: "countryChart", label: "Country", key: "country", type: "polarArea" },
  ];

  const chartRefs = useRef({});

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const resdata = await fetch(
          `${process.env.REACT_APP_BASE_URL}/api/data`
        );
        const responseData = await resdata.json();
        console.log(responseData);
        setData(responseData);
      } catch (error) {
        console.error(error);
        setError("Failed to fetch data");
      }
    };
    dataFetch();
  }, []);

  useEffect(() => {
    Object.values(chartRefs).forEach((chartRef) => {
      if (chartRef.current) {
        if (typeof chartRef.current.destroy === "function") {
          chartRef.current.destroy();
        } else {
          // Alternative cleanup if destroy() is not available
          const canvas = chartRef.current.canvas;
          if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
        }
      }
    });

    const createChart = (ctx, label, data, chartType, colors) => {
      return new Chart(ctx, {
        type: chartType,
        data: {
          labels: Object.values(data),
          datasets: [
            {
              label,
              data: Object.values(data),
              backgroundColor: colors,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    };

    const aggregateData = (data, key) => {
      // Check if data is null or undefined
      if (!data) {
        console.error("Data is null or undefined");
        return {};
      }

      // Check if data is an array
      if (!Array.isArray(data)) {
        console.error("Data is not an array");
        return {};
      }

      const aggregated = data.reduce((acc, curr) => {
        if (curr && key in curr) {
          // Check if curr is not null and has the key
          if (Array.isArray(curr[key])) {
            curr[key].forEach((item) => {
              if (item !== null && item !== undefined) {
                // Check for null/undefined items
                acc[item] = (acc[item] || 0) + 1;
              }
            });
          } else {
            if (curr[key] !== null && curr[key] !== undefined) {
              // Check for null/undefined values
              acc[curr[key]] = (acc[curr[key]] || 0) + 1;
            }
          }
        }
        return acc;
      }, {});

      // Sort and limit to 8-10 data points
      const sortedKeys = Object.keys(aggregated).sort(
        (a, b) => aggregated[b] - aggregated[a]
      );

      const limitedKeys = sortedKeys.slice(0, 10);

      const limitedData = limitedKeys.reduce((acc, key) => {
        acc[key] = aggregated[key];
        return acc;
      }, {});

      console.log(limitedData); // Log limitedData instead of aggregateData
      return limitedData;
    };
    chartConfigs.forEach(({ id, label, key, type }) => {
      const ctx = document.getElementById(id).getContext("2d");
      const aggregatedData = aggregateData(data, key);
      if (chartRefs.current[id]) {
        chartRefs.current[id].destroy();
      }
      chartRefs.current[id] = createChart(ctx, label, aggregatedData, type);
    });
  }, [data, chartConfigs]);

  return (
    <div className="dashboard">
      {chartConfigs.map(({ id, label }) => (
        <div key={id} className="v-col-md-6 v-col-12">
          <div className="v-card v-theme--light v-card--density-default v-card--variant-elevated">
            <div className="v-card-item">
              <div className="v-card-item__content">
                <h4 className="v-card-title">{label}</h4>
              </div>
            </div>
            <div className="v-card-text">
              <canvas width={525} height={500} role="img" id={id}></canvas>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
