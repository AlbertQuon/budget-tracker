import { useState, useContext, useEffect, useCallback } from "react";
import { Modal, Form, Card, Button, Row, Col, FormCheck, CloseButton, FloatingLabel } from "react-bootstrap";
import useAxios from "../utils/useAxios";
import AuthContext from "../auth/AuthContext";
import { DatePickerField } from "../utils/DatePickerField";
import dayjs from "dayjs";
import { Formik, useField, FieldArray } from 'formik';
import * as Yup from 'yup';

function TransactEditForm({api, transactTaxes, transaction, purchases, purcCategories, taxCategories, budgets, handleCloseEditForm, showEditForm, onTransactDelete, handleOpenEditForm, fetchData}) {

    // * do not put components into state, use state data to render component (due to inconsistencies)
    const {user} = useContext(AuthContext);

    const [purchasePrices, setPurchasePrices] = useState([]);
    const [initialPurchases, setInitialPurchases] = useState([]);
    const [subtotal, setSubtotal] = useState(0.00);
    const [taxRates, setTaxRates] = useState([]);
    const [initialTaxRates, setInitialTaxRates] = useState([]);
    const [transactDate, setTransactDate] = useState(Date.now());
    const [total, setTotal] = useState(0.00);
    const [currentBudget, setCurrentBudget] = useState({});
    
    const [toBeDeletedPurchases, setToBeDeletedPurchases] = useState([]);
    const [toBeDeletedTaxes, setToBeDeletedTaxes] = useState([]);
    useEffect(() => {
        if (showEditForm) {
            //setCurrentBudget(budgets.find(budget => transaction.budget === budget.budget_id));
            if (budgets.find(budget => transaction.budget === budget.budget_id)) {
                setCurrentBudget(budgets.find(budget => transaction.budget === budget.budget_id));
            }
            let currPurchases = [];
            setTransactDate(dayjs(transaction.transact_date).toDate());
            purchases[transaction.transact_id]?.forEach((purc) => {
                    currPurchases.push({purc_id: purc.purc_id, price: purc.price/100, itemName: purc.item_name, purcCategory: purc.purc_category}); 
                });
            let currTaxes = [];
            transactTaxes.filter(transactTax => transactTax.transact === transaction.transact_id).forEach((transactTax) => {
                let tempTax = taxCategories.find((tax) => tax.tax_id === transactTax.tax);
                if (tempTax) {
                    currTaxes.push({taxId: tempTax.tax_id, prevTaxId: transactTax.id});
                }
            });
            let tempTaxRates = [];
            taxCategories.forEach((taxCtgy, index) => {
                if (currTaxes.findIndex(transactTax => transactTax.taxId === taxCtgy.tax_id) !== -1) {
                    tempTaxRates.push(true);
                } else {
                    tempTaxRates.push(false);
                }
            })
            setTaxRates(tempTaxRates);
            setInitialTaxRates(currTaxes);
            setPurchasePrices(currPurchases);
            setInitialPurchases(currPurchases.slice());
        } else {
            setSubtotal(0);
            setTaxRates([]);
            setTotal(0);
            setCurrentBudget({});
            setPurchasePrices([]);
            setInitialTaxRates([]);
            setToBeDeletedPurchases([]);
            setToBeDeletedTaxes([]);
        }
    }, [showEditForm]);

    const formRef = useCallback(node=> {
        if (node !== null) {
            console.log(node.values)
            let newSubtotal = parseFloat(0.00);
            let newTotal = parseFloat(0.00);

            /* update subtotal*/
            let purchasesValues = node.values.purchases ? node.values.purchases : [];
            purchasesValues.forEach(purc => {if (typeof purc.price === 'number') {newSubtotal+= purc.price}});
            
            /* update total */
            let taxRateValues = node.values.taxRates ? node.values.taxRates : [];
            for (let i = 0; i < taxRateValues.length; i++) {
                if (taxRateValues[i]) {
                    newTotal += newSubtotal*parseFloat((taxCategories[i].tax_rate/100).toFixed(2));
                }
            }
            if (!isNaN(newSubtotal)) {
                setSubtotal(newSubtotal);
                setTotal(newTotal+newSubtotal);
            }
        }
    }, [taxCategories])

    const validSchema = Yup.object().shape({
        budget: Yup.number().required("Please select a budget"),
        transactDate: Yup.date().required(),
        purchases: Yup.array().of(Yup.object().shape({
            purcCategory: Yup.number().required("Select a purchase category"),
            itemName: Yup.string().required("Enter an item name"),
            price: Yup.number().typeError("Price must be a number").positive("Enter a valid price").required("Please enter a price")
        })).min(1).required(),
        taxRates: Yup.array().of(Yup.bool())
    })
    
    const onFormSubmit = (values, actions) => {
        
        let url = `/transactions/${transaction.transact_id}/`;
        api.patch(url, {
            transact_date: dayjs(transactDate).format("YYYY-MM-DD"),
            user: user.user_id,
            budget: values.budget
        }).then(res => {
            // post transact tax
            let transact = res.data;

            let addTaxRatePromises = [];
            let deleteTaxRatePromises = [];
            console.log(values)
            values.taxRates.forEach((tax,index) => {
                let taxCtgy = taxCategories[index];
                let taxRate = initialTaxRates.find(taxRate => taxRate.taxId === taxCtgy.tax_id);
                if (!tax && taxRate) {
                    let url = `/transactionTax/${taxRate.prevTaxId}/`
                    deleteTaxRatePromises.push(api.delete(url, {data: {id: taxRate.prevTaxId}}).catch(err => console.log(err)));
                } else if (tax && taxRate === undefined) {
                    addTaxRatePromises.push(api.post('/transactionTax/', {
                        transact: transact.transact_id,
                        tax: taxCtgy.tax_id,
                        user: user.user_id,
                    }));
                }
            });

            let addTaxRateRes = Promise.all(addTaxRatePromises).catch(err => console.log(err));
            let deleteTaxRateRes = Promise.all(deleteTaxRatePromises).catch(err => console.log(err));
            
            // post purchases
            let patchPurchasePromises = [];
            let postPurchasePromises = [];
            let deletePurchasePromises = [];
            values.purchases.forEach(purchase => { //if purchase has data
                if ('purc_id' in purchase) {
                    let url = `/purchases/${purchase.purc_id}/`;
                    patchPurchasePromises.push(api.patch(url, {
                        item_name: purchase.itemName,
                        price: parseFloat(parseFloat(purchase.price).toFixed(2))*100,
                        transact: transact.transact_id,
                        purc_category: parseInt(purchase.purcCategory),
                    }));
                } else {
                    postPurchasePromises.push(api.post('/purchases/',{
                        item_name: purchase.itemName,
                        price: parseFloat(parseFloat(purchase.price).toFixed(2))*100,
                        transact: transact.transact_id,
                        purc_category: parseInt(purchase.purcCategory),
                    }));
                }
            });

            initialPurchases.forEach(initPurc => {
                if (values.purchases.findIndex(purc => purc.hasOwnProperty('purc_id') && purc.purc_id === initPurc.purc_id) === -1) {
                    let url = `/purchases/${initPurc.purc_id}/`
                    deletePurchasePromises.push(api.delete(url, {data: {purc_id: initPurc.purc_id}}));
                }
            })

            let patchPurchaseRes = Promise.all(patchPurchasePromises).catch(err => console.log(err));
            let postPurchaseRes = Promise.all(postPurchasePromises).catch(err => console.log(err));
            let deletePurchaseRes = Promise.all(deletePurchasePromises).catch(err => console.log(err));

            return Promise.all([addTaxRateRes, deleteTaxRateRes, patchPurchaseRes, postPurchaseRes, deletePurchaseRes]).then(
                () => {handleCloseEditForm(); fetchData();}
            ).catch(err => {console.log(err); alert("failed to submit form");})
            
        }).catch(err => {console.log(err); alert("Failed to submit"); })
        
        
    }

    // Components

    const calcTaxPrice = (taxRate) => {
        return "$" + (parseFloat((taxRate/100).toFixed(2)) * subtotal).toFixed(2);
    }
    
    return (
        <div>
            <Modal backdrop="static" show={showEditForm} onHide={handleCloseEditForm} contentClassName="transact-form-modal-content" dialogClassName="transact-form-modal-dialog">
            <Modal.Header>
                <Modal.Title>Edit transaction</Modal.Title>
                <CloseButton onClick={handleCloseEditForm} variant='white'/>
            </Modal.Header>
            <Modal.Body className="transaction-modal-body">
                <Formik
                    validationSchema={validSchema}
                    onSubmit={(values, actions) => onFormSubmit(values, actions)}
                    initialValues={{budget: transaction.budget, purchases: purchasePrices, transactDate: transactDate, taxRates: taxRates}}
                    innerRef={formRef}
                    enableReinitialize
                >
                    {({handleSubmit, handleBlur, values, errors, touched, setFieldValue, handleChange}) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <FloatingLabel label="Budget Name">
                                    {budgets.length > 0 ? // e.target value is string
                                        <Form.Select name="budget" onChange={selectedOption => {
                                            //let event = {target: {name:"budget", value: selectedOption}}; 
                                            handleChange("budget")(selectedOption.target.value)
                                            }}
                                            onBlur={()=>handleBlur({target: {name: "budget"}})}
                                            isValid={!errors.budget}
                                            isInvalid={!!errors.budget}
                                            defaultValue={values.budget}
                                            > 
                                            <option disabled value>Select a budget</option>
                                            {budgets.map((budget) => {
                                                if (dayjs(budget.end_time).diff(dayjs(), 'day') >= 0 || budget.budget_id===values.budget) {
                                                    return (<option key={budget.budget_id} value={budget.budget_id}>{budget.budget_name}
                                                    </option>);
                                                }
                                        })}
                                        </Form.Select> : <p><strong>No budgets found</strong></p>
                                    }
                                </FloatingLabel>
                                
                                {errors.budget ? <p className="text-danger">{errors.budget}</p> : null}
                            </Form.Group>

                            <Form.Group className="mb-3 form-section">
                                <Form.Label className="form-label-header">Transaction Date</Form.Label>
                                <DatePickerField name="transactDate" onChange={handleChange} onBlur={handleBlur} selected={transactDate}
                                    minDate={dayjs(currentBudget?.start_time).toDate()} maxDate={Date.now()}/>
                                {errors.transactDate ? <p className="text-danger">{errors.transactDate}</p> : null}
                            </Form.Group>
                            
                            <Form.Group className="mb-3 form-section">
                                <FieldArray name="purchases">
                                    {(arrayHelpers) => {

                                        return (
                                        <div>
                                        <Form.Group className="mb-3" as={Row}>
                                            <Col md='auto' className="form-label-header-section">
                                                <Form.Label className="form-label-header">Purchases</Form.Label>
                                            </Col>
                                            <Col md='auto'>
                                                <Button className="custom-btn" onClick={() => arrayHelpers.push('')}>Add</Button>
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row}>
                                            <Col xs={4} className="transact-form-purc-ctgy-header">Purchase Category</Col>
                                            <Col xs={4} className="transact-form-purc-ctgy-header">Item Name</Col>
                                            <Col xs={2} className="transact-form-purc-ctgy-header">Price</Col>
                                            <Col xs={2} className="transact-form-purc-ctgy-header" style={{'text-align':'left'}}>Delete</Col>
                                        </Form.Group>
                                        {values.purchases && values.purchases.length > 0 ? (
                                            <div>{values.purchases.map((purc, index)=> (
                                                <Row key={index} className="my-2">
                                                    <Col xs={4}>
                                                        <Form.Select name={`purchases.${index}.purcCategory`} onChange={selectedOption => 
                                                            {handleChange(`purchases.${index}.purcCategory`)(selectedOption.target.value);}}
                                                            isInvalid={errors.hasOwnProperty("purchases") && !!errors.purchases[index]?.purcCategory} 
                                                            isValid={(errors.hasOwnProperty("purchases") && !errors.purchases[index]?.purcCategory) || values.purchases[index].purcCategory !== ""}
                                                            onBlur={()=>handleBlur({target: {name: `purchases.${index}.purcCategory`}})}
                                                            value={purc.purcCategory}>
                                                            <option selected value="">Select a purchase category</option>
                                                            {purcCategories?.map((ctgy, index) => (<option key={index}
                                                                            value={`${ctgy.purc_category_id}`}>{ctgy.purc_category_name}</option>))}
                                                        </Form.Select>
                                                    </Col>
                                                    <Col xs={4}>
                                                        <Form.Control
                                                            isInvalid={errors.hasOwnProperty("purchases") && !!errors.purchases[index]?.itemName} 
                                                            isValid={(errors.hasOwnProperty("purchases") && !errors.purchases[index]?.itemName) || touched.hasOwnProperty("purchases") && touched.purchases[index]?.itemName}
                                                            value={purc.itemName} name={`purchases.${index}.itemName`} type="text" onChange={handleChange} onBlur={handleBlur}/>
                                                    </Col>
                                                    <Col xs={2}>
                                                        <Form.Control 
                                                            isInvalid={errors.hasOwnProperty("purchases") && !!errors.purchases[index]?.price} 
                                                            isValid={(errors.hasOwnProperty("purchases") && !errors.purchases[index]?.price) || touched.hasOwnProperty("purchases") && touched.purchases[index]?.price}
                                                            value={purc.price?.toFixed(2)} name={`purchases.${index}.price`} type="number" onChange={handleChange} onBlur={handleBlur}/>
                                                    </Col>
                                                    <Col xs={2}>
                                                        <Button className="custom-btn-negative" onClick={() => arrayHelpers.remove(index)}>X</Button>
                                                    </Col>
                                                    <Form.Control.Feedback>{errors.hasOwnProperty("purchases") && errors.purchases[index] ? "errors": null}</Form.Control.Feedback>
                                                </Row>
                                            ))}
                                            </div>
                                        ) : (null)}
                                        {typeof errors.purchases === 'string' ? <p>{errors.purchases}</p>: null}
                                        </div>
                                        );
                                    }}
                                </FieldArray>
                            </Form.Group>
                            
                            <Form.Group as={Row} className="my-3">   
                                <Col xs={{span: 1, offset: 7}}><p className="subtotal-text">Subtotal:</p></Col>
                                <Col md='auto'><p className="subtotal-text">${subtotal.toFixed(2)}</p></Col>
                            </Form.Group>

                            <Form.Group className="mb-3 form-section">
                                <Form.Label className="me-2 form-label-header">Tax</Form.Label>
                                <FieldArray name="taxRates">
                                {(arrayHelpers) => {
                                    return(
                                        <div>
                                        {taxCategories.length !== 0 ? 
                                            taxCategories.map((tax, index) => (
                                                <Row key={index}>
                                                    <Col xs={4}>
                                                        <p>{tax.tax_name} ({tax.tax_rate}%)</p>
                                                    </Col>
                                                    <Col xs={4}>
                                                        <Form.Check checked={values.taxRates[index]} name={`taxRates.${index}`} onChange={e => {setFieldValue(`taxRates.${index}`, e.target.checked); console.log(e)}} onBlur={handleBlur} 
                                                            feedback={errors.taxRates ? errors.taxRates[index] : null} feedbackType="invalid"/>
                                                    </Col>
                                                    <Col xs={2}>
                                                        <p>{values.taxRates && values.taxRates[index] ? calcTaxPrice(tax.tax_rate) : null}</p>
                                                    </Col>
                                                </Row>
                                            ))
                                        : <Row>No tax categories found</Row>
                                        }
                                        </div>
                                    )
                                }}
                                </FieldArray>
                            </Form.Group>
                            
                            <Form.Group as={Row} className="form-section">   
                                <Col xs={{span: 1, offset: 7}}><p className="total-text">Total:</p></Col>
                                <Col md='auto'><p className="total-text">${total.toFixed(2)}</p></Col>
                            </Form.Group>
                            
                            <Form.Group as={Row} className="form-section justify-content-end">  
                                <Col xs={{span: 'auto', offset: 10}}>
                                    <Button className="custom-btn" type="submit">
                                        Submit
                                    </Button>
                                </Col>
                            </Form.Group>
                            
                        </Form>
                    )}
                </Formik>
                
            </Modal.Body>
            </Modal> 
        </div>
        
    );
}

export default TransactEditForm;