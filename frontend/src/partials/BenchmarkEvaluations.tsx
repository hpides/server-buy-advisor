import React from "react";
import LineChart from "../charts/lineChart";
import { useBenchmarkContext } from "../utility/BenchmarkContext";
import { GCI_CONSTANTS } from "../utility/lifecycle_analysis/constants";
import { sumArray } from "../utility/UtilityFunctions";

// Reusable ListItem Component
interface ListItemProps {
  label: string;
  value?: string | number;
}

const ListItem: React.FC<ListItemProps> = ({ label, value }) => {
  return (
    <li className="border-2 border-[#D4722E] rounded-xl p-4 text-nowrap">
      <p className="text-lg">{label}</p>
      <p className="font-semibold text-2xl">{value ?? "--"}</p>
    </li>
  );
};

// Reusable TableHeader Component
interface TableHeaderProps {
  children: React.ReactNode;
}

const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return <th className="text-left w-1/4">{children}</th>;
};

function BenchmarkEvaluations() {

  const { comparison, country, utilization } = useBenchmarkContext();

  const year = comparison.relativeSavings.findIndex((value) => value < 0);
  const intensity = GCI_CONSTANTS[country]
  const total = (sumArray(comparison.newSystemOpex) + sumArray(comparison.newSystemOpex)).toFixed(0)
  console.log(GCI_CONSTANTS)

  return (
    <div className="flex flex-col px-8 py-4 gap-8">
      <div className="flex gap-4">
        <ul className="flex flex-col gap-4">
          <ListItem label="Break Even Time" value={`${year} years`} />
          <ListItem label="Grid Carbon Intensity" value={`${intensity} gCO₂/kWh`} />
          <ListItem label="Total Carbon Footprint" value={`${total} kgCO₂`} />
        </ul>
        <div className="grow flex flex-col gap-4">
          <LineChart />
          <p className="text-center text-lg w-4/5 mx-auto">
            Figure: Projected CO2 accumulated emissions of current and new hardware for sorting workload, {utilization}% utilization and a {country} energy mix
          </p>
        </div>
      </div>
      <div>
        <table className="text-center w-full border-collapse text-xl">
          <thead>
            <tr>
              <TableHeader>Emissions</TableHeader>
              <th className="border-b-4 border-[#B4D8E7]">
                <p className="font-light">Current Hardware</p>
                <p className="font-medium">Xeon W-3365 Processor</p>
              </th>
              <th className="border-b-4 border-[#F1B16E]">
                <p className="font-light">New Hardware</p>
                <p className="font-medium">Xeon W-3365 Processor</p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <TableHeader>Manufacturing Footprint</TableHeader>
              <td></td>
            </tr>
            <tr>
              <TableHeader>Operating Footprint</TableHeader>
              <td></td>
            </tr>
            <tr>
              <TableHeader>Total Carbon Footprint</TableHeader>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BenchmarkEvaluations;
