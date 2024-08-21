import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const SalesGrowthRate = () => {
  const [growthData, setGrowthData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://data-visualization-qw8s.onrender.com/api/sales-growth-rate?interval=daily"
        );
        setGrowthData(response.data);
      } catch (error) {
        console.error("Error fetching sales growth data", error);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: growthData.map((item) => item._id),
    datasets: [
      {
        label: "Sales Growth Rate (%)",
        data: growthData.map((item) => item.growthRate),
        fill: false,
        borderColor: "rgba(255, 99, 132, 1)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <h2 style={{color: "rgba(255, 99, 132, 1)"}}>Sales Growth Rate Over Time</h2>
      <Line data={chartData} />
    </div>
  );
};

export default SalesGrowthRate;
