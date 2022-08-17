import { useState } from "react";
import { Container, Row, Col, Button, Modal, Form, CloseButton, Badge } from "react-bootstrap";
import BudgetChart from "./BudgetChart";
import dayjs from "dayjs";
import { useEffect } from "react";

function BudgetDetails({budget, showBudgetDetail, handleCloseDetails, spendLimits, purchases, purcCategories, incomes}) {
    const [timePeriod, setTimePeriod] = useState("budget");
    const [useBudgetPeriod, setUseBudgetPeriod] = useState(true);
    const [purcCategoryFilter, setPurcCategoryFilter] = useState(-1);
    const [isBudgetActive, setIsBudgetActive] = useState(false);

    useEffect(() => {
        if(showBudgetDetail) {
            setTimePeriod("budget");
            setUseBudgetPeriod(true);
            setPurcCategoryFilter(-1);
            setIsBudgetActive(dayjs().isBefore(dayjs(budget.end_time)));
        }
    }, [showBudgetDetail])

    const createIncomeList = () => {
        if (Object.keys(incomes).length === 0 || incomes === undefined) {
            return <p>No incomes found</p>;
        }
        const incomesList = [];
        let totalIncome = 0;

        incomes.forEach((income, index) => {
            totalIncome += income.income_amount/100;
            incomesList.push(
            <Row key={index}>
                <Col>
                    {income.income_name}
                </Col>
                <Col>
                    ${(income.income_amount/100).toFixed(2)}
                </Col>
            </Row>)
        });

        incomesList.push(<Row key={incomes.length}><Col>Total</Col><Col>${totalIncome.toFixed(2)}</Col></Row>);

        return incomesList.length > 0 ? incomesList : <p>No incomes found</p>;
    }

    const createSpendLimitList = () => {
        if (Object.keys(spendLimits).length === 0 || spendLimits === undefined || !purcCategories) {
            return <p>No spend limits found</p>;
        }
        const limitsList = [];
        spendLimits.forEach((limit)=>{
            let purcCtgy = purcCategories.find(ctgy => ctgy.purc_category_id === limit.purc_category);
            if (purcCtgy !== undefined) {
                let purcCtgyTotal = 0;
                let purcCtgyPurchases = purchases.filter(purc => purc.purc_category && purc.purc_category === limit.purc_category);
                        purcCtgyPurchases.forEach((purc)=> purcCtgyTotal += parseFloat((purc.price/100).toFixed(2)));
                limitsList.push(
                    <Row key={limit.id}>
                        <Col>{purcCtgy.purc_category_name} </Col>
                        <Col>
                            ${purcCtgyTotal.toFixed(2)}
                        </Col>
                        <Col md='auto'>
                            /
                        </Col>
                        <Col>
                            {(limit.spend_limit/100).toFixed(2)} 
                        </Col>
                    </Row>
                );
            }
        });
        
        return limitsList.length > 0 ? limitsList : <p>No spend limits found</p>;
    }

    // Child component data
    const filteredPurchases = () => {
        if (purcCategoryFilter < 0) {
            return purchases;
        }
        return purchases.filter(purc => purc.purc_category === purcCategoryFilter);
    }

    const filteredPurchaseCategories = () => {
        if (purcCategoryFilter < 0) {
            return undefined;
        }
        return purcCategories.find(ctgy => ctgy.purc_category_id === purcCategoryFilter);
    }

    const filteredPurchaseCategoryLimits = () => {
        if (purcCategoryFilter < 0) {
            return undefined;
        }
        return spendLimits.find(limit => limit.purc_category === purcCategoryFilter);
    }
    
    return ( 
    <Modal onHide={handleCloseDetails} show={showBudgetDetail} dialogClassName="modal-budget-details" contentClassName="dark-modal-content">
        <Modal.Header>
            <h4>{budget?.budget_name}</h4>
            <Badge bg={isBudgetActive ? "info mx-2" : "secondary mx-2"}>{isBudgetActive ? 'Active' : 'Inactive'}</Badge>
            <CloseButton onClick={handleCloseDetails} variant="white" />
        </Modal.Header>
        <Modal.Body>
            <Container>
                <Row>
                    <Col>
                        <Form.Select onChange={e => setPurcCategoryFilter(parseInt(e.target.value))}>
                            <option value={-1} selected>No purchase category</option>
                            {purcCategories && purcCategories.length > 0 ? purcCategories.map((ctgy, index) => (
                                <option key={index} value={ctgy.purc_category_id}>{ctgy.purc_category_name}</option>
                            )) : <option value>None found</option>}
                        </Form.Select>
                    </Col>
                    <Col>
                        <Form.Select onChange={e => {
                            if (e.target.value==="budget") {setUseBudgetPeriod(true);} 
                            else {setTimePeriod(e.target.value); setUseBudgetPeriod(false);}
                            }}>
                            <option value={"budget"}>Budget lifetime</option>
                            <option value={7}>Past 7 days</option>
                            <option value={30}>Past 30 days</option>
                            <option value={90}>Past 90 days</option>
                            <option value={180}>Past 180 days</option>
                            <option value={365}>Past year</option>
                        </Form.Select>
                    </Col>
                </Row>
                <Row>
                    <Col>
                    <BudgetChart purcCategory={filteredPurchaseCategories()} purchases={filteredPurchases()} incomes={incomes} useBudgetPeriod={useBudgetPeriod}
                        budget={budget} spendLimit={filteredPurchaseCategoryLimits()} timePeriod={timePeriod} purcCategoryFilter={purcCategoryFilter}/> 
                    </Col>
                </Row>
                <Row className="my-2 mt-4 pt-3">
                    <Col>
                        <h5 className="border-bottom">
                            Predicted Income
                        </h5>
                        {createIncomeList()}
                    </Col>
                    <Col>
                        <h5 className="border-bottom">
                            Spend limits
                        </h5>
                        {createSpendLimitList()}
                    </Col>
                </Row>
            </Container>
            
        </Modal.Body>
        <Modal.Footer>
            <Button className="custom-btn-negative" onClick={handleCloseDetails}>Close</Button>
        </Modal.Footer>
    </Modal> );
}

export default BudgetDetails;