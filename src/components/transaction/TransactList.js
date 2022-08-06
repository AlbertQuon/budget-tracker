import { useState } from "react";
import { useContext } from "react";
import { Accordion, AccordionContext, Button, Col, Row, useAccordionButton, Modal } from "react-bootstrap";
import '../../css/Transact.css'
import TransactEditForm from "./TransactEditForm";

function TransactList({api, purcCategories, purchases, transactions, taxCategories, transactTaxes, budgets, onTransactDelete, fetchData}) {

    const [showEditForm, setShowEditForm] = useState(false);
    const [editTransaction, setEditTransaction] = useState({});
    const handleCloseEditForm = () => setShowEditForm(false);
    const handleOpenEditForm = () => setShowEditForm(true);
    const [showDeleteBox, setShowDeleteBox] = useState(false);

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
                <p>{purc.item_name}: ${(purc.price/100).toFixed(2)} {ctgy ? '('+ctgy.purc_category_name+')' : "(N/A)"}</p>
            )
        });

        return purcList.length > 0 ? <div className="purchaseList my-2">{purcList}</div> : <p className="purchaseList my-2">No purchases found</p>
    }

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

    const taxesList = (transact_id) => {
        if (purchases[transact_id] === undefined || !purchases) {
            return null;
        }
        const taxList = [];
        let taxes = transactTaxes.filter(transactTax => transactTax.transact === transact_id);
        taxCategories.forEach((taxCtgy) => {
            if (taxes.find(tax => tax.tax === taxCtgy.tax_id) !== -1) {
                taxList.push(taxCtgy.tax_name);
            } 
        });

        return taxList.length > 0 ? taxList.join(", ") : "None";
    }

    function CustomExpand({children, eventKey, callback}) {
        const onClickExpand = useAccordionButton(eventKey, ()=> callback && callback(eventKey));
        const { activeEventKey } = useContext(AccordionContext);
        const isCurrentEventKey = activeEventKey === eventKey;
        return <Button onClick={onClickExpand} style={{ backgroundColor: isCurrentEventKey ? 'dark-grey' : 'grey' }}>
            {isCurrentEventKey ? '-' : '+'}
            {children}
        </Button>
    }

    const ConfirmDeleteBox = () => {
        return ( 
        <Modal id="confirmDeleteBox" backdrop="static" show={showDeleteBox} contentClassName="dark-modal-content" onHide={() => setShowDeleteBox(false)}>
            <Modal.Header closeButton>
            <Modal.Title>Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this budget?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {setShowDeleteBox(false); }}>No</Button>
                <Button variant="primary" onClick={() => {onTransactDelete(editTransaction.transact_id); setShowDeleteBox(false); }}>Confirm</Button>
            </Modal.Footer>
        </Modal> );
    } 

    return ( 
    <div>
        {ConfirmDeleteBox()}
        <TransactEditForm api={api} transaction={editTransaction} showEditForm={showEditForm} handleCloseEditForm={handleCloseEditForm} handleOpenEditForm={handleOpenEditForm} onTransactDelete={onTransactDelete}
            budgets={budgets} purcCategories={purcCategories} purchases={purchases} taxCategories={taxCategories} transactions={transactions} transactTaxes={transactTaxes} fetchData={fetchData} />
        <Row><Col><input type="text" placeholder="Search by budget..." ></input></Col></Row>
        {Object.keys(transactions).length !== 0 ? transactions.map((transact) => (
            <Row className="transactionItem my-1 mx-2" key={transact.transact_id} bg='dark'>
                <Col className="m-2">
                <Row>
                <Col><h4>{transact.transact_date}</h4></Col>
                <Col><h5>{transactBudget(transact.budget)}</h5></Col>
                <Col><p>Total: ${calcTotal(transact.transact_id)}</p></Col>
                <Col><Button onClick={()=> {setShowEditForm(true); setEditTransaction(transact);}}>Edit</Button><Button onClick={() => {setShowDeleteBox(true); setEditTransaction(transact);}}>Delete</Button></Col>
                </Row>
                <Row><Col>
                    <Accordion>
                    <CustomExpand eventKey={transact.transact_id}></CustomExpand>
                    <Accordion.Collapse eventKey={transact.transact_id}>
                        <Row className="mt-3 transactDetail">
                            <Col>
                            <p>Subtotal: ${calcSubtotal(transact.transact_id)}</p>
                            </Col>
                            <Col>
                            <p>Taxes: ${calcTaxTotal(transact.transact_id)} ({taxesList(transact.transact_id)})</p>
                            </Col>
                            <strong>Purchases</strong>
                            {purchasesList(transact.transact_id)}
                        </Row>
                    </Accordion.Collapse>
                    </Accordion>
                </Col></Row>
                </Col>
            </Row>
        )) : <h5>No transactions found</h5>}
    </div>);
}

export default TransactList;