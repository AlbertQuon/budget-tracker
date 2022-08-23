import { useState, useContext } from "react";
import { Modal, Form, Button, Row, Col, CloseButton, FloatingLabel } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";
import dayjs from "dayjs";
import { Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import { DatePickerField } from "../utils/DatePickerField";
import { useCallback } from "react";

function TransactForm({api, purcCategories, taxCategories, budgets, handleCloseForm, showForm, fetchData}) {

    // * do not put components into state, use state data to render component (due to inconsistencies)
    const {user} = useContext(AuthContext);

    const [subtotal, setSubtotal] = useState(0.00);
    const [total, setTotal] = useState(0.00);
    

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
        transactDate: Yup.date().required("Date of the transaction is required"),
        purchases: Yup.array().of(Yup.object().shape({
            purcCategory: Yup.number().required("Select a purchase category"),
            itemName: Yup.string().required("Enter an item name"),
            price: Yup.number().typeError("Price must be a number").positive("Enter a valid price").required("Please enter a price")
        })).min(1, "Need at least one purchase in this transaction").required("Need at least one purchase in this transaction"),
        taxRates: Yup.array().of(Yup.bool())
    })

    return (
    <Modal backdrop="static" show={showForm} onHide={handleCloseForm} contentClassName="transact-form-modal-content" dialogClassName="transact-form-modal-dialog">
        <Modal.Header className="transact-modal-header">
            <Modal.Title>Add transaction</Modal.Title>
            <CloseButton onClick={handleCloseForm} variant="white" />
        </Modal.Header>
        <Modal.Body className="transaction-modal-body">
            <Formik
                validationSchema={validSchema}
                onSubmit={(values, actions) => onFormSubmit(values, actions)}
                initialValues={{budget: budgets[0]?.budget_id, purchases: []}}
                validateOnChange={false}
                validateOnBlur={false}
                innerRef={formRef}
            >
                {({handleSubmit, handleChange, handleBlur, values, touched, setFieldValue, errors}) => (
                    <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <FloatingLabel label="Budget Name">
                                {budgets.length > 0 ? // e.target value is string
                                    <Form.Select 
                                        name="budget" 
                                        onChange={selectedOption => {
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
                            </FloatingLabel>
                            
                            {errors.budget ? <p className="text-danger">{errors.budget}</p> : null}
                        </Form.Group>
                        
                        <Form.Group className="mb-3 form-section">
                            <Form.Label className="form-label-header">Transaction Date</Form.Label>
                            <DatePickerField 
                                name="transactDate" onChange={handleChange} onBlur={handleBlur} 
                                minDate={dayjs(budgets.find(budget => budget.budget_id === values.budget).start_time).toDate()} 
                                maxDate={Date.now()}
                                />
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
                                            <Col md={4} className="transact-form-purc-ctgy-header">Purchase Category</Col>
                                            <Col md={4} className="transact-form-purc-ctgy-header">Item Name</Col>
                                            <Col md={2} className="transact-form-purc-ctgy-header">Price</Col>
                                            <Col md={2} className="transact-form-purc-ctgy-header" style={{'text-align':'left'}}>Delete</Col>
                                        </Form.Group>
                                        {values.purchases && values.purchases.length > 0 ? (
                                            <div>
                                                {values.purchases.map((purc, index)=> (
                                                    <Row key={index} className="my-2">
                                                        <Col md={4}>
                                                            <Form.Select name={`purchases.${index}.purcCategory`} 
                                                                onChange={selectedOption => {handleChange(`purchases.${index}.purcCategory`)(selectedOption.target.value);}}
                                                                isInvalid={errors.hasOwnProperty("purchases") && !!errors.purchases[index]?.purcCategory} 
                                                                isValid={(errors.hasOwnProperty("purchases") && !errors.purchases[index]?.purcCategory) 
                                                                            && (values.purchases[index].purcCategory !== "")}
                                                                onBlur={()=>handleBlur({target: {name: `purchases.${index}.purcCategory`}})}
                                                            >
                                                                <option selected value="">Select a purchase category</option>
                                                                {purcCategories?.map((ctgy, index) => (
                                                                    <option  
                                                                        key={index}
                                                                        value={`${ctgy.purc_category_id}`}
                                                                    >
                                                                            {ctgy.purc_category_name}
                                                                    </option>))
                                                                }
                                                            </Form.Select>
                                                        </Col>
                                                        <Col md={4}>
                                                            <Form.Control
                                                                isInvalid={errors.hasOwnProperty("purchases") && (!!errors.purchases[index]?.itemName)} 
                                                                isValid={(errors.hasOwnProperty("purchases") && !errors.purchases[index]?.itemName) 
                                                                    && (touched.hasOwnProperty("purchases") && touched.purchases[index]?.itemName)}
                                                                name={`purchases.${index}.itemName`} 
                                                                type="text" 
                                                                onChange={handleChange} 
                                                                onBlur={handleBlur}
                                                            />
                                                        </Col>
                                                        <Col md={2}>
                                                            <Form.Control 
                                                                isInvalid={errors.hasOwnProperty("purchases") && (!!errors.purchases[index]?.price)} 
                                                                isValid={(errors.hasOwnProperty("purchases") && !errors.purchases[index]?.price) 
                                                                    && (touched.hasOwnProperty("purchases") && touched.purchases[index]?.price)}
                                                                name={`purchases.${index}.price`} 
                                                                type="number" 
                                                                onChange={handleChange} 
                                                                onBlur={handleBlur}
                                                            />
                                                        </Col>
                                                        <Col md={2}>
                                                            <Button className="custom-btn-negative" onClick={() => arrayHelpers.remove(index)}>X</Button>
                                                        </Col>
                                                        <p className="text-danger">
                                                            {errors.hasOwnProperty("purchases") && errors.purchases[index] ? "Error in purchase": null}
                                                        </p>
                                                    </Row>
                                                ))}
                                            </div>
                                        ) : (null)}
                                        {typeof errors.purchases === 'string' ? <p className="text-danger">{errors.purchases}</p>: null}
                                    </div>
                                    );
                                }}
                            </FieldArray>
                        </Form.Group>
                        
                        <Form.Group as={Row} className="my-3">   
                            <Col md={{span: 1, offset: 7}}><p className="subtotal-text">Subtotal:</p></Col>
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
                                                <Col md={4}>
                                                    <p>{tax.tax_name} ({tax.tax_rate}%)</p>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Check name={`taxRates.${index}`} onChange={e => setFieldValue(`taxRates.${index}`, e.target.checked)} onBlur={handleBlur} 
                                                        feedback={errors.taxRates ? errors.taxRates[index] : null} feedbackType="invalid"/>
                                                </Col>
                                                <Col md={2}>
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
                            <Col md={{span: 1, offset: 7}}><p className="total-text">Total:</p></Col>
                            <Col md='auto'><p className="total-text">${total.toFixed(2)}</p></Col>
                        </Form.Group>
                            
                        <Form.Group as={Row} className="form-section justify-content-end">  
                            <Col md={{span: 'auto', offset: 10}}>
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
    );
}

export default TransactForm;