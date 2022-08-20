import dayjs from "dayjs";
import { useEffect, useContext, useState } from "react";
import { Accordion, AccordionContext, Button, Col, Row, useAccordionButton, Modal, Form, CloseButton, Container, FloatingLabel } from "react-bootstrap";
import '../../css/Transact.css'
import TransactEditForm from "./TransactEditForm";

function TransactList({api, purcCategories, purchases, transactions, taxCategories, transactTaxes, budgets, onTransactDelete, fetchData, handleShowForm}) {

    const [showEditForm, setShowEditForm] = useState(false);
    const [editTransaction, setEditTransaction] = useState({});
    const handleCloseEditForm = () => setShowEditForm(false);
    const handleOpenEditForm = () => setShowEditForm(true);
    const [showDeleteBox, setShowDeleteBox] = useState(false);
    const [budgetFilter, setBudgetFilter] = useState("");
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [sort, setSort] = useState(1);

    useEffect(()=>{
        if (budgetFilter.length > 0) {
            let newTransactions = [...transactions].filter(transact => 
                budgets.find(budget => transact.budget === budget.budget_id).budget_name.includes(budgetFilter));
            
            if (sort > 0) {
                newTransactions = newTransactions.sort((a,b) => {
                    if (sort === 1) {
                        return dayjs(a.transact_date).diff(dayjs(b.transact_date));
                    } 
                    if (sort === 2) {
                        let budgetA = budgets.find(budget => a.budget === budget.budget_id);
                        let budgetB = budgets.find(budget => b.budget === budget.budget_id);
                        return budgetA.budget_name.localeCompare(budgetB.budget_name);
                    }
                    return 0;
                });
            }
            setFilteredTransactions(newTransactions);
        } else {
            if (sort > 0) {
                let newTransactions = [...transactions].sort((a,b) => {
                    if (sort === 1) {
                        return dayjs(a.transact_date).diff(dayjs(b.transact_date), 'day');
                    } 
                    if (sort === 2) {
                        let budgetA = budgets.find(budget => a.budget === budget.budget_id);
                        let budgetB = budgets.find(budget => b.budget === budget.budget_id);
                        return budgetA.budget_name.localeCompare(budgetB.budget_name);
                    }
                    return 0;
                });
                setFilteredTransactions(newTransactions);
            } else {
                setFilteredTransactions(transactions);
            }
        }
    }, [budgetFilter, transactions, sort])


    // Components
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
            return <p className="purchaseList my-2">No purchases found</p>
        }
        const purcList = [];
        purchases[transact_id].forEach((purc) => {
            // find object
            let ctgy = purcCategories.find(purcCtgy => purcCtgy.purc_category_id === purc.purc_category);
            purcList.push(
                <Row> 
                    <Col className="transaction-detail-accordion-body-name">
                        {purc.item_name} 
                    </Col>
                    <Col>
                        {ctgy ? '('+ctgy.purc_category_name+')' : "(N/A)"}
                    </Col>
                    <Col className="transaction-detail-accordion-body-price transaction-detail-accordion-body-divider">
                        ${(purc.price/100).toFixed(2)}
                    </Col>
                </Row>
            )
        });

        return purcList.length > 0 ? purcList : <p className="purchaseList my-2">No purchases found</p>
    }

    const taxesList = (transact_id) => {
            if (purchases[transact_id] === undefined || !purchases) {
                return null;
            }
            const subtotal = calcSubtotal(transact_id);
            const taxList = [];
            let taxes = transactTaxes.filter(transactTax => transactTax.transact === transact_id);
            taxCategories.forEach((taxCtgy) => {
                if (taxes.findIndex(tax => tax.tax === taxCtgy.tax_id) !== -1) {
                    taxList.push(
                        <Row>
                            <Col className="transaction-detail-accordion-body-name">
                                {taxCtgy.tax_name}
                            </Col>
                            <Col>
                                {taxCtgy.tax_rate}%
                            </Col>
                            <Col className="transaction-detail-accordion-body-price">
                                ${(subtotal*taxCtgy.tax_rate/100).toFixed(2)}
                            </Col>
                        </Row>
                    );
                } 
            });

            return taxList.length > 0 ? taxList : "None";
        }
    // Calculation functions
    const calcTaxTotal = (transact_id) => {
        var taxTotal = 0.00;
        if (purchases[transact_id] === undefined || !purchases) {
            return taxTotal;
        }
        let taxes = transactTaxes.filter(transactTax => transactTax.transact === transact_id);
        // loop through each tax category and add them
        taxCategories.forEach((taxCtgy) => {
            if (taxes.findIndex(transactTax => transactTax.tax === taxCtgy.tax_id) !== -1) {
                purchases[transact_id].forEach((purc) => {
                    taxTotal += purc.price/100 * (taxCtgy.tax_rate/100);
                });
            } 
            
        });
        
        return taxTotal.toFixed(2);
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

    const calcTotal = (transact_id) => {
        var total = 0.00;
        if (purchases[transact_id] === undefined || !purchases) {
            return total;
        }
        //console.log(transactTaxes)
        let taxes = transactTaxes.filter(transactTax => transactTax.transact === transact_id);
        // loop through each tax category and add them
        taxCategories.forEach((taxCtgy) => {
            if (taxes.findIndex(tax => tax.tax === taxCtgy.tax_id) !== -1) {
                purchases[transact_id].forEach((purc) => {
                    total += purc.price/100 * (taxCtgy.tax_rate/100);
                });
                
            } 
        });

        purchases[transact_id].forEach((purc) => {
            total += purc.price/100;
        });
        
        return total.toFixed(2);
    }

    

    function CustomExpand({children, eventKey, callback}) {
        const onClickExpand = useAccordionButton(eventKey, ()=> callback && callback(eventKey));
        const { activeEventKey } = useContext(AccordionContext);
        const isCurrentEventKey = activeEventKey === eventKey;

        return <Button onClick={onClickExpand} className='custom-btn'>
            {isCurrentEventKey ? '-' : '+'}
            {children}
        </Button>
    }

    const ConfirmDeleteBox = () => {
        return ( 
        <Modal id="confirmDeleteBox" backdrop="static" show={showDeleteBox} contentClassName="dark-modal-content" onHide={() => setShowDeleteBox(false)}>
            <Modal.Header>
                <Modal.Title>Confirmation</Modal.Title>
                <CloseButton onClick={() => setShowDeleteBox(false)} variant='white'/>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this budget?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button className="custom-btn" onClick={() => {setShowDeleteBox(false); }}>No</Button>
                <Button className="custom-btn-negative" onClick={() => {onTransactDelete(editTransaction.transact_id); setShowDeleteBox(false); }}>Confirm</Button>
            </Modal.Footer>
        </Modal> );
    } 

    return ( 
    <Container>
        {ConfirmDeleteBox()}
        <TransactEditForm api={api} transaction={editTransaction} showEditForm={showEditForm} handleCloseEditForm={handleCloseEditForm} handleOpenEditForm={handleOpenEditForm} onTransactDelete={onTransactDelete}
            budgets={budgets} purcCategories={purcCategories} purchases={purchases} taxCategories={taxCategories} transactions={transactions} transactTaxes={transactTaxes} fetchData={fetchData} />
        <Row className="mt-3">
            <Col><h3>Transactions</h3></Col>
            <Col className="me-2" md='auto'>
                <Button className="custom-btn" onClick={handleShowForm}>Add transaction</Button>
            </Col>
        </Row>
        <Row className="my-3">
            <Col xs={6}>
                <FloatingLabel className="input-label transaction-select-text" label="Budget Name">
                    <Form.Control type="text" placeholder="Search by budget..." onChange={e=>setBudgetFilter(e.target.value)} ></Form.Control>
                </FloatingLabel>
            </Col>
            <Col xs={6}>
                <FloatingLabel className="input-label transaction-select-text" label="Sort by">
                    <Form.Select onChange={e=> setSort(parseInt(e.target.value))}>
                        <option selected value={1}>Date</option>
                        <option value={2}>Budget name</option>
                    </Form.Select>
                </FloatingLabel>
            </Col>
        </Row>
        {Object.keys(filteredTransactions).length !== 0 ? filteredTransactions.map((transact) => (
            <Row className="transaction-item" key={transact.transact_id} bg='dark'>
                <Col className="m-2">
                    <Accordion className="transaction-detail-accordion">
                        <Row className="transaction-item-detail">
                            <Col><h4>{transact.transact_date}</h4></Col>
                            <Col><p>{transactBudget(transact.budget)}</p></Col>
                            <Col><p>${calcTotal(transact.transact_id)}</p></Col>
                            <Col md='auto'>
                                <CustomExpand eventKey={transact.transact_id}></CustomExpand>
                            </Col>
                            <Col md='auto' className="ms-5">
                                <Button className="custom-btn mx-1" 
                                    onClick={()=> {setShowEditForm(true); setEditTransaction(transact);}}>Edit</Button>
                                <Button className="custom-btn-negative mx-1" 
                                    onClick={() => {setShowDeleteBox(true); setEditTransaction(transact);}}>Delete</Button>
                            </Col>
                        </Row>
                        <Accordion.Collapse className="" eventKey={transact.transact_id}>
                            <Row className="mt-3 p-4 px-lg-5 transaction-detail-accordion-body">
                                <Row className="transaction-detail-accordion-body-headers">
                                    <Col xs={4}>
                                        Purchases 
                                    </Col>
                                    <Col xs={2} className="transaction-detail-accordion-body-price transaction-detail-accordion-body-divider">
                                        ${calcSubtotal(transact.transact_id)}
                                    </Col>
                                    <Col xs={4}>
                                        Taxes
                                    </Col>
                                    <Col xs={2} className="transaction-detail-accordion-body-price">
                                        ${calcTaxTotal(transact.transact_id)}
                                    </Col>
                                </Row>
                                <Row className="transaction-detail-accordion-body-list">
                                    <Col>
                                        {purchasesList(transact.transact_id)}
                                    </Col>
                                    <Col>
                                        {taxesList(transact.transact_id)}
                                    </Col>
                                </Row>
                            </Row>
                        </Accordion.Collapse>
                    </Accordion>
                </Col>
            </Row>
        )) : <h5>No transactions found</h5>}
    </Container>);
}

export default TransactList;