import { useState } from "react";
import { Container, Row, Card, Accordion } from "react-bootstrap";

function TransactSummary({purcCategories, taxCategories, transactions, budgets, transactTaxes}) {


    return ( 
    <Container className="dark-container">
        <Row>
            <h4>Past 30 days</h4>
            <p>Total spending:</p>
            <p>Categories</p>
            <p>Taxes</p>
        </Row>
        <Row>
        <h4>
            Budgets
        </h4>
        </Row>
        <Row>
        <Accordion className="text-black">
            {budgets.map((budget) => (
                <Accordion.Item key={budget.budget_id} eventKey={budget.budget_id}>
                    <Accordion.Header>
                        {budget.budget_name}
                    </Accordion.Header>
                    <Accordion.Body>
                        {purcCategories.map((ctgy) => (
                            <>
                                {ctgy.purc_category_name}
                            </>
                        ))}
                    </Accordion.Body>
                </Accordion.Item>))}
        </Accordion>
            
        </Row>

    </Container> );
}

export default TransactSummary;