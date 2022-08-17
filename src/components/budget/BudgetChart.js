import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import dayjs from 'dayjs';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function BudgetChart({budget, spendLimit, purchases, purcCategory, incomes, timePeriod, purcCategoryFilter, useBudgetPeriod}) {
    var budgetPeriod = dayjs(budget.end_time).diff(dayjs(budget.start_time),'day');
    var spendingData = [];
    var totalSpending = 0;
    var timeLabels = [];
    //var labels =  Array.from({length: timePeriod}, (v, i) => i%2===0 ? "2022/77/22" : "");
    var j = 0;

    if (useBudgetPeriod) {
      for (let i = budgetPeriod; i >= 0; i--) {
        if (j < purchases.length && dayjs(budget.end_time).subtract(i, "day").isSame(purchases[j].date, "day")) {
          while(j < purchases.length && dayjs(budget.end_time).subtract(i, "day").diff(dayjs(purchases[j].date), "day") === 0) {
            let price = purchases[j].price/100;
            totalSpending += price;
            j++;
          }
          spendingData.push(totalSpending);
          timeLabels.push(dayjs(budget.end_time).subtract(i, "day").format("YYYY/MM/DD"));
        } else {
          spendingData.push(totalSpending);
          timeLabels.push(dayjs(budget.end_time).subtract(i, "day").format("MM/DD"));
        }
      }
      timeLabels[0] = dayjs(budget.end_time).subtract(budgetPeriod, "day").format("YYYY/MM/DD");
      timeLabels[timeLabels.length-1] = dayjs(budget.end_time).format("YYYY/MM/DD");
    } else {
      for (let i = timePeriod-1; i >= 0; i--) {
        if (j < purchases.length && dayjs().subtract(i, "day").isSame(purchases[j].date, "day")) {
          while(j < purchases.length && dayjs().subtract(i, "day").diff(dayjs(purchases[j].date), "day") === 0) {
            let price = purchases[j].price/100;
            totalSpending += price;
            j++;
          }
          spendingData.push(totalSpending);
          timeLabels.push(dayjs().subtract(i, "day").format("YYYY/MM/DD"));
        } else {
          spendingData.push(totalSpending);
          timeLabels.push(dayjs(budget.end_time).subtract(i, "day").format("MM/DD"));
        }
      }
      timeLabels[0] = dayjs().subtract(timePeriod-1, "day").format("YYYY/MM/DD");
      timeLabels[timeLabels.length-1] = dayjs().format("YYYY/MM/DD");
    }
  
    var totalIncome = 0;
    incomes.forEach(income => totalIncome += income.income_amount/100);
    
    const incomeLimitData = purcCategory ? Array.from({length: useBudgetPeriod ? budgetPeriod+1 : timePeriod}, () => spendLimit ? spendLimit.spend_limit/100 : 0) : 
      Array.from({length: useBudgetPeriod ? budgetPeriod+1 : timePeriod}, () => totalIncome);

    const lineColour = (purcCategory && totalSpending < spendLimit?.spend_limit/100) || 
      (!purcCategory && totalSpending < totalIncome) ? "63, 166, 255" : "255, 99, 132";

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: "#e7e6f7"
          }
        },
        title: {
          display: true,
          text: `Spending over time`,
          color: "#e7e6f7",
          font: {
            size: 20
          }
        },
      },
      scales: {
        y: {
          grace: 1
        }
      }
    };
    
    const data = {
      labels: timeLabels,
      datasets: [
        {
          label: 'Spending',
          data: spendingData,
          borderColor: `rgb(${lineColour})`,
          backgroundColor: `rgba(${lineColour}, 0.5)`,
          pointRadius: 5
        },
        {
          label: purcCategory ? purcCategory.purc_category_name + " spend limit" : 'Total Predicted Income',
          data: incomeLimitData,
          borderColor: 'rgb(65, 223, 179)',
          backgroundColor: 'rgba(65, 223, 179, 0.5)',
          pointRadius: 2
        },
      ],
    };

    return ( 
    <div>
      <Line options={options} data={data}/>
    </div> );
}

export default BudgetChart;