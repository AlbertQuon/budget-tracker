import { useState, useContext, useEffect, useRef } from "react";
import { Modal, Form, Card, Button, Row, Col, FormCheck } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";
import dayjs from "dayjs";
import { Formik, useField, FieldArray } from 'formik';
import * as Yup from 'yup';
import { DatePickerField } from "../utils/DatePickerField";
import { useCallback } from "react";

function TransactForm({api, purcCategories, taxCategories, budgets, handleCloseForm, showForm, fetchData}) {

    // * do not put components into state, use state data to render component (due to inconsistencies)
    const {user} = useContext(AuthContext);

    const [purchasePrices, setPurchasePrices] = useState([]);
    const [purchaseCounter, setPurchaseCounter] = useState(0);
    const [subtotal, setSubtotal] = useState(0.00);
    const [taxRates, setTaxRates] = useState([]);
    const [transactDate, setTransactDate] = useState(Date.now());
    const [total, setTotal] = useState(0.00);
    const [currentBudget, setCurrentBudget] = useState(null);
    const [formValues, setFormValues] = useState(null);
    
    const formRef = useCallback(node=> {
        if (node !== null) {
            //console.log(node.values)
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

    const onFormSubmit = (values, actions) => {

        let budgetValue = values.budget;
        let purchasesValues = values.purchases;
        let transactDateValue = values.transactDate;
        let taxRateValues = values.taxRates;
        
        api.post('/transactions/', {
            transact_date: dayjs(transactDateValue).format("YYYY-MM-DD"),
            user: user.user_id,
            budget: budgetValue
        }).then(res => {
            // post transact tax
            let transact = res.data;
            let taxRatePromises = [];
            let purchasesPromises = [];

            taxRateValues.forEach((tax, index) => {
                if (tax) {
                    taxRatePromises.push(api.post('/transactionTax/', {
                        transact: transact.transact_id,
                        tax: taxCategories[index].tax_id,
                        user: user.user_id,
                    }));
                }
            });
            // post purchases
            purchasesValues.forEach(purchase => {
                purchasesPromises.push(api.post('/purchases/',{
                    item_name: purchase.itemName,
                    price: parseFloat(parseFloat(purchase.price).toFixed(2))*100,
                    transact: transact.transact_id,
                    purc_category: parseInt(purchase.purcCategory),
                }));
            });
            let taxRateRes = Promise.all(taxRatePromises);
            let purchasesRes = Promise.all(purchasesPromises);
            return Promise.all([taxRateRes, purchasesRes]).then(() => {
                handleCloseForm();
                //actions.resetForm();
                fetchData();
            });
        }).catch(err => {console.log(err); alert("Failed to submit");})
        
    }

    const calcTaxPrice = (taxRate) => {
        return "$" + (parseFloat((taxRate/100).toFixed(2)) * subtotal).toFixed(2);
    }
    
    const validSchema = Yup.object().shape({
        budget: Yup.number().required("Please select a budget"),
        transactDate: Yup.date().required(),
        purchases: Yup.array().of(Yup.object().shape({
            purcCategory: Yup.number().required("Select a purchase category"),
            itemName: Yup.string().required("Enter an item name"),
            price: Yup.number().positive("Enter a valid price").required("Please enter a price")
        })).min(1).required(),
        taxRates: Yup.array().of(Yup.bool())
    })

    return (
    <Modal backdrop="static" show={showForm} onHide={handleCloseForm} contentClassName="transactForm-modal-content" dialogClassName="transactForm-modal-dialog">
        <Modal.Header closeButton>
            <Modal.Title>Add transaction</Modal.Title>
        </Modal.Header>
        <Modal.Body className="m-3">
            <Formik
                validationSchema={validSchema}
                onSubmit={(values, actions) => onFormSubmit(values, actions)}
                initialValues={{budget: budgets[0]?.budget_id, purchases: []}}
                innerRef={formRef}
            >
            {({handleSubmit, handleChange, handleBlur, values, touched, setFieldValue, errors}) => (
                <Form noValidate onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Label>Budget</Form.Label>
                    {budgets.length > 0 ? // e.target value is string
                        <Form.Select name="budget" onChange={selectedOption => {
                            let event = {target: {name:"budget", value: parseInt(selectedOption.target.value)}}; 
                            handleChange(event);
                            //console.log(selectedOption);
                            //handleChange("budget")(parseInt(selectedOption.target.value))
                            }}
                            onBlur={()=>handleBlur({target: {name: "budget"}})}
                            isValid={!errors.budget}
                            isInvalid={!!errors.budget}
                            > 
                            <option disabled value>Select a budget</option>
                            {budgets.map((budget) => {
                                if (dayjs(budget.end_time).diff(dayjs(), 'day') >= 0) {
                                    return (<option key={budget.budget_id} value={budget.budget_id}>{budget.budget_name}
                                    </option>);
                                }
                        })}
                        </Form.Select> : <p><strong>No budgets found</strong></p>
                    }
                    {errors.budget ? <p className="text-danger">{errors.budget}</p> : null}
                </Form.Group>
                <DatePickerField name="transactDate" onChange={handleChange} onBlur={handleBlur} 
                    minDate={dayjs(budgets.find(budget => budget.budget_id === values.budget).start_time).toDate()} maxDate={Date.now()}/>
                {errors.transactDate ? <p className="text-danger">{errors.transactDate}</p> : null}
                <FieldArray name="purchases">
                    {(arrayHelpers) => {
                        return (
                        <div>
                        <Form.Group className="mb-3">
                            <Form.Label className="me-2">Purchases</Form.Label>
                            <Button onClick={() => arrayHelpers.push('')}>Add</Button>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Col xs={4}>Purchase Category</Col>
                            <Col xs={4}>Item Name</Col>
                            <Col xs={2}>Price</Col>
                            <Col xs={2}>Delete</Col>
                        </Form.Group>
                            {values.purchases && values.purchases.length > 0 ? (
                                <div>{values.purchases.map((purc, index)=> (
                                <Row key={index}>
                                    <Col xs={4}>
                                    <Form.Select name={`purchases.${index}.purcCategory`} onChange={selectedOption => 
                                        {handleChange(`purchases.${index}.purcCategory`)(selectedOption.target.value);}}
                                        isInvalid={errors.hasOwnProperty("purchases") && !!errors.purchases[index]?.purcCategory} 
                                        isValid={(errors.hasOwnProperty("purchases") && !errors.purchases[index]?.purcCategory) || values.purchases[index].purcCategory !== ""}
                                        onBlur={()=>handleBlur({target: {name: `purchases.${index}.purcCategory`}})}>
                                        <option selected value="">Select a purchase category</option>
                                        {purcCategories?.map((ctgy, index) => (<option key={index}
                                                        value={`${ctgy.purc_category_id}`}>{ctgy.purc_category_name}</option>))}
                                    </Form.Select>
                                    </Col>
                                    <Col xs={4}><Form.Control
                                        isInvalid={errors.hasOwnProperty("purchases") && !!errors.purchases[index]?.itemName} 
                                        isValid={(errors.hasOwnProperty("purchases") && !errors.purchases[index]?.itemName) || touched.hasOwnProperty("purchases") && touched.purchases[index]?.itemName}
                                        name={`purchases.${index}.itemName`} type="text" onChange={handleChange} onBlur={handleBlur}/></Col>
                                    <Col xs={2}><Form.Control 
                                        isInvalid={errors.hasOwnProperty("purchases") && !!errors.purchases[index]?.price} 
                                        isValid={(errors.hasOwnProperty("purchases") && !errors.purchases[index]?.price) || touched.hasOwnProperty("purchases") && touched.purchases[index]?.price}
                                        name={`purchases.${index}.price`} type="number" onChange={handleChange} onBlur={handleBlur}/></Col>
                                    <Col xs={2}><Button onClick={() => arrayHelpers.remove(index)}>-</Button></Col>
                                    <Form.Control.Feedback>{errors.hasOwnProperty("purchases") && errors.purchases[index] ? "errors": null}</Form.Control.Feedback>
                                </Row>
                            ))}</div>
                            ) : (null)}
                            {typeof errors.purchases === 'string' ? <p>{errors.purchases}</p>: null}
                        </div>
                        );
                    }}
                </FieldArray>
                <Form.Group as={Row} className="my-3">   
                    <Col xs={10}><p>Subtotal:</p></Col>
                    <Col xs={2}><p>${subtotal.toFixed(2)}</p></Col>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label className="me-2">Tax</Form.Label>
                    <FieldArray name="taxRates">
                    {(arrayHelpers) => {
                        return(
                            <div>
                            {taxCategories.length !== 0 ? 
                                taxCategories.map((tax, index) => (
                                    <Row key={index}>
                                    <Col xs={8}>
                                        <p>{tax.tax_name} ({tax.tax_rate}%)</p>
                                    </Col>
                                    <Col xs={2}>
                                        <Form.Check name={`taxRates.${index}`} onChange={e => setFieldValue(`taxRates.${index}`, e.target.checked)} onBlur={handleBlur} 
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
                
                <Row>   
                    <Col xs={10}><p>Total:</p></Col>
                    <Col xs={2}><strong>${total.toFixed(2)}</strong></Col>
                </Row>
                
                
                <Button variant="primary" type="submit">
                    Submit
                </Button>
            </Form>
            )}
            
            </Formik>
            
        </Modal.Body>
    </Modal>
    );
}

export default TransactForm;