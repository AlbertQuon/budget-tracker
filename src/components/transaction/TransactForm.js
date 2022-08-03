import { useState, useContext, useEffect } from "react";
import { Modal, Form, Card, Button, Row, Col, FormCheck } from "react-bootstrap";
import useAxios from "../utils/useAxios";
import AuthContext from "../auth/AuthContext";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";

function TransactForm({purcCategories, taxCategories, budgets, handleCloseForm, showForm, fetchData}) {

    // * do not put components into state, use state data to render component (due to inconsistencies)
    const {user} = useContext(AuthContext);

    const [purchasePrices, setPurchasePrices] = useState([]);
    const [purchaseCounter, setPurchaseCounter] = useState(0);
    const [subtotal, setSubtotal] = useState(0.00);
    const [taxRates, setTaxRates] = useState([]);
    const [transactDate, setTransactDate] = useState(Date.now());
    const [total, setTotal] = useState(0.00);
    const [currentBudget, setCurrentBudget] = useState({});
    const api = useAxios();

    useEffect(() => {
        if (budgets.length > 0) {
            setCurrentBudget(budgets[0]);
        }
    }, [])
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
        setPurchasePrices(purchasePrices.filter(purc => purc.key !== key));
    }

    const onPriceChange = (key, value) => {
        let price = parseFloat(parseFloat(value).toFixed(2));
        let index = purchasePrices.findIndex(price => price.key === key);
        if (index !== -1) {
            setPurchasePrices(purchasePrices => 
                purchasePrices.slice(0, index).concat([{key:key, price: price}]).concat(purchasePrices.slice(index+1)))
        } 
    }

    const onTaxChecked = (taxId, taxRate, isChecked) => { 
        // use slice, due to splice mutating the state and not updating the reference
        // taxId is int, object.keys is string
        if (isChecked) {
            setTaxRates(taxRates => [...taxRates, {taxId: taxId, taxRate: taxRate}]);
        } else {
            /*let index = taxRates.findIndex(tax => Object.keys(tax)[0] === taxId.toString()); 
            if (index !== -1) {
                setTaxRates(taxRates => taxRates.slice(0,index).concat(taxRates.slice(index+1)));
            } */
            setTaxRates(taxRates => taxRates.filter(tax => tax.taxId !== taxId))
        }
    }
    
    const onFormSubmit = (event) => {
        event.preventDefault();
        var form = event.target;
        /*Array.from(form.elements).forEach((input) => {
            //console.log("input", input.type, input.value, input.id);
        });*/
        var budget = form[0].value;

        var purchases = [];
        for (let i = 0; i < purchasePrices.length; i++) {
            let formIndex = 3 + 4*i;
            //console.log("input", form.elements[i].type, form.elements[i].value, form.elements[i].id);
            purchases.push({
                purc_category: form.elements[formIndex].value,
                item_name: form.elements[formIndex+1].value,
                price: form.elements[formIndex+2].value
            });
        }
        if (purchases.length < 1) {
            alert("Must have at least one purchase");
            event.stopPropagation();
        }
        
        api.post('/transactions/', {
            transact_date: dayjs(transactDate).format("YYYY-MM-DD"),
            user: user.user_id,
            budget: budget
        }).then(res => {
            // post transact tax
            let transact = res.data;
            let taxRatePromises = [];
            let purchasesPromises = [];

            taxRates.forEach(tax => {
                taxRatePromises.push(api.post('/transactionTax/', {
                    transact: transact.transact_id,
                    tax: tax.taxId,
                    user: user.user_id,
                }));
            });
            // post purchases
            purchases.forEach(purchase => {
                purchasesPromises.push(api.post('/purchases/',{
                    item_name: purchase.item_name,
                    price: parseFloat(parseFloat(purchase.price).toFixed(2))*100,
                    transact: transact.transact_id,
                    purc_category: parseInt(purchase.purc_category),
                }));
            });
            let taxRateRes = Promise.all(taxRatePromises);
            let purchasesRes = Promise.all(purchasesPromises);
            Promise.all([taxRateRes, purchasesRes]).then(() => {
                handleCloseForm();
                fetchData();
            });
        }).catch(err => {console.log(err); alert("Failed to submit"); event.target.reset();})
        
        
    }

    var purchaseFields = purchasePrices.map((field) => (
        <Form.Group as={Row} key={field.key}>
            <Col>
            <Form.Select>
            <option disabled selected value>Select a purchase category</option>
                {purcCategories.map((ctgy) => (<option key={ctgy.purc_category_id}
                                value={`${ctgy.purc_category_id}`}>{ctgy.purc_category_name}</option>))}
            </Form.Select></Col>
            <Col>
            <Form.Control type="text" placeholder="Enter item name"/></Col>
            <Col>
            <Form.Control onChange={e => onPriceChange(field.key, e.target.value)} 
            onKeyPress={(e) => !/^\d*(\.\d{0,2})?$/.test(e.key) && e.preventDefault()} defaultValue="0.00" type="number" step="0.01" min="0" placeholder="0.00"/>
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
    <Modal backdrop="static" show={showForm} onHide={handleCloseForm} contentClassName="transactForm-modal-content" dialogClassName="transactForm-modal-dialog">
        <Modal.Header closeButton>
            <Modal.Title>Add transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body className="m-3">
            <Form onSubmit={onFormSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Budget</Form.Label>
                    {budgets.length > 0 ? // e.target value is string
                        <Form.Select onChange={(e) => {setCurrentBudget(budgets[budgets.findIndex(b => b.budget_id===parseInt(e.target.value))])}}> 
                        <option disabled selected value>Select a budget</option>
                        {budgets.map((budget) => {
                            if (Date.parse(budget.end_time) >= Date.now()) {
                                return (<option key={budget.budget_id} value={budget.budget_id}>{budget.budget_name}
                                </option>);
                            }
                        })}
                        </Form.Select> : <p><strong>No budgets found</strong></p>
                    }
                </Form.Group>
                <DatePicker minDate={Date.parse(currentBudget.start_time)} maxDate={Date.now()} selected={transactDate} onChange={(date) => setTransactDate(date)}></DatePicker>
                <Form.Group className="mb-3">
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
                                <FormCheck onChange={e=>(onTaxChecked(tax.tax_id, tax.tax_rate, e.target.checked))}></FormCheck>
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
    );
}

export default TransactForm;