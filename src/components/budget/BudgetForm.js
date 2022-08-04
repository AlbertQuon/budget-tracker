import { useContext, useEffect, useState } from "react";
import { Modal, Row, Form, Card, Button, Spinner, Alert } from "react-bootstrap";
import { Formik, useField, FieldArray } from 'formik';
import * as Yup from 'yup';
import AuthContext from "../auth/AuthContext";
import dayjs from "dayjs";
import { DatePickerField } from "../utils/DatePickerField";

function BudgetForm({api, budgets, setBudgets, handleCloseForm, showForm, fetchData, purcCategories}) {
    const {user} = useContext(AuthContext);
    const [error, setError] = useState("");

    const handleFormSubmit = (values, actions) => {
        api.post('/budget/', {
            budget_name: values.budgetName,
            start_time: dayjs(Date.now()).format("YYYY-MM-DD"),
            end_time: dayjs(values.budgetDate).format("YYYY-MM-DD"),
            user: user.user_id,
        }).then(res=> {
            let budgetPromises = [];
            for (let i = 0; i < purcCategories.length; i++) {
                budgetPromises.push(api.post('/budgetLimits/', {
                    budget: res.data.budget_id,
                    purc_category: purcCategories[i].purc_category_id,
                    spend_limit: parseFloat(parseFloat(values.budgetLimits[i]).toFixed(2))*100,
                }));
            }
            setBudgets([...budgets, {
                budget_name: res.data.budget_name,
                budget_id: res.data.budget_id, 
                start_time: res.data.start_time,
                end_time: res.data.end_time
            }]);

            return Promise.all(budgetPromises).then(() =>{
                actions.resetForm();
                handleCloseForm();
                fetchData();
            });
            
        }).catch(err => {
            console.log(err);
            setError(err);
        });
        
    }

    const validSchema = Yup.object().shape({
        budgetName: Yup.string().required("Name required"),
        budgetDate: Yup.string().required("Date required"),
        budgetLimits: Yup.array().of(Yup.number().required().positive()).required()
    });

    // DO NOT FORGET HANDLE CHANGE ATTRIBUTE
    /*<Form.Control type="text" onKeyPress={(e) => !/^\d*(\.\d{0,2})?$/.test(e.key) && e.preventDefault()} placeholder="Spend limit"/>*/
    return ( 
        <Modal backdrop="static" show={showForm} onHide={handleCloseForm} dialogClassName="modal-budget" contentClassName="dark-modal-content" >
            <Modal.Header closeButton>Add budget</Modal.Header>
            <Modal.Body>
            <Card bg='dark' text='white'>
                <Card.Body>
                <Formik
                    validationSchema={validSchema}
                    initialValues={{budgetDate: Date.now(), budgetLimits: Array(purcCategories.length).fill(0), budgetName: ""}}
                    onSubmit={(values, actions) => handleFormSubmit(values, actions)}
                >
                    {({handleSubmit, handleChange, handleBlur, values, touched, isValid, errors, isSubmitting}) => (
                        <Form noValidate onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Enter a name for the budget</Form.Label>
                            <Form.Control name="budgetName" isValid={touched.budgetName && !errors.budgetName} 
                                onChange={handleChange} value={values.budgetName} isInvalid={!!errors.budgetName}
                                type="text" placeholder="Enter a name"></Form.Control>
                            <Form.Control.Feedback type="invalid">{errors.budgetName}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Select budget end date</Form.Label>
                            <DatePickerField onChange={handleChange} onBlur={handleBlur} name="budgetDate"/>
                            {errors.budgetDate? <p className="text-danger">{errors.budgetDate}</p> : null}
                        </Form.Group>
                        <Form.Group className="py-3">
                            <Form.Label><strong>Purchase limits</strong></Form.Label>
                            <FieldArray name="budgetLimits">
                            {(arrayHelpers) => {
                                return (
                                <div>
                                {purcCategories.length !== 0 ? 
                                purcCategories.map((ctgy, index) => (
                                    <Form.Group key={index}>
                                        <Form.Label>{ctgy.purc_category_name}</Form.Label>
                                        <Form.Control onBlur={handleBlur} onChange={handleChange} 
                                        isInvalid={errors.hasOwnProperty("budgetLimits") && !!errors.budgetLimits[index]} 
                                        isValid={errors.hasOwnProperty("budgetLimits") && touched.hasOwnProperty("budgetLimits") && touched.budgetLimits[index] && !errors.budgetLimits[index]}
                                        name={`budgetLimits.${index}`} type="number"/>
                                        {errors.budgetLimits ? <Form.Control.Feedback type="invalid">{errors.budgetLimits[index]}</Form.Control.Feedback> : null}
                                    </Form.Group>
                                    )) : <p><em>No purchase categories set</em></p>
                                }
                                </div>
                                );
                            }}
                            </FieldArray>
                            
                        </Form.Group>

                        <Button variant="primary" type="submit">
                        {isSubmitting ? <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner> : "Submit"}
                        </Button>
                        
                        </Form>
                    )}
                </Formik>
                
                </Card.Body>
                {error.length > 0 ? <Alert variant="danger">{error}</Alert>: null}
            </Card>
            </Modal.Body>    
                    <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseForm}>
                        Close
                    </Button>
                    </Modal.Footer>
            </Modal>
     );
}

export default BudgetForm;