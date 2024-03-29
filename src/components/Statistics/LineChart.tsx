import { useState, useEffect } from "react";

import { LineChart } from "@mui/x-charts/LineChart";
import "./SimpleLineChart.css"; // Import CSS file for styling

import { doc, getDoc, collection, getDocs } from "firebase/firestore";

import { db } from "../../firebase";

interface SimpleLineChartData {
  data: number[];

  xlabel: string[];

  ylabel: number[];
}

const SimpleLineChart = () => {
  const [simpleLineChartData, setSimpleLineChartData] = useState<
    SimpleLineChartData[]
  >([]);

  useEffect(() => {
    const fetchDataFromFirebase = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Statistic"));

        const data: SimpleLineChartData[] = [];

        querySnapshot.forEach((docSnapshot) => {
          if (docSnapshot.exists()) {
            const fetchedData = docSnapshot.data();

            data.push({
              data: fetchedData.xdata,

              xlabel: fetchedData.xlabel,

              ylabel: fetchedData.ydata,
            });
          }
        });

        setSimpleLineChartData(data);
      } catch (error) {}
    };

    fetchDataFromFirebase();
  }, []);

  return (
    <div className="chart-container">
      <LineChart
        width={500}
        height={300}
        series={simpleLineChartData.map((data, index) => ({
          data: data.data,

          key: `line-${index}`, // Unique key for each line series
        }))}
        xAxis={[
          {
            scaleType: "point",

            data:
              simpleLineChartData.length > 0
                ? simpleLineChartData[0].xlabel
                : [],
          },
        ]}
      />
    </div>
  );
};

export default SimpleLineChart;
