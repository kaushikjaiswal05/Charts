import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

const NewCustomersOverTime = () => {
  const [customersData, setCustomersData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://data-visualization-qw8s.onrender.com/api/new-customers-over-time?interval=daily"
        );
        setCustomersData(response.data);
      } catch (error) {
        console.error("Error fetching new customers data", error);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: customersData.map((item) => item._id),
    datasets: [
      {
        label: "New Customers",
        data: customersData.map((item) => item.newCustomers),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2 style={{color: "rgba(54, 162, 235, 1)"}}>New Customers Over Time</h2>
      <Bar data={chartData} />
    </div>
  );
};

export default NewCustomersOverTime;
