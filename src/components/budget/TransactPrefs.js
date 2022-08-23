import { Container, Form, Button, Row, Modal, Col, InputGroup, CloseButton, ToastContainer, Toast } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import useAxios from "../utils/useAxios"
import AuthContext from "../auth/AuthContext";
import { Formik } from 'formik';
import * as Yup from 'yup';

function TransactPrefs({purcCategories, setPurcCategories}) {
    const {user} = useContext(AuthContext);
    //const [purcCategories, setPurcCategories] = useState([]);
    const [taxCategories, setTaxCategories] = useState([]);
    const [showTaxDeleteBox, setShowTaxDeleteBox] = useState(false);
    const [showPurcDeleteBox, setShowPurcDeleteBox] = useState(false);
    const [toastFeedback, setToastFeedback] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [formEvent, setFormEvent] = useState({});
    const api = useAxios();
    
    useEffect(() => {
        getTaxCategories();
    }, [])

    function getTaxCategories() {
        api.get('/taxcategory/')
        .then(res => {
            setTaxCategories(res.data);
        }).catch( err=>{
            console.log(err);
        });
    }

    // POST functions
    const onPurcFormSubmit = (values, actions) => {
        api.post('/purchasecategory/', {
            purc_category_name: values.purcCtgyName,
            user: user.user_id
        }).then(res => {
            //console.log(res.data);
            setPurcCategories([...purcCategories, res.data]);
            actions.resetForm();
            setToastFeedback("Purchase Category Added!");
            setShowToast(true);
        }).catch(err => {
            console.log(err);
            setToastFeedback("Error occurred");
            setShowToast(true);
        });
    }

    const onTaxFormSubmit = (values, actions) => {
        api.post('/taxcategory/', {
            tax_name:  values.taxName,
            user: user.user_id,
            tax_rate: values.taxRate
        }).then(res => {
            setTaxCategories([...taxCategories, res.data]);
            actions.resetForm();
            setToastFeedback("Tax Category Added!");
            setShowToast(true);
        }).catch(err => {
            console.log(err);
            setToastFeedback("Error occurred");
            setShowToast(true);
        });
    }

    // DELETE functions
    const onPurcCtgyDelete = (event) => {
        event.preventDefault();
        const form = event.target;
        const url = `/purchasecategory/${form[0].value}/`
        api.delete(url, {
            data: { purc_category_id: form[0].value }
        }).then(() => {
            setPurcCategories(purcCategories.filter(ctgy => ctgy.purc_category_id.toString() !== form[0].value));
            setShowPurcDeleteBox(false);
            form.reset();
            setToastFeedback("Purchase Category Deleted!");
            setShowToast(true);
        }).catch((err) => {
            setToastFeedback("Error occurred");
            setShowToast(true);
        });
    }

    const onTaxCtgyDelete = (event) => {
        event.preventDefault();
        const form = event.target;
        const url = `/taxcategory/${form[0].value}/`
        api.delete(url, {
            data: { tax_id: form[0].value }
        }).then(() => {
            setTaxCategories(taxCategories.filter(tax => tax.tax_id.toString() !== form[0].value));
            setShowTaxDeleteBox(false);
            form.reset();
            setToastFeedback("Tax Category Deleted!");
            setShowToast(true);
        }).catch((err) => {
            setToastFeedback("Error occurred");
            setShowToast(true);
        });
    }

    const ConfirmPurcDeleteBox = () => {
        return ( 
        <Modal id="confirmDeleteBox" backdrop="static" show={showPurcDeleteBox} contentClassName="dark-modal-content" onHide={() => setShowPurcDeleteBox(false)}>
            <Modal.Header>
                <Modal.Title>Confirmation</Modal.Title>
                <CloseButton variant="white" onClick={() => setShowPurcDeleteBox(false)} />
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this purchase category?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button className="custom-btn" onClick={()=>{setFormEvent({});setShowPurcDeleteBox(false);}} >No</Button>
                <Button className="custom-btn-negative" onClick={()=>{onPurcCtgyDelete(formEvent);setShowPurcDeleteBox(false);}}>Confirm</Button>
            </Modal.Footer>
        </Modal> );
    }  

    const ConfirmTaxDeleteBox = () => {
        return ( 
        <Modal id="confirmDeleteBox" backdrop="static" show={showTaxDeleteBox} contentClassName="dark-modal-content" onHide={() => setShowTaxDeleteBox(false)}>
            <Modal.Header>
                <Modal.Title>Confirmation</Modal.Title>
                <CloseButton onClick={() => setShowTaxDeleteBox(false)} variant="white" />
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this tax category?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button className="custom-btn" onClick={()=>{setFormEvent({});setShowTaxDeleteBox(false);}} >No</Button>
                <Button className="custom-btn-negative" onClick={()=>{onTaxCtgyDelete(formEvent);setShowTaxDeleteBox(false);}}>Confirm</Button>
            </Modal.Footer>
        </Modal> );
    }  

    const validPurcSchema = Yup.object().shape({
        purcCtgyName: Yup.string().required("Please enter a purchase category name")
    });

    const validTaxSchema = Yup.object().shape({
        taxName: Yup.string().required("Please enter a tax category name"),
        taxRate: Yup.number()
            .typeError("Tax rate must be a number")
            .required("Please enter a tax rate")
            .max(100, "Please enter a valid tax rate")
            .positive("Must be greater than 0")
    });
    
    return ( 
    <Container>
        {ConfirmPurcDeleteBox()}
        {ConfirmTaxDeleteBox()}
        <Row className="my-4">
            <h3>Purchase Categories</h3>
            <Col>
                <Formik
                    validationSchema={validPurcSchema}
                    onSubmit={(values, actions) => onPurcFormSubmit(values, actions)}
                    initialValues={{purcCtgyName: ""}}
                >
                    {({handleSubmit, handleChange, handleBlur, values, touched, errors}) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <Form.Group className="mb-3">
                                <Form.Label>Add purchase category</Form.Label>
                                <Form.Control 
                                    name="purcCtgyName" 
                                    type="text" 
                                    isValid={touched.purcCtgyName && !errors.purcCtgyName}
                                    isInvalid={!!errors.purcCtgyName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values?.purcCtgyName}
                                />
                                {typeof errors.purcCtgyName === 'string' ? 
                                    <Form.Control.Feedback type="invalid">
                                        {errors.purcCtgyName}
                                    </Form.Control.Feedback> 
                                : null}
                                <Form.Text className="text-white">
                                    Add categories to sort your purchases and budget limits
                                </Form.Text>
                            </Form.Group>
                            <Button className="custom-btn" type="submit">
                                Add
                            </Button>
                        </Form>        
                    )}
                </Formik>
            </Col>
            <Col>
                <Form onSubmit={(e) => {setShowPurcDeleteBox(true); setFormEvent(e);}}>
                    <Form.Group className="mb-2">
                        <Form.Label>Delete purchase category</Form.Label>
                        <Form.Select>
                            {purcCategories.map((ctgy) => (
                                <option 
                                    key={ctgy.purc_category_id}
                                    value={`${ctgy.purc_category_id}`}
                                >
                                    {ctgy.purc_category_name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button className="custom-btn-negative" type="submit">
                            Delete purchase category
                    </Button>
                </Form>
            </Col>
        </Row>
        <Row className="my-4 border-top pt-3">
            <h3>Tax Categories</h3>
            <Col>
                <Formik
                    validationSchema={validTaxSchema}
                    onSubmit={(values, actions) => onTaxFormSubmit(values, actions)}
                    initialValues={{ taxName: "", taxRate: 0}}
                >
                    {({handleSubmit, handleChange, handleBlur, values, touched, errors}) => (
                        <Form noValidate onSubmit={handleSubmit}>
                            <Row>
                                <Col>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Tax Category Name</Form.Label>
                                        <Form.Control 
                                            name="taxName" type="text"
                                            isValid={touched.taxName && !errors.taxName}
                                            isInvalid={!!errors.taxName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values?.taxName}
                                        />
                                        <Form.Text className="text-white">
                                            Add taxes to keep track within your purchases
                                        </Form.Text>
                                        {typeof errors.taxName === 'string' ? <Form.Control.Feedback type="invalid">{errors.taxName}</Form.Control.Feedback> : null}
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Form.Group className="mb-3">
                                <Col md='auto'>
                                    <InputGroup>
                                        <Form.Control 
                                            name="taxRate" type="text" 
                                            onKeyPress={(e) => !/^\d*(\.\d{0,2})?$/.test(e.key) && e.preventDefault()} 
                                            placeholder="Tax rate"
                                            isValid={touched.taxRate && !errors.taxRate}
                                            isInvalid={!!errors.taxRate}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            value={values?.taxRate}
                                        />
                                        <InputGroup.Text id="percentage-input-group">%</InputGroup.Text>
                                        {typeof errors.taxRate === 'string' ? <Form.Control.Feedback type="invalid">{errors.taxRate}</Form.Control.Feedback> : null}
                                    </InputGroup> 
                                    </Col>
                                </Form.Group>
                            </Row>
                            
                            <Button className="custom-btn" type="submit">
                                Add
                            </Button>
                        </Form>
                    )}
                </Formik>
            </Col>
            <Col>
                <Form onSubmit={(e) => {setShowTaxDeleteBox(true);setFormEvent(e)}}>
                    <Form.Group className="mb-2">
                        <Form.Label>Delete tax category</Form.Label>
                        <Form.Select>
                            {taxCategories.map((tax) => (
                                <option 
                                    key={tax.tax_id}
                                    value={`${tax.tax_id}`}
                                >
                                    {tax.tax_name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button className="custom-btn-negative" type="submit">
                        Delete tax category
                    </Button>
                </Form>
            </Col>
        </Row>
        <Row>
            <Col>
                <ToastContainer position='bottom-center'>
                    <Toast className="mb-5" bg='dark' show={showToast} onClose={()=>setShowToast(false)} delay={6000} autohide>
                        <Toast.Header>
                            <strong className="me-auto">Notification</strong>
                        </Toast.Header>
                        <Toast.Body>{toastFeedback}</Toast.Body>
                    </Toast>
                </ToastContainer>
            </Col>
        </Row>
    </Container> );
}

export default TransactPrefs;