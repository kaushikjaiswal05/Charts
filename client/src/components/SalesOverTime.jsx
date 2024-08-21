import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const SalesOverTime = () => {
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://data-visualization-qw8s.onrender.com/api/sales-over-time?interval=daily"
        );
        setSalesData(response.data);
      } catch (error) {
        console.error("Error fetching sales data", error);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: salesData.map((item) => item._id),
    datasets: [
      {
        label: "Total Sales",
        data: salesData.map((item) => item.totalSales),
        fill: false,
        borderColor: "rgba(75, 192, 192, 1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="chart-container">
      <h2 style={{color: "rgba(75, 192, 192, 1)"}}>Total Sales Over Time</h2>
      <Line data={chartData} options={{ responsive: true }} />
    </div>
  );
};

export default SalesOverTime;
