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
  BubbleController
} from "chart.js";
import annotationPlugin, { LabelPosition } from 'chartjs-plugin-annotation';
import { yearToYearAndMonth } from "../utility/UtilityFunctions";

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
  annotationPlugin,
  BubbleController
);
import { useBenchmarkContext } from "../utility/BenchmarkContext";

const BREAK_EVEN_TEXT = "Break-Even point";

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

const LineChart: React.FC<{}> = memo(function LineChart() {

  const { workload, country, currentServer, newServer, comparison, intersect, oldSystemOpex, newSystemOpex, breakEven, singleComparison } = useBenchmarkContext();

  // @ts-ignore
  const [chart, setChart] = useState<Chart | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const datasets:any = [
    {
      type: "line",
      label: 'Current Hardware',
      data: oldSystemOpex,
      borderColor: "#B4D8E7",
      fill: false,
      backgroundColor: "#B4D8E7",
      pointRadius: 0,
      yAxisID: 'y',
      order: 2
    },
  ];

  // compare 2 CPU's
  if (!singleComparison) {
    datasets.push({
      type: "line",
      label: 'New Hardware',
      data: newSystemOpex,
      borderColor: "#F1B16E",
      fill: false,
      backgroundColor: "#F1B16E",
      pointRadius: 0,
      yAxisID: 'y',
      order: 2
    })
  }

  const currentUtilization = currentServer.utilization.toFixed(0);
  const newUtilization = newServer.utilization.toFixed(0);

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
  if ((xBreakEven / L) > 0.15) xbreakEvenLabel = 'end';
  if ((yBreakEven / oldSystemOpex[L]) > 0.90) ybreakEvenLabel = 'start';

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

  const labelXValue = intersect ? intersect.x : 1;
  const labelYValue = intersect ? intersect.y : (0.8 * newSystemOpex[2]);

  // if there is no intersect, we want 'No Break-Even' to be in the center
  if (!intersect) {
    xbreakEvenLabel = 'center';
    ybreakEvenLabel = 'center';
  }

  if (intersect) {
    datasets.push({
      type: "bubble",
      label: BREAK_EVEN_TEXT,
      data: [{
        x: intersect ? intersect.x : -10,
        y: intersect ? intersect.y : -10,
        r: 6,
      }],
      borderColor: "black",
      fill: false,
      backgroundColor: "red",
      pointRadius: 0,
      yAxisID: 'y',
      xAxisID: 'x1',
      order: 1
    })
  }

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
            beginAtZero: true,
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
              autoSkip: true,
              font: {
                family: "serif",
                size: 14,
              },
            },
          },
          x1: {
            type: 'linear',
            beginAtZero: true,
            display: false,
            max: oldSystemOpex.length - 1
          },
          y: {
            title: {
              display: true,
              text: "Accumulated CO₂ [Tons]",
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
          tooltip: {
            callbacks: {
              label: function(context) {
                console.log(context)
                return "Break-Even Point"
              }
            }
          },
          annotation: {
            annotations: {
              embodiedCarbonLine: {
                type: "line",
                yMin: embodiedCarbonLineHeight,
                yMax: embodiedCarbonLineHeight,
                borderColor: "rgb(255, 99, 132)",
                borderWidth: 2,
                borderDash: [6, 6],
                drawTime: 'beforeDraw',
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
              breakEvenLabel: {
                display: true,
                type: "label",
                backgroundColor: intersect ? 'transparent' : 'white',
                content: intersect ? yearToYearAndMonth(Number(intersect.x.toFixed(1)), true) : 'No Break-Even Possible',
                color: "red",
                z: -1,
                font: {
                  family: "serif",
                  size: 18,
                  weight: 400,
                },
                borderWidth: intersect ? 0 : 1,
                borderRadius: intersect ? 100 : 0,
                borderColor: intersect ? 'black' : 'red',
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
                xValue: labelXValue,
                yValue: labelYValue
              },
            },
          },
          legend: {
            labels: {
              filter: function(item) {
                return !item.text.includes(BREAK_EVEN_TEXT);
              },

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
        {singleComparison ? 
        `Projected CO2 accumulated emissions of current (blue) hardware for a ${workload} workload, operated at ${currentUtilization}% utilization, with electricity from ${country}.`
          :
        `Projected CO2 accumulated emissions of current (blue) and new (orange) hardware for a ${workload} workload, operated at ${currentUtilization}% and ${newUtilization}% utilization respectively, with electricity from ${country}.`

        }
      </p>
    </div>
  );
});

export default LineChart;
