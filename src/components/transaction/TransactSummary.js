import { useEffect, useState } from "react";
import { Container, Row, Card, Accordion, Col, Form } from "react-bootstrap";
import SpendingChart from './SpendingChart.js'
import dayjs from "dayjs";
import CustomPagination from "../layout/CustomPagination.js";

function TransactSummary({purcCategories, purchases, taxCategories, transactions, budgets, transactTaxes}) {
    
    const [recentTransactions, setRecentTransactions] = useState(transactions.filter(transact => dayjs().diff(dayjs(transact.transact_date), 'day') <= 30));
    const [budgetFilter, setBudgetFilter] = useState("");
    const [filteredBudgets, setFilteredBudgets] = useState(budgets);

    const [currentBudgetPage, setCurrentBudgetPage] = useState(1);
    const ITEMS_PER_PAGE = 10;
    const PAGE_INTERVAL = 2;

    useEffect(() => {
        if (budgetFilter.length > 0) {
            let newBudgets = budgets.filter(budget => budget.budget_name.includes(budgetFilter)).sort((a,b) => {
                return b.budget_id - a.budget_id;
            })
            setFilteredBudgets(newBudgets);
        } else {
            let newBudgets = [...budgets].sort((a,b) => {
                return b.budget_id - a.budget_id;
            });
            setFilteredBudgets(newBudgets);
        }
    }, [budgetFilter, budgets])

    useEffect(() => {
        setRecentTransactions(transactions.filter(transact => dayjs().diff(dayjs(transact.transact_date), 'days') <= 30));
    }, [transactions])

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
            purcCtgyList.push(<Row className="my-1">
                <Col className="budget-summary-accordion-item-ctgy" md={3}>{ctgy.purc_category_name}</Col> 
                <Col md={3} className="budget-summary-accordion-item-price">${purcCtgyTotal.toFixed(2)}</Col>
                <Col md={3} className="budget-summary-accordion-item-ctgy"></Col>
                <Col md={3} className="budget-summary-accordion-item-price">{transactPurchases.length} purchases</Col>
            </Row>);
        });
        // null case
        let emptyCtgyTotal = 0;
        budgetTransactions.forEach((transact) => {
            if (purchases[transact.transact_id]) {
                purchases[transact.transact_id].filter(purc => purc.purc_category === null)
                .forEach(purc => emptyCtgyTotal +=  purc.price/100);
            }
        });
        if (emptyCtgyTotal > 0) {
            purcCtgyList.push(<Row className="my-1">
                <Col className="budget-summary-accordion-item-ctgy" md={3}>None/No category</Col> 
                <Col className="budget-summary-accordion-item-price" md={3}>${emptyCtgyTotal.toFixed(2)}</Col>
            </Row>);
        }   
        
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
            if (dayjs().diff(dayjs(transact.transact_date), 'day') <= 30) {
                purchases[transact].filter(purc=> purc.purc_category === ctgy).forEach(purc => ctgyTotal += purc.price);
            }
        }
        return (ctgyTotal/100).toFixed(2);
    }

    const calcTaxCtgySpending = (taxCtgy, taxRate) => {
        var total = 0;
        var taxTransactions = [];
        transactTaxes.filter(transactTax => taxCtgy === transactTax.tax).forEach(transactTax => {
            transactions.filter(transact => transactTax.transact === transact.transact_id).forEach(transact =>
                {if (purchases[transact.transact_id] && dayjs().diff(dayjs(transact.transact_date), 'day') <= 30) {
                    purchases[transact.transact_id].forEach(purc => total += purc.price);
                }}
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
            if (purchases[transact.transact_id] && dayjs().diff(dayjs(transact.transact_date), 'day') <= 30) {
                purchases[transact.transact_id].forEach((purc) => budgetTotal += purc.price / 100);
            }
            
        });
        return budgetTotal.toFixed(2);
    }
   
    return ( 
    <Container className="py-4">
        <Row>
            <h3>Past 30 days</h3>
        </Row>
        <Row className="py-4">
            <Col>
            <SpendingChart
                purchases={purchases}
                purcCategories={purcCategories}
                taxCategories={taxCategories}
                transactions={transactions}
                budgets={budgets}
                transactTaxes={transactTaxes}
                calcPurcCtgySpending={calcPurcCtgySpending}
                calcTaxCtgySpending={calcTaxCtgySpending}
            />
            </Col>
        </Row>
        <Row className="my-2 mb-4">
            <Col md={4}>
            <Card className="summary-card">
            <Card.Body as={Row}>
                <Card.Title className="summary-card-title">Total Spending</Card.Title>
                <Card.Text className="summary-card-body" style={{'font-size' : '1.75em'}}>${calcTotalSpending()}</Card.Text>
            </Card.Body>
            </Card>
            </Col>
            <Col>
            <Card className="summary-card">
            <Card.Body>
                <Card.Title className="summary-card-title">Categories</Card.Title>
                {purcCategories.map((ctgy, index)=>
                    <Card.Text as={Row} className="summary-card-body" key={index}>
                        <Col className="summary-card-body-header">
                            {ctgy.purc_category_name}
                        </Col> 
                        <Col className="summary-card-body-price">
                            ${calcPurcCtgySpending(ctgy.purc_category_id)}
                        </Col>
                    </Card.Text>)}
            </Card.Body>
            </Card> 
            </Col>
            <Col>
            <Card className="summary-card">
            <Card.Body>
                <Card.Title className="summary-card-title">Taxes</Card.Title>
                {taxCategories.map((tax, index)=>
                    <Card.Text as={Row} className="summary-card-body" key={index}>
                        <Col className="summary-card-body-header">
                            {tax.tax_name}
                        </Col>
                        <Col className="summary-card-body-price">
                            ${calcTaxCtgySpending(tax.tax_id, tax.tax_rate)}
                        </Col>
                    </Card.Text>)}
            </Card.Body>
            </Card> 
            </Col>
        </Row>
        <div className="budget-summary-section">
        <Row>
            <h4>Budgets</h4>
        </Row>
        <Row className="my-2">
            <Col md={6}>
                <Form.Control type='text' onChange={(e) => setBudgetFilter(e.target.value)} placeholder="Search by budget name"></Form.Control>
            </Col>
        </Row>
        <Row>
            <Accordion flush className="accordion-round">
                {filteredBudgets
                .slice((currentBudgetPage-1)*ITEMS_PER_PAGE, currentBudgetPage*ITEMS_PER_PAGE)
                .map((budget, index) => (
                    <Accordion.Item className="budget-summary-accordion-item" key={index} eventKey={budget.budget_id}>
                        <Accordion.Header className="">
                            {budget.budget_name}
                        </Accordion.Header>
                        <Accordion.Body className="budget-summary-accordion-item-body">
                            <Container>
                                <Row className="my-4">
                                    <Col>
                                        <h4 className="budget-summary-item-header">Total spent:</h4>
                                    </Col>
                                    <Col className="budget-summary-item-header-col">
                                        <h4 className="budget-summary-item-header">${calcTotalBudgetSpending(budget.budget_id)}</h4>
                                    </Col>
                                    <Col>
                                        <h4 className="budget-summary-item-header">Total transactions: </h4>
                                    </Col>
                                    <Col className="budget-summary-item-header-col">
                                        <h4 className="budget-summary-item-header">{transactions.filter((transact)=> transact.budget === budget.budget_id).length}</h4>
                                    </Col>
                                </Row>
                                <Row className="my-4">
                                    <Col>
                                        {purchaseCtgyList(budget.budget_id)}
                                    </Col>
                                </Row>
                            </Container>
                        </Accordion.Body>
                    </Accordion.Item>))}
            </Accordion>
        </Row>
        <Row className="my-5 justify-content-md-center">
            <Col md='auto'>
                <CustomPagination
                    totalItems={filteredBudgets?.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    currentPage={currentBudgetPage}
                    onPageChange={(page) => setCurrentBudgetPage(page)}
                    pagesInterval={PAGE_INTERVAL}
                />
            </Col>
        </Row>
        </div>
        

    </Container> );
}

export default TransactSummary;