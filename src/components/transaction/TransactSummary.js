import { useState } from "react";
import { Container, Row, Card, Accordion, Col } from "react-bootstrap";
import dayjs from "dayjs";

function TransactSummary({purcCategories, purchases, taxCategories, transactions, budgets, transactTaxes}) {
    
    var priorDate = new Date(new Date().setDate(new Date().getDate()-30));
    const recentTransactions = transactions.filter(transact => dayjs(transact.transact_date).toDate() > priorDate);

    const purchaseCtgyList = (budget) => {
        if (purcCategories === undefined || budgets === undefined) {
            return null;
        }
        var budgetTransactions = transactions.filter((transact)=> transact.budget === budget);

        const purcCtgyList = [];
        purcCategories.forEach((ctgy) => {
            let transactPurchases = [];
            let purcCtgyTotal = 0;
            budgetTransactions.forEach((transact) => {
                if (purchases[transact.transact_id]) {
                    transactPurchases = transactPurchases.concat(purchases[transact.transact_id].filter(
                        purc => purc.purc_category === ctgy.purc_category_id));
                }
            });
            transactPurchases.forEach((purc) => purcCtgyTotal += purc.price/100);
            purcCtgyList.push(<p>{ctgy.purc_category_name}: ${purcCtgyTotal.toFixed(2)}</p>);
        });
        // null case
        let emptyCtgyTotal = 0;
        budgetTransactions.forEach((transact) => {
            if (purchases[transact.transact_id]) {
                purchases[transact.transact_id].filter(purc => purc.purc_category === null)
                .forEach(purc => emptyCtgyTotal +=  purc.price/100);
            }
        });
        purcCtgyList.push(<p>None: ${emptyCtgyTotal.toFixed(2)}</p>);
        return purcCtgyList;
    }

    const calcTotalSpending = () => {
        // this is a method***
        let total = 0;
        for (let transact in purchases) {
            purchases[transact].forEach(purc => total += purc.price);
        }
        return (total/100).toFixed(2);
    }

    const calcPurcCtgySpending = (ctgy) => {
        let ctgyTotal = 0;
        for (let transact in purchases) {
            purchases[transact].filter(purc=> purc.purc_category === ctgy).forEach(purc => ctgyTotal += purc.price);
        }
        return (ctgyTotal/100).toFixed(2);
    }

    const calcTaxCtgySpending = (taxCtgy, taxRate) => {
        var total = 0;
        var taxTransactions = [];
        transactTaxes.filter(transactTax => taxCtgy === transactTax.tax).forEach(transactTax => {
            transactions.filter(transact => transactTax.transact === transact.transact_id).forEach(transact =>
                {if (purchases[transact.transact_id]) purchases[transact.transact_id].forEach(purc => total += purc.price);}
            );
        });
        
        total *= taxRate/100;
        return (total/100).toFixed(2);
    }

    const calcTotalBudgetSpending = (budget) => {
        if (purcCategories === undefined || budgets === undefined) {
            return null;
        }
        let budgetTotal = 0;
        var budgetTransactions = transactions.filter((transact)=> transact.budget === budget);
        budgetTransactions.forEach((transact) => {
            if (purchases[transact.transact_id]) {
                purchases[transact.transact_id].forEach((purc) => budgetTotal += purc.price / 100);
            }
            
        });
        return budgetTotal.toFixed(2);
    }
   
    return ( 
    <Container className="">
        <Row>
            <h4>Past 30 days</h4>
        </Row>
        <Row>
            <Col xs={4}>
            <Card className="summaryCard-dark">
            <Card.Body>
                <Card.Title>Total spending</Card.Title>
                <Card.Text>${calcTotalSpending()}</Card.Text>
            </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card className="summaryCard-dark">
            <Card.Body>
                <Card.Title>Spending by Category</Card.Title>
                {purcCategories.map((ctgy)=><Card.Text>{ctgy.purc_category_name}: ${calcPurcCtgySpending(ctgy.purc_category_id)}</Card.Text>)}
            </Card.Body>
            </Card> 
            </Col>
            <Col>
            <Card className="summaryCard-dark">
            <Card.Body>
                <Card.Title>Taxes</Card.Title>
                {taxCategories.map((tax)=><Card.Text>{tax.tax_name}: ${calcTaxCtgySpending(tax.tax_id, tax.tax_rate)}</Card.Text>)}
            </Card.Body>
            </Card> 
            </Col>
        </Row>
        <Row>
        <h4>Budgets</h4>
        </Row>
        <Row>
        <Accordion flush className="accordion-round">
            {budgets.map((budget) => (
                <Accordion.Item className="bg-dark text-white" key={budget.budget_id} eventKey={budget.budget_id}>
                    <Accordion.Header className="bg-dark text-white">
                        {budget.budget_name}
                    </Accordion.Header>
                    <Accordion.Body>
                        <p>Total spent: {calcTotalBudgetSpending(budget.budget_id)}</p>
                        <p>Total transactions: {transactions.filter((transact)=> transact.budget === budget.budget_id).length}</p>
                        <p>Purchase Categories</p>
                        {purchaseCtgyList(budget.budget_id)}
                    </Accordion.Body>
                </Accordion.Item>))}
        </Accordion>
            
        </Row>

    </Container> );
}

export default TransactSummary;