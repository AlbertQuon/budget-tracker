import { Row } from "react-bootstrap";

function TransactList({purcCategories, purchases, transactions, taxCategories, transactTaxes, budgets}) {
    const transactBudget = (budget_id) => {
        //console.log(budgets)
        let budget = budgets.find((budget) => budget.budget_id === budget_id); // REMEMBER TO USE ===
        if (budget) {
            return (<p>{budget.budget_name}</p>)
        }
        return <p>Budget not found</p>
    }
    
    const purchasesList = (transact_id) => {
        if (purchases[transact_id] === undefined || !purchases) {
            return <p>No purchases found</p>
        }
        const purcList = [];
        purchases[transact_id].forEach((purc) => {
            // find object
            let ctgy = purcCategories.find(purcCtgy => purcCtgy.purc_category_id === purc.purc_category);
            console.log(ctgy)
            purcList.push(
                <p>{purc.item_name}: ${(purc.price/100).toFixed(2)} {ctgy ? '('+ctgy.purc_category_name+')' : ""}</p>
            )
        });

        return purcList.length > 0 ? purcList : <p>No purchases found</p>
    }

    const calcTotal = (transact_id) => {
        var total = 0.00;
        if (purchases[transact_id] === undefined || !purchases) {
            return total;
        }
        //console.log(transactTaxes)
        let taxes = transactTaxes.filter(transactTax => transactTax.transact === transact_id);
        // loop through each tax category and add them
        taxCategories.forEach((taxCtgy) => {
            if (taxes.find(tax => tax.tax === taxCtgy.tax_id) !== -1) {
                purchases[transact_id].forEach((purc) => {
                    total += purc.price/100 * (taxCtgy.tax_rate/100);
                });
            } 
        })
        
        return total.toFixed(2);
    }

    const calcSubtotal = (transact_id) => {
        var subtotal = 0.00;
        if (purchases[transact_id] === undefined || !purchases) {
            return subtotal;
        }
        purchases[transact_id].forEach((purc) => {
            subtotal += purc.price/100;
        });

        return subtotal.toFixed(2);
    }

    return ( 
    <div>
        {Object.keys(transactions).length !== 0 ? transactions.map((transact) => (
                                        <Row className="transactionItem my-2 mx-1" key={transact.transact_id} bg='dark'>
                                            <div className="m-2">
                                            <h4>{transact.transact_date}</h4>
                                            <h5>{transactBudget(transact.budget)}</h5>
                                            <p>Subtotal: ${calcSubtotal(transact.transact_id)}</p>
                                            <p>Total: ${calcTotal(transact.transact_id)}</p>
                                            {purchasesList(transact.transact_id)}
                                            </div>
                                        </Row>
                                    )) : <h5>No transactions found</h5>}
    </div> );
}

export default TransactList;