import React from "react";
import { useBenchmarkContext } from "../utility/BenchmarkContext";
import { addCommaToNumber, yearToYearAndMonth, BLANK_SPACE, withinXPercent } from "../utility/UtilityFunctions";
import CPU_DATA, { CPUMetric, CPU_METRICS } from "../assets/data";
import { CapexType, OpexType, CPU, RAM, SSD, HDD, Components } from "../utility/lifecycle_analysis/system";
import { ListItem } from "../utility/ListItems";

interface TableRowProps {
  name: string;
  isSingleComparison: boolean;
  currentCPU: string | undefined;
  newCPU: string | undefined;
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

const TableRow: React.FC<TableRowProps> = ({ name, isSingleComparison, currentCPU, newCPU, CPUMetric }) => {
  let curVal: any = Number(currentCPU);
  let newVal: any = Number(newCPU);

  let percentageChange = null;
  let higherValue = null;

  if (!isNaN(curVal) && !isNaN(newVal) && curVal !== newVal) {
    const baseValue = Math.min(curVal, newVal);
    const increase = ((Math.max(curVal, newVal) - baseValue) / baseValue) * 100;

    percentageChange = Number(increase.toFixed(1)) || null // if change = 0 then weird behaviour
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

interface BreakdownCardProp {
    title: string;
    breakdown: CapexType | OpexType;
    borderColor: string;
}

const BreakdownCard: React.FC<BreakdownCardProp> = ({ title, breakdown, borderColor }) => {
  const calculatePercentage = (value: number, breakdown: CapexType | OpexType) => {
    return ((value / breakdown.TOTAL) * 100).toFixed(0) + "%";
  };
  return (
    <div className={`flex flex-col border-2 rounded-lg gap-2 px-3 py-2 duration-200 ease-in-out ${borderColor}`}>
      <p className="font-semibold">{title}</p>
      <div className="text-lg flex flex-col gap-1">
        {[CPU, RAM, SSD, HDD].map(value => (
          <div key={value} className="grid grid-cols-12 w-full relative">
            <p className="col-span-2">{value}:</p>
            <p className="col-span-2 text-right mr-1">{calculatePercentage(breakdown[value as Components], breakdown)}</p>
            <span
              className="col-span-8 h-1 bg-green-600 my-auto duration-500"
              style={{ width: `${(breakdown[value as Components] / breakdown.TOTAL) * 100}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

function DetailedBreakdown() {
  const { currentServer, newServer, comparison, intersect, workload, singleComparison, oldPerformanceIndicator, newPerformanceIndicator, scaling, capexBreakdown, opexBreakdown, oldPowerConsumption, newPowerConsumption } = useBenchmarkContext();

  const year = intersect ? yearToYearAndMonth(Number(intersect.x.toFixed(1)), false, true) : "No Break-Even";
  const total = intersect ? addCommaToNumber(Number(intersect.y.toFixed(1))) + " kgCO₂" : "No Break-even";
  const currentData = CPU_DATA[currentServer.cpu];
  const newData = CPU_DATA[newServer.cpu];
  const embodiedCarbon = Number(comparison.newSystemOpex[0].toFixed(1));

  const titleText = singleComparison ? 'Current' : 'New'

  let perfRatio :any = (newPerformanceIndicator / oldPerformanceIndicator)
  let normalizedOldPowerConsumption = oldPowerConsumption;

  if (scaling === 'Emissions') {
     normalizedOldPowerConsumption = oldPowerConsumption * perfRatio;
  }

  let consumptionRatio :any = (newPowerConsumption / normalizedOldPowerConsumption)

  const ratioDecimalPlaces = withinXPercent(perfRatio, consumptionRatio, 0.1) ? 3 : 1;
  perfRatio = perfRatio.toFixed(ratioDecimalPlaces).replace(/\.000$/, '');
  consumptionRatio = consumptionRatio.toFixed(ratioDecimalPlaces).replace(/\.000$/, '');

  let oldPerfFormatted = oldPerformanceIndicator.toFixed(1).replace(/\.0$/, '');
  let newPerfFormatted = newPerformanceIndicator.toFixed(1).replace(/\.0$/, '');
  let oldConsumptionFormatted = normalizedOldPowerConsumption.toFixed(3).replace(/\.0$/, '');
  let newConsumptionFormatted = newPowerConsumption.toFixed(3).replace(/\.0$/, '');

  newPerfFormatted = addCommaToNumber(Number(newPerfFormatted));
  oldPerfFormatted = addCommaToNumber(Number(oldPerfFormatted));

  return (
    <div className="flex flex-col px-2 py-4 gap-10">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-4">
          {/* Left Side - 2x2 Grid */}
          <ul className="grid grid-cols-3 col-span-5 gap-4 grow">
            <ListItem
              label="Break-Even Time"
              value={`${year}`}
              borderColor="var(--color-hpi-red)"
            />
            <ListItem
              label={`Embodied Carbon of ${titleText} Hardware`}
              value={`${addCommaToNumber(embodiedCarbon)} kgCO₂`}
              borderColor={singleComparison ? "var(--color-hpi-current)" : "var(--color-hpi-new)"}
            />
            <ListItem
              label="Total CO₂ until Break-Even"
              value={`${total}`}
              borderColor="var(--color-hpi-orange)"
            />
          </ul>
          <div className="flex flex-col border-2 border-hpi-orange rounded-lg px-1 py-1 col-span-5">
            {
              /*
               * styling for table can be found in style.css
               */
            }
            <table id="breakdown-table" className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="w-1/3 border-r">{BLANK_SPACE}</th>
                  <th className="w-1/3 text-left border-r"><p>({workload})</p><p>Performance Indicator</p></th>
                  <th className="w-1/3 text-left align-bottom"><p>Power</p><p>Consumption</p></th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="breakdown-table-first-col">Current Hardware</td>
                  <td className="border-r table-val">{oldPerfFormatted}</td>
                  <td className="table-val">{oldConsumptionFormatted} kW</td>
                </tr>
                {
                  !singleComparison &&
                    <>
                      <tr className="border-t border-b">
                        <td className="breakdown-table-first-col">New Hardware</td>
                        <td className="border-r table-val">{newPerfFormatted}</td>
                        <td className="table-val">{newConsumptionFormatted} kW</td>
                      </tr>
                      <tr className="border-t">
                        <td className="breakdown-table-first-col">Ratio</td>
                        <td className="border-r table-val">{perfRatio}</td>
                        <td className="table-val">{consumptionRatio}</td>
                      </tr>
                    </>
                }
              </tbody>
            </table>
          </div>
        </div>
        <div className="hidden flex-col border-2 border-hpi-orange rounded-lg px-3 py-2 col-span-5">
          <p className="font-semibold">{workload} Performance indicator:</p>
          <table className="text-lg">
            <tr>
              <td>Current Hardware:</td>
              <td>{oldPerfFormatted}</td>
            </tr>
            {
              !singleComparison &&
                <>
                  <tr>
                    <td>New Hardware:</td>
                    <td>{newPerfFormatted}</td>
                  </tr>
                  <tr>
                    <td>Ratio:</td>
                    <td>{perfRatio}</td>
                  </tr>
                </>
            }
          </table>
          <p className="font-semibold">Total Power Consumption:</p>
          <table className="text-lg">
            <tr>
              <td>Current Hardware:</td>
              <td>{oldConsumptionFormatted} kW</td>
            </tr>
            {
              !singleComparison &&
                <>
                  <tr>
                    <td>New Hardware:</td>
                    <td>{newConsumptionFormatted} kW</td>
                  </tr>
                  <tr>
                    <td>Ratio:</td>
                    <td>{consumptionRatio}</td>
                  </tr>
                </>
            }
          </table>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <BreakdownCard
            title={`Embodied Carbon Breakdown of ${titleText} Hardware`}
            breakdown={capexBreakdown}
            borderColor={singleComparison ? "border-hpi-current" : "border-hpi-new"}
          />
          <BreakdownCard
            title={`Operational Carbon Breakdown of ${titleText} Hardware`}
            breakdown={opexBreakdown}
            borderColor={singleComparison ? "border-hpi-current" : "border-hpi-new"}
          />
        </div>
      </div>
      <div>
        <table hidden={true} className="text-center w-7/8 mx-auto border-collapse text-base">
          <thead>
            <tr>
              <th className="w-1/5"></th>
              <th className="w-2/5 border-b-4 border-[#B4D8E7]">
                <p className="font-light">Current Hardware</p>
                <p className="font-medium">{currentServer.cpu}</p>
              </th>
              <th className="border-b-4 border-[#F1B16E]" hidden={singleComparison}>
                <p className="font-light">New Hardware</p>
                <p className="font-medium">{newServer.cpu}</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(CPU_METRICS).map(([key, CPUMetric]) => {
              //TODO: Need to fix NaN displaying when data is null
              let curVal = currentData[CPUMetric.label]?.toFixed(CPUMetric.tofixed);
              let newVal = newData[CPUMetric.label]?.toFixed(CPUMetric.tofixed);

              return (
                <TableRow
                  name={key}
                  isSingleComparison={singleComparison}
                  currentCPU={curVal}
                  newCPU={newVal}
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

export default DetailedBreakdown;
