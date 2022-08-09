import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useState } from 'react';
import { useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

function SpendingChart({purcCategories, purchases, taxCategories, transactions, budgets, transactTaxes, calcPurcCtgySpending}) {
    const [labels, setLabels] = useState([]);
    
    let purcCategoryNames = [];
    let purcCategorySpendings = [];
    purcCategories.forEach(purcCtgy => {
        purcCategoryNames.push(purcCtgy.purc_category_name);
        purcCategorySpendings.push(calcPurcCtgySpending(purcCtgy.purc_category_id));
    });
    
    const options = {
      plugins: {
        legend: {
          labels: {
            color: "#FFFFFF"
          }
        }
      }
    }

    const data = {
        labels: purcCategoryNames,
        datasets: [
          {
            label: '# of Votes',
            data: purcCategorySpendings,
            backgroundColor: ['#387cfc','#8989f9','#b69af7','#d6adf5','#eec4f6','#ffddfa','#fdbbdc','#fa98b2','#f07880','#db5e49','#ba4e00'],
            borderColor: ['#387cfc','#8989f9','#b69af7','#d6adf5','#eec4f6','#ffddfa','#fdbbdc','#fa98b2','#f07880','#db5e49','#ba4e00'],
            borderWidth: 1,
          },
        ],
      };

    return ( <div style={{ position: "relative", margin: "auto", width: "20vw" }}>
        {purcCategories.length > 0 ? <Doughnut data={data} options={options} /> : <p>No transactions found</p>}
    </div> );
}

export default SpendingChart;