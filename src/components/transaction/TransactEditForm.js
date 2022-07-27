import { useState, useContext, useEffect } from "react";
import { Modal, Form, Card, Button, Row, Col, FormCheck } from "react-bootstrap";
import useAxios from "../utils/useAxios";
import AuthContext from "../auth/AuthContext";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";

function TransactEditForm({transactTaxes, transaction, purchases, purcCategories, taxCategories, budgets, handleCloseEditForm, showEditForm, onTransactDelete, handleOpenEditForm}) {

    // * do not put components into state, use state data to render component (due to inconsistencies)
    const {user} = useContext(AuthContext);

    const [purchasePrices, setPurchasePrices] = useState([]);
    const [purchaseCounter, setPurchaseCounter] = useState(0);
    const [subtotal, setSubtotal] = useState(0.00);
    const [taxRates, setTaxRates] = useState([]);
    const [transactDate, setTransactDate] = useState(Date.now());
    const [total, setTotal] = useState(0.00);
    const [currentBudget, setCurrentBudget] = useState({});
    
    const [toBeDeletedPurchases, setToBeDeletedPurchases] = useState([]);
    const [toBeDeletedTaxes, setToBeDeletedTaxes] = useState([]);
    const api = useAxios();
    
    useEffect(() => {
        if (showEditForm) {
            //setCurrentBudget(budgets.find(budget => transaction.budget === budget.budget_id));
            if (budgets.find(budget => transaction.budget === budget.budget_id)) {
                setCurrentBudget(budgets.find(budget => transaction.budget === budget.budget_id));
            }
            let currPurchases = [];
            setTransactDate(dayjs(transaction.transact_date).toDate());
            purchases[transaction.transact_id]?.forEach((purc) => {
                    currPurchases.push({key: purchaseCounter+currPurchases.length, price: purc.price/100, data: purc}); 
                });
            setPurchaseCounter(purchaseCounter => purchaseCounter+currPurchases.length);
            let currTaxes = [];
            transactTaxes.filter(transactTax => transactTax.transact === transaction.transact_id).forEach((transactTax) => {
                let tempTax = taxCategories.find((tax) => tax.tax_id === transactTax.tax);
                if (tempTax) {
                    currTaxes.push({taxId: tempTax.tax_id, taxRate: tempTax.tax_rate, prevTaxId: transactTax.id});
                }
            });
            setTaxRates(currTaxes);
            setPurchasePrices(currPurchases);
        } else {
            setPurchaseCounter(0);
            setSubtotal(0);
            setTaxRates([]);
            setTotal(0);
            setCurrentBudget({});
            setPurchasePrices([]);
            setToBeDeletedPurchases([]);
            setToBeDeletedTaxes([]);
        }
    }, [showEditForm]);

    useEffect(() => {
        /* update subtotal*/
        let newSubtotal = parseFloat(0.00);
        for (let purcPrice in purchasePrices) {
            newSubtotal += parseFloat(purchasePrices[purcPrice].price);
        }
        setSubtotal(newSubtotal);
        /* update total */
        let newTotal = parseFloat(0.00);
        
        taxRates.forEach(tax => {
            newTotal += newSubtotal*parseFloat((tax.taxRate/100).toFixed(2));
        })
        setTotal(newTotal+newSubtotal);
        }, [purchasePrices, taxRates]);

    const addPurchaseField = () => {
        let key = purchaseCounter.toString();
        
        setPurchaseCounter(purchaseCounter => purchaseCounter+1);
        setPurchasePrices(purchasePrices => ([...purchasePrices, {key: key, price: 0.00}]));
    }

    const removePurchaseField = (key) => {
        let purchase = purchasePrices.find(purc => purc.key === key);
        
        if (purchase.hasOwnProperty('data')) {
            //toBeDeletedPurchases.push(purchase.data);e
            setToBeDeletedPurchases([...toBeDeletedPurchases, purchase.data]);
        }
        setPurchasePrices(purchasePrices.filter(purc => purc.key !== key));
    }

    const onPriceChange = (key, value) => {
        let price = parseFloat(parseFloat(value).toFixed(2));
        let index = purchasePrices.findIndex(price => price.key === key);
        if (index !== -1) {
            if (purchasePrices[index].hasOwnProperty('data')) {
                setPurchasePrices(purchasePrices => 
                    purchasePrices.slice(0, index).concat([{key:key, price: price, data: purchasePrices[index].data}]).concat(purchasePrices.slice(index+1)))
            } else {
                setPurchasePrices(purchasePrices => 
                    purchasePrices.slice(0, index).concat([{key:key, price: price}]).concat(purchasePrices.slice(index+1)))
            }
        } 
    }

    const onTaxChecked = (taxId, taxRate, isChecked) => { 
        // use slice, due to splice mutating the state and not updating the reference
        // taxId is int, object.keys is string
        
        if (isChecked) {
            let prevTax = toBeDeletedTaxes.find(tax => tax.taxId===taxId);
            if (prevTax) {
                setToBeDeletedTaxes(toBeDeletedTaxes.filter(tax => tax.taxId !== taxId));
                setTaxRates(taxRates => [...taxRates, prevTax]);
            } else {
                setTaxRates(taxRates => [...taxRates, {taxId: taxId, taxRate: taxRate}]);
            }
        } else {
            let prevTax = taxRates.find(tax => tax.taxId===taxId);
            if (prevTax.hasOwnProperty('prevTaxId')) {
                setToBeDeletedTaxes([...toBeDeletedTaxes, prevTax]);
            }
            setTaxRates(taxRates => taxRates.filter(tax => tax.taxId !== taxId));
        }
    }
    
    const onFormSubmit = (event) => {
        event.preventDefault();
        var form = event.target;
        /*Array.from(form.elements).forEach((input) => {
            //console.log("input", input.type, input.value, input.id);
        });*/
        var budget = form[0].value;

        var formPurchases = [];
        for (let i = 0; i < purchasePrices.length; i++) {
            let formIndex = 3 + 4*i;
            //console.log("input", form.elements[i].type, form.elements[i].value, form.elements[i].id);
            formPurchases.push({
                purc_category: form.elements[formIndex].value,
                item_name: form.elements[formIndex+1].value,
                price: form.elements[formIndex+2].value,
            });
            if (purchasePrices[i].hasOwnProperty('data')) {
                formPurchases[formPurchases.length-1].purc_id = purchasePrices[i].data.purc_id;
            }
        }
        if (formPurchases.length < 1) {
            alert("Must have at least one purchase");
            event.stopPropagation();
            return;
        }
        
        let url = `/transactions/${transaction.transact_id}/`;
        api.patch(url, {
            transact_date: dayjs(transactDate).format("YYYY-MM-DD"),
            user: user.user_id,
            budget: budget
        }).then(res => {
            // post transact tax
            let transact = res.data;
            taxRates.forEach(tax => {
                if (!tax.hasOwnProperty('prevTaxId')) {
                    api.post('/transactionTax/', {
                        transact: transact.transact_id,
                        tax: tax.taxId,
                        user: user.user_id,
                    }).catch(err => console.log(err));
                    /*let url = `/transactionTax/${tax.prevTaxId}/`;
                    api.patch(url, {
                        transact: transact.transact_id,
                        tax: tax.taxId,
                        user: user.user_id,
                    }).catch(err => console.log(err));*/
                }
            });
            // post purchases
            formPurchases.forEach(purchase => { //if purchase has data
                if ('purc_id' in purchase) {
                    let url = `/purchases/${purchase.purc_id}/`;
                    api.patch(url, {
                        item_name: purchase.item_name,
                        price: parseFloat(parseFloat(purchase.price).toFixed(2))*100,
                        transact: transact.transact_id,
                        purc_category: parseInt(purchase.purc_category),
                    }).catch(err => console.log(err));;
                } else {
                    api.post('/purchases/',{
                        item_name: purchase.item_name,
                        price: parseFloat(parseFloat(purchase.price).toFixed(2))*100,
                        transact: transact.transact_id,
                        purc_category: parseInt(purchase.purc_category),
                    }).catch(err => console.log(err));;
                }
            });
            toBeDeletedTaxes.forEach(tax => {
                let url = `/transactionTax/${tax.prevTaxId}/`
                api.delete(url, {data: {id: tax.prevTaxId}}).catch(err => console.log(err));
            })

            toBeDeletedPurchases.forEach(purc => {
                let url = `/purchases/${purc.purc_id}/`
                api.delete(url, {data: {purc_id: purc.purc_id}}).catch(err => console.log(err));
            })
            handleCloseEditForm();
        }).catch(err => {console.log(err); alert("Failed to submit"); event.target.reset();})
        
        
    }

    var purchaseFields = purchasePrices.map((field) => (
        <Form.Group as={Row} key={field.key}>
            <Col>
            <Form.Select value={field.data?.purc_category}>
                {purcCategories.map((ctgy) => (<option key={ctgy.purc_category_id}
                                value={`${ctgy.purc_category_id}`}>{ctgy.purc_category_name}</option>))}
            </Form.Select></Col>
            <Col>
            <Form.Control type="text" placeholder="Enter item name" defaultValue={'data' in field ? field.data.item_name : ""}/></Col>
            <Col>
            <Form.Control onChange={e => onPriceChange(field.key, e.target.value)} 
            onKeyPress={(e) => !/^\d*(\.\d{0,2})?$/.test(e.key) && e.preventDefault()} 
            defaultValue={'data' in field ? field.data.price/100 : 0.00} type="number" step="0.01" min="0" placeholder="0.00"/>
            </Col>
            <Col>
            <Button onClick={()=> {removePurchaseField(field.key)}}>-</Button></Col>
        </Form.Group>
    ));

    const calcTaxPrice = (taxId) => {
        let tax = taxRates.find(tax => tax.taxId === taxId);
        if (tax === undefined) { return null;}
        return "$" + (parseFloat((tax.taxRate/100).toFixed(2)) * subtotal).toFixed(2);
    }

    return (
        <div>
            <Modal backdrop="static" show={showEditForm} onHide={handleCloseEditForm} contentClassName="transactForm-modal-content" dialogClassName="transactForm-modal-dialog">
            <Modal.Header closeButton>
                <Modal.Title>Edit transaction</Modal.Title>
            </Modal.Header>
            <Modal.Body className="m-3">
                <Form onSubmit={onFormSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Budget</Form.Label>
                        {budgets.length > 0 ? // e.target value is string
                            <Form.Select onChange={(e) => {if (budgets) setCurrentBudget(budgets[budgets.findIndex(b => b.budget_id===parseInt(e.target.value))])}}> 
                            <option disabled defaultValue>Select a budget</option>
                            {budgets.map((budget) => {
                                
                                if (Date.parse(budget.end_time) >= Date.now()) {
                                    return (<option selected={budget.budget_id === currentBudget.budget_id} key={budget.budget_id} value={budget.budget_id}>{budget.budget_name}
                                    </option>);
                                }
                                
                            })}
                            </Form.Select> : <p><strong>No budgets found</strong></p>
                        }
                    </Form.Group>
                    <DatePicker minDate={Date.parse(currentBudget.start_time)} maxDate={Date.now()} selected={transactDate} onChange={(date) => setTransactDate(date)}></DatePicker>
                    <Form.Group className="mt-3">
                        <Form.Label className="me-2">Purchases</Form.Label>
                        <Button onClick={addPurchaseField}>Add</Button>
                    </Form.Group>
                    <Form.Group as={Row}>
                        <Col>Purchase Category</Col>
                        <Col>Item Name</Col>
                        <Col>Price</Col>
                        <Col>Delete</Col>
                    </Form.Group>
                    {purchaseFields}
                    <Form.Group as={Row} className="my-3">   
                        <Col><p>Subtotal:</p></Col>
                        <Col><p>${subtotal.toFixed(2)}</p></Col>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="me-2">Tax</Form.Label>
                        {taxCategories.length !== 0 ? 
                            taxCategories.map((tax) => (
                                <Row key={tax.tax_id}>
                                <Col>
                                    <p>{tax.tax_name} ({tax.tax_rate}%)</p>
                                    <FormCheck checked={taxRates.findIndex(taxRate => taxRate.taxId === tax.tax_id) !== -1} 
                                    onChange={e=>(onTaxChecked(tax.tax_id, tax.tax_rate, e.target.checked))}/>
                                </Col>
                                <Col>
                                    <p>{calcTaxPrice(tax.tax_id)}</p>
                                </Col>
                                </Row>
                            ))
                        : <Row>No tax categories found</Row>
                        }
                    </Form.Group>
                    
                    <Row>   
                        <Col><p>Total:</p></Col>
                        <Col><p>${total.toFixed(2)}</p></Col>
                    </Row>
                    
                    
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Modal.Body>
            </Modal> 
        </div>
        
    );
}

export default TransactEditForm;