import React, { useRef, useEffect, useState, memo } from "react";
import {
  Chart,
  LineController,
  CategoryScale,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import annotationPlugin, { LabelPosition } from 'chartjs-plugin-annotation';


// Register Chart.js components
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
  Filler,
  annotationPlugin
);
import { useBenchmarkContext } from "../utility/BenchmarkContext";

type LineChartProps = {
  // Define any props if necessary, or leave as an empty object
};

// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
export function lineIntersect(
  x1 :number, y1 :number, // first line first point
  x2 :number, y2 :number, // first line second point
  x3 :number, y3 :number, // second line first point
  x4 :number, y4 :number  // second line second point
) :{ x:number, y:number } | false {
  // Check if none of the lines are of length 0
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
    return false
  }

  let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))

  // Lines are parallel
  if (denominator === 0) {
    return false
  }

  let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return false
  }

  // Return a object with the x and y coordinates of the intersection
  let x = x1 + ua * (x2 - x1)
  let y = y1 + ua * (y2 - y1)

  return {x, y}
}

const LineChart: React.FC<LineChartProps> = memo(function LineChart() {

  const { workload, country, utilization, comparison, intersect, currentCPU, newCPU, oldSystemOpex, newSystemOpex, breakEven, singleComparison } = useBenchmarkContext();

  // @ts-ignore
  const [chart, setChart] = useState<Chart | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const datasets:any = [
    {
      type: "line",
      label: currentCPU,
      data: oldSystemOpex,
      borderColor: "#B4D8E7",
      fill: false,
      backgroundColor: "#B4D8E7",
      pointRadius: 0,
    },
  ];

  // compare 2 CPU's
  if (!singleComparison) {
    datasets.push({
      type: "line",
      label: newCPU,
      data: newSystemOpex,
      borderColor: "#F1B16E",
      fill: false,
      backgroundColor: "#F1B16E",
      pointRadius: 0,
    })
  }

  const L = oldSystemOpex.length - 1;
  const isOneDecimalPlace = oldSystemOpex[L] > 1000 && newSystemOpex[L] > 1000;

  const embodiedCarbonLineHeight = comparison.newSystemOpex[0];

  const labels = Array.from(Array(breakEven).keys())

  let xbreakEvenLabel: LabelPosition = 'start';
  let ybreakEvenLabel: LabelPosition = 'end';
  let embodiedCarbonLinePosition: LabelPosition = 'end';
  let yEmbodied  = -15;

  const xBreakEven = intersect ? intersect.x : 0;
  const yBreakEven = intersect ? intersect.y : 0;

  // trying my best to not let labels overlap or go out of bounds
  if ((xBreakEven / L) > 0.1) xbreakEvenLabel = 'end';
  if ((yBreakEven / oldSystemOpex[L]) > 0.95) ybreakEvenLabel = 'start';

  const isBreakEvenUpperRight = xBreakEven / L > 0.6 && yBreakEven / oldSystemOpex[L] > 0.6;
  const isEmbodiedUpperRight = embodiedCarbonLineHeight / oldSystemOpex[L] > 0.6;

  // overlaps between breakeven and embodied only happen in upper right quadrant
  if (isBreakEvenUpperRight && isEmbodiedUpperRight) {
    yEmbodied = 15;
  }

  const data = {
    labels: labels,
    datasets: datasets,
  };

  useEffect(() => {
    if (!canvas.current) return;

    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;

    const newChart = new Chart(ctx, {
      type: "line",
      data: data,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        animation: {
          duration: 0,
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Duration [Years]",
              color: 'black',
              font: {
                family: "serif",
                size: 16,
                weight: "normal",
              },
            },
            ticks: {
              font: {
                family: "serif",
                size: 14,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: "Accumulated CO₂ [ton]",
              color: 'black',
              font: {
                family: "serif",
                size: 16,
                weight: "normal",
              },
            },
            ticks: {
              font: {
                family: "serif",
                size: 14,
              },
              callback: function(value) {
                return (Number(value) / 1000).toFixed(isOneDecimalPlace ? 1 : 2);
              }
            },
          },
        },
        plugins: {
          annotation: {
            annotations: {
              embodiedCarbonLine: {
                type: "line",
                yMin: embodiedCarbonLineHeight,
                yMax: embodiedCarbonLineHeight,
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 2,
                borderDash: [6, 6],
                label: {
                  display: true,
                  backgroundColor: "hsla(0, 100%, 50%, 0)",
                  font: {
                    family: "serif",
                    size: 18,
                    weight: 400,
                  },
                  color: "red",
                  yAdjust: yEmbodied,
                  content: `${singleComparison ? "Current" : "New" } HW's embodied carbon`,
                  position: embodiedCarbonLinePosition
                },
              },
              breakEvenCircle: {
                display: !!intersect,
                type: "point",
                backgroundColor: "red",
                pointStyle: "round",
                radius: 5,
                xValue: intersect ? intersect.x : -10,
                yValue: intersect ? intersect.y : -10,
              },
              breakEvenLabel: {
                display: !!intersect,
                type: "label",
                backgroundColor: 'transparent',
                content: intersect ? `${intersect.x.toFixed(1)} years` : "",
                color: "red",
                font: {
                  family: "serif",
                  size: 18,
                  weight: 400,
                },
                borderRadius: 100,
                borderColor: 'black',
                padding: {
                  top: 5,
                  bottom: 5,
                  left: 10,
                  right: 10
                },
                position: {
                  x: xbreakEvenLabel,
                  y: ybreakEvenLabel,
                },
                xValue: intersect ? intersect.x : 0,
                yValue: intersect ? intersect.y : 0,
              },
            },
          },
          legend: {
            labels: {
              color: "black",
              font: {
                family: "serif",
                size: 16,
              },
              boxHeight: 5,
            },
          },
        },
      },
    });

    setChart(newChart);

    return () => {
      newChart.destroy();
    };
  }, [comparison]);

  return (

    <div className="flex flex-col gap-2 w-full">
      <figure className="h-96">
        <canvas ref={canvas} width={400} height={500}></canvas>
      </figure>
      <p className="text-center text-sm w-full mx-auto font-serif text-slate-700">
        Figure: Projected CO2 accumulated emissions of current (blue) and new (orange) hardware for a {workload} workload, {utilization}% utilization with energy sourced from <span className="capitalize">{country}</span>.
      </p>
    </div>
  );
});

export default LineChart;
