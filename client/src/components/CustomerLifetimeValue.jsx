import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const CustomerLifetimeValue = () => {
  const [lifetimeValueData, setLifetimeValueData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/customer-lifetime-value"
        );
        setLifetimeValueData(response.data);
      } catch (error) {
        console.error("Error fetching customer lifetime value data", error);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: lifetimeValueData.map((item) => item._id),
    datasets: [
      {
        label: "Customer Lifetime Value",
        data: lifetimeValueData.map((item) => item.cohortValue),
        backgroundColor: "rgba(255, 206, 86, 0.5)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2 style={{color: "rgba(255, 206, 86, 1)"}}>Customer Lifetime Value by Cohorts</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default CustomerLifetimeValue;
