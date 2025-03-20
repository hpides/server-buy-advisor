import React from "react";
import LineChart from "../charts/lineChart";
import { useBenchmarkContext } from "../utility/BenchmarkContext";
import { GCI_CONSTANTS } from "../utility/lifecycle_analysis/constants";
import { addCommaToNumber, yearToYearAndMonth } from "../utility/UtilityFunctions";
import CPU_DATA, { CPU_METRICS, CPUMetric } from "../assets/data";

// Reusable ListItem Component
interface ListItemProps {
  label: string;
  value?: string | number;
}

const ListItem: React.FC<ListItemProps> = ({ label, value }) => {
  return (
    <li className="border-2 border-[#D4722E] rounded-xl px-4 py-3 text-nowrap">
      <p className="text-base flex flex-col">
        {label.split("😀").map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </p>
      <p className="font-semibold text-xl">{value ?? "--"}</p>
    </li>
  );
};

interface TableRowProps {
  name: string;
  isSingleComparison: boolean;
  currentHardware: string | undefined;
  newHardware: string | undefined;
  CPUMetric: CPUMetric;
}

interface PercentageBarProps {
  value: number;
}

const PercentageBar: React.FC<PercentageBarProps> = ({ value }) => {
  return (
    <div className="w-1/2 pl-3 flex items-center text-sm text-green-600 font-medium opacity-70 gap-1">
      <p>{value}%</p>
      <span className="h-1 bg-green-600" style={{ width: `${Math.min(value / 2, 100)}%` }}></span>
    </div>
  )
}

const TableRow: React.FC<TableRowProps> = ({ name, isSingleComparison, currentHardware, newHardware, CPUMetric }) => {
  let curVal: any = Number(currentHardware);
  let newVal: any = Number(newHardware);

  let percentageChange = null;
  let higherValue = null;

  if (!isNaN(curVal) && !isNaN(newVal) && curVal !== newVal) {
    const baseValue = Math.min(curVal, newVal);
    const increase = ((Math.max(curVal, newVal) - baseValue) / baseValue) * 100;

    percentageChange = Number(increase.toFixed(1))
    higherValue = curVal > newVal ? "curVal" : "newVal";
    // if infinite increase we break
    // if (Number.isFinite(increase)) {
    // }
  }

  if (CPUMetric.delimeter) {
    curVal = addCommaToNumber(curVal);
    newVal = addCommaToNumber(newVal);
  }

  const rowPadding = "py-2";

  return (
    <tr key={name} className="text-center align-middle border-b border-slate-200">
      <th className={`font-medium flex flex-col text-right pr-10 min-h-16 justify-center ${rowPadding}`}>
        <span>{name}</span>
        <span className="text-sm text-slate-600">{CPUMetric.unit}</span>
      </th>
      <td className={rowPadding + " px-5"}>
        <div className="flex relative">
          <p className={`${isSingleComparison ? 'w-full text-center' : 'w-1/2 text-right'}`}>{curVal}</p>
          {higherValue === "curVal" && percentageChange && <PercentageBar value={percentageChange} />}
        </div>
      </td>
      {!isSingleComparison && (
        <td className={rowPadding + " px-5"}>
          <div className="flex relative">
            <p className="w-1/2 text-right">{newVal}</p>
            {higherValue === "newVal" && percentageChange && <PercentageBar value={percentageChange} />}
          </div>
        </td>
      )}
    </tr>
  );
};

function BenchmarkEvaluations() {
  const { currentHardware, newHardware, comparison, country, utilization, intersect, workload, singleComparison } = useBenchmarkContext();

  const year = intersect ? yearToYearAndMonth(Number(intersect.x.toFixed(1))) : "No Break-Even";
  const intensity = GCI_CONSTANTS[country]
  const total = intersect ? Number(intersect.y.toFixed(1)) : null;
  const currentData = CPU_DATA[currentHardware];
  const newData = CPU_DATA[newHardware];
  const embodiedCarbon = Number(comparison.newSystemOpex[0].toFixed(1));

  return (
    <div className="flex flex-col px-8 py-4 gap-12">
      <div className="flex gap-4">
        <ul className="flex flex-col gap-4">
          <ListItem label="Break-Even Time" value={`${year}`} />
          <ListItem label="New HW Embodied Carbon" value={`${addCommaToNumber(embodiedCarbon)} kgCO₂`} />
          <ListItem label="Grid Carbon Intensity" value={`${addCommaToNumber(intensity)} gCO₂/kWh`} />
          <ListItem label="Total Carbon Footprint 😀 until Break-Even" value={`${addCommaToNumber(total)} kgCO₂`} />
        </ul>
        <div className="grow flex flex-col gap-1">
          <LineChart />
          <p className="text-center text-sm w-4/5 mx-auto font-serif text-slate-700">
            Figure: Projected CO2 accumulated emissions of current (blue) and new (orange) hardware for a {workload} workload, {utilization}% utilization with energy sourced from <span className="capitalize">{country}</span>.
          </p>
        </div>
      </div>
      <div>
        <table className="text-center w-4/5 mx-auto border-collapse text-lg">
          <thead>
            <tr>
              <th className="w-1/5"></th>
              <th className="w-2/5 border-b-4 border-[#B4D8E7]">
                <p className="font-light">Current Hardware</p>
                <p className="font-medium">{currentHardware}</p>
              </th>
              <th className="border-b-4 border-[#F1B16E]" hidden={singleComparison}>
                <p className="font-light">New Hardware</p>
                <p className="font-medium">{newHardware}</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(CPU_METRICS).map(([key, CPUMetric]) => {
              let curVal = currentData[CPUMetric.label]?.toFixed(CPUMetric.tofixed);
              let newVal = newData[CPUMetric.label]?.toFixed(CPUMetric.tofixed);

              return (
                <TableRow
                  name={key}
                  isSingleComparison={singleComparison}
                  currentHardware={curVal}
                  newHardware={newVal}
                  CPUMetric={CPUMetric}
                />
              )
            })}
          </tbody>
          {/* 
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

          */}
        </table>
      </div>
    </div>
  );
}

export default BenchmarkEvaluations;
