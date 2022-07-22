import { useState } from "react";
import { Container, Row, Card, Accordion, Col } from "react-bootstrap";

function TransactSummary({purcCategories, purchases, taxCategories, transactions, budgets, transactTaxes}) {
    const purchaseCtgyList = (budget) => {
        if (purcCategories === undefined) {
            return null;
        }
        var budgetTransactions = transactions.filter((transact)=> transact.budget === budget.budget_id);
        
        const purcCtgyList = [];
        purcCategories.forEach((ctgy) => (
            purcCtgyList.push(<p>{ctgy.purc_category_name}</p>)
        ))
        return purcCtgyList;
    }

    return ( 
    <Container className="dark-container">
        <Row>
            <h4>Past 30 days</h4>
            <p></p>
            <p>Categories</p>
            <p>Taxes Spending</p>
        </Row>
        <Row>
            <Col xs={4}>
            <Card className="summaryCard-dark">
            <Card.Body>
                <Card.Title>Total spending</Card.Title>
            </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card className="summaryCard-dark">
            <Card.Body>
                <Card.Title>Categories</Card.Title>
                {purcCategories.map((ctgy)=><Card.Text>{ctgy.purc_category_name}</Card.Text>)}
            </Card.Body>
            </Card> 
            </Col>
            <Col>
            <Card className="summaryCard-dark">
            <Card.Body>
                <Card.Title>Taxes</Card.Title>
                {taxCategories.map((tax)=><Card.Text>{tax.tax_name}</Card.Text>)}
            </Card.Body>
            </Card> 
            </Col>
        </Row>
        <Row>
        <h4>Budgets</h4>
        </Row>
        <Row>
        <Accordion flush className="text-white">
            {budgets.map((budget) => (
                <Accordion.Item className="bg-dark text-white" key={budget.budget_id} eventKey={budget.budget_id}>
                    <Accordion.Header className="bg-dark text-white">
                        {budget.budget_name}
                    </Accordion.Header>
                    <Accordion.Body>
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