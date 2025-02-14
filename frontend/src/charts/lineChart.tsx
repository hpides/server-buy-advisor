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
import annotationPlugin, { AnnotationOptions } from 'chartjs-plugin-annotation';


// Register Chart.js components
Chart.register(
  annotationPlugin,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  CategoryScale,
  Filler
);
import { useBenchmarkContext } from "../utility/BenchmarkContext";

type LineChartProps = {
  // Define any props if necessary, or leave as an empty object
};

declare module 'chart.js' {
  interface PluginOptionsByType<TType extends string> {
    annotation?: AnnotationOptions;
  }
}

const LineChart: React.FC<LineChartProps> = memo(function LineChart() {

  const { comparison } = useBenchmarkContext();

  const [chart, setChart] = useState<Chart | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);


  const breakEven = Math.min(comparison.relativeSavings.findIndex((value) => value < 0) + 3, 20);

  console.log(comparison);

  const datasets:any = [
    {
      type: "line",
      label: "Current Hardware",
      data: comparison.oldSystemOpex.slice(0, breakEven),
      borderColor: "#B4D8E7",
      fill: false,
      backgroundColor: "#B4D8E7",
      pointRadius: 0,
    },
    {
      type: "line",
      label: "New Hardware",
      data: comparison.newSystemOpex.slice(0, breakEven),
      borderColor: "#F1B16E",
      fill: false,
      backgroundColor: "#F1B16E",
      pointRadius: 0,
    },
  ];



  const labels = Array.from(Array(breakEven).keys())

  const data = {
    labels: labels,
    datasets: datasets,
  };

  console.log(data)

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
        plugins: {
          legend: {
            labels: {
              font: {
                size: 14
              },
              boxHeight: 5
            },
            annotation: {
              annotations: {
                line1: {
                  type: 'line',
                  yMin: 600,
                  yMax: 600,
                  borderColor: 'rgb(255, 99, 132)',
                  borderWidth: 10,
                }
              }
            }
          }
        }
      }
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
