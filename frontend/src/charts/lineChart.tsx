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
import annotationPlugin from 'chartjs-plugin-annotation';


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

  const { comparison, intersect, currentHardware, newHardware, oldSystemOpex, newSystemOpex, breakEven, singleComparison } = useBenchmarkContext();

  // @ts-ignore
  const [chart, setChart] = useState<Chart | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);

  const datasets:any = [
    {
      type: "line",
      label: currentHardware,
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
      label: newHardware,
      data: newSystemOpex,
      borderColor: "#F1B16E",
      fill: false,
      backgroundColor: "#F1B16E",
      pointRadius: 0,
    })
  }

  const annotationHeight = comparison.newSystemOpex[0];

  const labels = Array.from(Array(breakEven).keys())

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
                return (Number(value) / 1000).toFixed(1);
              }
            },
          },
        },
        plugins: {
          annotation: {
            annotations: {
              embodiedCarbonLine: {
                type: "line",
                yMin: annotationHeight,
                yMax: annotationHeight,
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
                  yAdjust: 15,
                  content: "New HW's embodied carbon",
                  position: "end",
                },
              },
              breakEvenCircle: {
                display: !!intersect,
                type: "point",
                backgroundColor: "red",
                pointStyle: "round",
                radius: 5,
                xValue: intersect ? intersect.x : 0,
                yValue: intersect ? intersect.y : 0,
              },
              breakEvenLabel: {
                display: !!intersect,
                type: "label",
                backgroundColor: "transparent",
                content: intersect ? `${intersect.x.toFixed(1)} years` : "",
                color: "red",
                font: {
                  family: "serif",
                  size: 18,
                  weight: 400,
                },
                padding: {
                  top: 6,
                  left: 6,
                  right: 6,
                  bottom: 12,
                },
                position: {
                  x: "end",
                  y: "end",
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
              padding: 20,
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
    <figure className="grow">
      <canvas ref={canvas} width={400} height={400}></canvas>
    </figure>
  );
});

export default LineChart;
