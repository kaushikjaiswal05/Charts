import React from "react";
import SalesOverTimeChart from "./components/SalesOverTime";
import "./App.css";
import SalesGrowthRate from "./components/SalesGrowthRate";
import NewCustomersOverTimeChart from "./components/NewCustomersOverTime";
import RepeatCustomers from "./components/RepeatCustomers";
import CustomerGeography from "./components/CustomerGeography";
import CustomerLifetimeValue from "./components/CustomerLifetimeValue";

const App = () => {
  return (
    <>
      <h1 className="title">Shopify Sales Analytics Dashboard</h1>
      <div className="app">
        <SalesOverTimeChart />
        <SalesGrowthRate />
        <NewCustomersOverTimeChart />
        <RepeatCustomers />
        <CustomerGeography />
        <CustomerLifetimeValue />
      </div>
    </>
  );
};

export default App;
