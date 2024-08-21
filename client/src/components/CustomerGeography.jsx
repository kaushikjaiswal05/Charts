import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

const CustomerGeography = () => {
  const [geoData, setGeoData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/customer-geography"
        );
        setGeoData(response.data);
      } catch (error) {
        console.error("Error fetching customer geography data", error);
      }
    };
    fetchData();
  }, []);

  const chartData = {
    labels: geoData.map((item) => item._id),
    datasets: [
      {
        label: "Customer Distribution",
        data: geoData.map((item) => item.count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div>
      <h2 style={{color:"rgba(255, 99, 132, 0.5)"}}>Customer Geography</h2>
      <Pie data={chartData} />
    </div>
  );
};

export default CustomerGeography;
