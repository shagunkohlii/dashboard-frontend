import React, { useEffect, useRef, useState } from "react";
import { Chart, registerables } from "chart.js";
import "./Dashboard.css";
Chart.register(...registerables);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState();

  const chartRefs = {
    intensity: useRef(null),
    likelihood: useRef(null),
    relevance: useRef(null),
    topic: useRef(null),

    year: useRef(null),
    country: useRef(null),
    region: useRef(null),
    city: useRef(null),
  };

  useEffect(() => {
    const dataFetch = async () => {
      try {
        const resdata = await fetch(`${process.env.REACT_APP_BASE_URL}/api/data`);
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

    const intensityData = aggregateData(data, "region");
    const likelihoodData = aggregateData(data, "country");
    const relevanceData = aggregateData(data, "topic");
    const topicsData = aggregateData(data, "relevance");

    const regionData = aggregateData(data, "intensity");
    const yearData = aggregateData(data, "start_year");
    const countryData = aggregateData(data, "country");
    const cityData = aggregateData(data, "intensity");

    chartRefs.intensity.current = createChart(
      document.getElementById("intensityChart").getContext("2d"),
      "Intensity by Region",
      intensityData,
      "pie"
    );
    chartRefs.likelihood.current = createChart(
      document.getElementById("likelihoodChart").getContext("2d"),
      "likelihood by Region",
      likelihoodData,
      "bar"
    );
    chartRefs.relevance.current = createChart(
      document.getElementById("relevanceChart").getContext("2d"),
      "Relevance by Country",
      relevanceData,
      "line"
    );
    chartRefs.topic.current = createChart(
      document.getElementById("topicsChart").getContext("2d"),
      "topic",
      topicsData,
      "bar"
    );
    chartRefs.region.current = createChart(
      document.getElementById("cityChart").getContext("2d"),
      "city",
      cityData,
      "line"
    );
    chartRefs.city.current = createChart(
      document.getElementById("regionChart").getContext("2d"),
      "region",
      regionData,
      "pie"
    );
    chartRefs.year.current = createChart(
      document.getElementById("yearChart").getContext("2d"),
      "year",
      yearData,
      "doughnut"
    );
    chartRefs.country.current = createChart(
      document.getElementById("countryChart").getContext("2d"),
      "country",
      countryData,
      "polarArea"
    );
  }, [data, chartRefs]);

  return (
    <div className="dashboard">
      <div className="v-col-md-6 v-col-12">
        <div className="v-card v-theme--light v-card--density-default v-card--variant-elevated">
          <div className="v-card-item">
            <div className="v-card-item__content">
              <h4 className="v-card-title">Likelihood by Country</h4>
            </div>
          </div>
          <div className="v-card-text">
            <canvas
              width={525}
              height={500}
              role="img"
              id="likelihoodChart"
            ></canvas>
          </div>
        </div>
      </div>
      <div className="v-col-md-6 v-col-12">
        <div className="v-card v-theme--light v-card--density-default v-card--variant-elevated">
          <div className="v-card-item">
            <div className="v-card-item__content">
              <h4 className="v-card-title">Intensity by Region</h4>
            </div>
          </div>
          <div className="v-card-text">
            <canvas
              width={525}
              height={500}
              role="img"
              id="intensityChart"
            ></canvas>
          </div>
        </div>
      </div>
      <div className="v-col-md-6 v-col-12">
        <div className="v-card v-theme--light v-card--density-default v-card--variant-elevated">
          <div className="v-card-item">
            <div className="v-card-item__content">
              <h4 className="v-card-title">Relevance by country</h4>
            </div>
          </div>
          <div className="v-card-text">
            <canvas
              width={525}
              height={500}
              role="img"
              id="relevanceChart"
            ></canvas>
          </div>
        </div>
      </div>
      <div className="v-col-md-6 v-col-12">
        <div className="v-card v-theme--light v-card--density-default v-card--variant-elevated">
          <div className="v-card-item">
            <div className="v-card-item__content">
              <h4 className="v-card-title">Topics</h4>
            </div>
          </div>
          <div className="v-card-text">
            <canvas
              width={525}
              height={500}
              role="img"
              id="topicsChart"
            ></canvas>
          </div>
        </div>
      </div>
      <div className="v-col-md-6 v-col-12">
        <div className="v-card v-theme--light v-card--density-default v-card--variant-elevated">
          <div className="v-card-item">
            <div className="v-card-item__content">
              <h4 className="v-card-title">City</h4>
            </div>
          </div>
          <div className="v-card-text">
            <canvas width={525} height={500} role="img" id="cityChart"></canvas>
          </div>
        </div>
      </div>
      <div className="v-col-md-6 v-col-12">
        <div className="v-card v-theme--light v-card--density-default v-card--variant-elevated">
          <div className="v-card-item">
            <div className="v-card-item__content">
              <h4 className="v-card-title">Year</h4>
            </div>
          </div>
          <div className="v-card-text">
            <canvas width={525} height={500} role="img" id="yearChart"></canvas>
          </div>
        </div>
      </div>
      <div className="v-col-md-6 v-col-12">
        <div className="v-card v-theme--light v-card--density-default v-card--variant-elevated">
          <div className="v-card-item">
            <div className="v-card-item__content">
              <h4 className="v-card-title">Region</h4>
            </div>
          </div>
          <div className="v-card-text">
            <canvas
              width={525}
              height={500}
              role="img"
              id="regionChart"
            ></canvas>
          </div>
        </div>
      </div>
      <div className="v-col-md-6 v-col-12">
        <div className="v-card v-theme--light v-card--density-default v-card--variant-elevated">
          <div className="v-card-item">
            <div className="v-card-item__content">
              <h4 className="v-card-title">Country</h4>
            </div>
          </div>
          <div className="v-card-text">
            <canvas
              width={525}
              height={500}
              role="img"
              id="countryChart"
            ></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
