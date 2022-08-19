import { useContext, useCallback, useState } from "react";
import { Modal, Row, Form, Card, Button, Spinner, Alert, Col, CloseButton, FloatingLabel } from "react-bootstrap";
import { Formik, useField, FieldArray } from 'formik';
import * as Yup from 'yup';
import AuthContext from "../auth/AuthContext";
import dayjs from "dayjs";
import { DatePickerField } from "../utils/DatePickerField";

function BudgetForm({api, budgets, setBudgets, handleCloseForm, showForm, fetchData, purcCategories}) {
    const {user} = useContext(AuthContext);
    const [error, setError] = useState("");
    const [totalIncome, setTotalIncome] = useState(0);

    const formRef = useCallback(node=> {
        if (node !== null) {
            let newTotal = parseFloat(0.00);
            let incomesValues = node.values.budgetIncomes ? node.values.budgetIncomes : [];
            incomesValues.forEach(income => {
                newTotal += income.incomeAmount ? income.incomeAmount : 0;
            })
            setTotalIncome(newTotal);
        }
    }, [])

    const handleFormSubmit = (values, actions) => {
        api.post('/budget/', {
            budget_name: values.budgetName,
            start_time: values.budgetStartDate && dayjs(Date.now()).diff(values.budgetStartDate) !== 0 ? 
                dayjs(values.budgetStartDate).format("YYYY-MM-DD") : dayjs(Date.now()).format("YYYY-MM-DD"),
            end_time: dayjs(values.budgetEndDate).format("YYYY-MM-DD"),
            user: user.user_id,
        }).then(res=> {
            let budgetPromises = [];
            let incomesPromises = [];
            for (let i = 0; i < purcCategories.length; i++) {
                budgetPromises.push(api.post('/budgetLimits/', {
                    budget: res.data.budget_id,
                    purc_category: purcCategories[i].purc_category_id,
                    spend_limit: parseFloat(parseFloat(values.budgetLimits[i]).toFixed(2))*100,
                }));
            }
            
            values.budgetIncomes.forEach(income => (
                incomesPromises.push(api.post('/budgetIncomes/', {
                    budget: res.data.budget_id,
                    income_name: income.incomeName,
                    income_amount: parseFloat(parseFloat(income.incomeAmount).toFixed(2))*100
                }))
            ));

            setBudgets([...budgets, {
                budget_name: res.data.budget_name,
                budget_id: res.data.budget_id, 
                start_time: res.data.start_time,
                end_time: res.data.end_time
            }]);

            return Promise.all(budgetPromises).then(() =>{
                //actions.resetForm();
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
        budgetIncomes: Yup.array().of(Yup.object().shape({
            incomeName: Yup.string().required("Please add a name for the income"),
            incomeAmount: Yup.number("Please enter a number").required().moreThan(0, "Income can not be negative").min(0)
        })).min(1, "One income source required"),
        budgetStartDate: Yup.date("Please enter a date").nullable(),
        budgetEndDate: Yup.date().required("Date required"),
        budgetLimits: Yup.array().of(Yup.number("Spend limit must be a number").required("Spend limit is required").positive("Spend limit should be positive")).required()
    });

    // DO NOT FORGET HANDLE CHANGE ATTRIBUTE
    /*<Form.Control type="text" onKeyPress={(e) => !/^\d*(\.\d{0,2})?$/.test(e.key) && e.preventDefault()} placeholder="Spend limit"/>*/
    return ( 
        <Modal backdrop="static" show={showForm} onHide={handleCloseForm} dialogClassName="modal-budget" contentClassName="dark-modal-content" >
            <Modal.Header className="modal-budget-header">
                <Modal.Title>Add Budget</Modal.Title>
                <CloseButton onClick={handleCloseForm} variant='white'/>
            </Modal.Header>
                <Modal.Body>
                    <Card className="form-card">
                        <Card.Body>
                            <Formik
                                validationSchema={validSchema}
                                initialValues={{budgetStartDate: null, budgetIncomes: [{incomeName: "", incomeAmount: 0}], budgetEndDate: dayjs().toDate(), budgetLimits: Array(purcCategories.length).fill(0), budgetName: ""}}
                                onSubmit={(values, actions) => handleFormSubmit(values, actions)}
                                innerRef={formRef}
                            >
                                {({handleSubmit, handleChange, handleBlur, values, touched, isValid, errors, isSubmitting}) => (
                                    <Form noValidate onSubmit={handleSubmit}>
                                        <Form.Group className="mb-3">
                                            <FloatingLabel className="input-label" label="Budget Name">
                                            <Form.Control name="budgetName" isValid={touched.budgetName && !errors.budgetName} 
                                                onChange={handleChange} value={values.budgetName} isInvalid={!!errors.budgetName}
                                                type="text" placeholder="Enter a name"></Form.Control>
                                            </FloatingLabel>
                                            <Form.Control.Feedback type="invalid">{errors.budgetName}</Form.Control.Feedback>
                                        </Form.Group>
                                        
                                        <FieldArray name="budgetIncomes" className="my-3">
                                        {(arrayHelpers) => {
                                            return (
                                                <Form.Group className="my-3 form-section" as={Row}>
                                                    <Row className="mb-3 align-items-center"> 
                                                        <Col md='auto'><Form.Label className="form-label-header">Predicted Incomes</Form.Label></Col>
                                                        <Col md='auto'><Button className="custom-btn" onClick={() => arrayHelpers.push('')}>Add</Button></Col>    
                                                    </Row>
                                                    <Row className="mb-3">
                                                        <Col>
                                                            {values.budgetIncomes && values.budgetIncomes.length > 0 ? 
                                                            values.budgetIncomes.map((budgetIncome, index) => (
                                                                <Form.Group key={index} as={Row}>
                                                                    <Form.Label></Form.Label>
                                                                    <Col>
                                                                        <Form.Control type="text"
                                                                            name={`budgetIncomes.${index}.incomeName`} placeholder="Income Name"
                                                                            onChange={handleChange} onBlur={handleBlur}
                                                                            isValid={(errors.hasOwnProperty("budgetIncomes") && !errors.budgetIncomes[index]?.incomeName) 
                                                                                || touched.hasOwnProperty("budgetIncomes") && touched.budgetIncomes[index]?.incomeName}
                                                                            isInvalid={errors.hasOwnProperty("budgetIncomes") && !!errors.budgetIncomes[index]?.incomeName} 
                                                                            />
                                                                    </Col>
                                                                    <Col xs={4}>
                                                                        <Form.Control type="number"
                                                                            name={`budgetIncomes.${index}.incomeAmount`} placeholder="Income Amount"
                                                                            onChange={handleChange} onBlur={handleBlur}
                                                                            isValid={(errors.hasOwnProperty("budgetIncomes") && !errors.budgetIncomes[index]?.incomeAmount) 
                                                                                || touched.hasOwnProperty("budgetIncomes") && touched.budgetIncomes[index]?.incomeAmount}
                                                                            isInvalid={errors.hasOwnProperty("budgetIncomes") && !!errors.budgetIncomes[index]?.incomeAmount} 
                                                                            value={values.budgetIncomes[index].incomeAmount}
                                                                            />
                                                                    </Col>
                                                                    <Col md='auto'>
                                                                        <Button className="custom-btn-negative" onClick={() => arrayHelpers.remove(index)}>X</Button>
                                                                    </Col>
                                                                </Form.Group>
                                                            )) : <p><em>No incomes set</em></p>
                                                            }
                                                        </Col>
                                                    </Row>
                                                    <Row className="mb-3 align-items-center">
                                                        <Col xs={7}><Form.Text className="form-subtext">Total predicted income</Form.Text></Col>
                                                        <Col md='auto'><Form.Text className="form-subtext">${totalIncome.toFixed(2)}</Form.Text></Col>
                                                    </Row>
                                                </Form.Group>
                                            );
                                        }}
                                        </FieldArray>
                                        <Form.Group className="mb-3 form-section align-items-center" as={Row}>
                                            <Form.Label className="form-label-header">Budget Dates</Form.Label>
                                            <Col>
                                                <Form.Label>End Date</Form.Label>
                                                <DatePickerField minDate={Date.now()} onChange={handleChange} onBlur={handleBlur} name="budgetEndDate"/>
                                                {errors.budgetEndDate? <p className="text-danger">{errors.budgetEndDate}</p> : null}
                                            </Col>
                                            <Col>
                                                <Form.Label>Start Date (optional)</Form.Label>
                                                <DatePickerField onChange={handleChange} onBlur={handleBlur} name="budgetStartDate"/>
                                                {errors.budgetStartDate? <p className="text-danger">{errors.budgetStartDate}</p> : null}
                                            </Col>
                                        </Form.Group>
                                        <Form.Group className="py-3 form-section" as={Row}>
                                            <Form.Label className="form-label-header">Purchase limits</Form.Label>
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

                                        <Button className="custom-btn" type="submit">
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
                    <Button className="custom-btn-negative" onClick={handleCloseForm}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
     );
}

export default BudgetForm;