import { useState } from "react";
import { Container, Row, Col, Button, Modal, Form, CloseButton } from "react-bootstrap";
import BudgetChart from "./BudgetChart";
import dayjs from "dayjs";
import { useEffect } from "react";

function BudgetDetails({budget, showBudgetDetail, handleCloseDetails, spendLimits, purchases, purcCategories, incomes}) {
    const [timePeriod, setTimePeriod] = useState("budget");
    const [useBudgetPeriod, setUseBudgetPeriod] = useState(true);
    const [purcCategoryFilter, setPurcCategoryFilter] = useState(-1);

    useEffect(() => {
        if(showBudgetDetail) {
            setTimePeriod("budget");
            setUseBudgetPeriod(true);
            setPurcCategoryFilter(-1);
        }
    }, [showBudgetDetail])

    const filteredPurchases = () => {
        if (purcCategoryFilter < 0) {
            return purchases;
        }
        return purchases.filter(purc => purc.purc_category === purcCategoryFilter);
    }

    console.log(timePeriod)

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
            {budget?.budget_name}
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
            </Container>
            
        </Modal.Body>
        <Modal.Footer>
            <Button className="custom-btn-negative" onClick={handleCloseDetails}>Close</Button>
        </Modal.Footer>
    </Modal> );
}

export default BudgetDetails;