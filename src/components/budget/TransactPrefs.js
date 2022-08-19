import { Container, Form, Button, Row, Modal, Col, InputGroup, CloseButton } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import useAxios from "../utils/useAxios"
import AuthContext from "../auth/AuthContext";


function TransactPrefs({purcCategories, setPurcCategories}) {
    const {user} = useContext(AuthContext);
    //const [purcCategories, setPurcCategories] = useState([]);
    const [taxCategories, setTaxCategories] = useState([]);
    const [showTaxDeleteBox, setShowTaxDeleteBox] = useState(false);
    const [showPurcDeleteBox, setShowPurcDeleteBox] = useState(false);
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
    const onPurcCtgyPrefAdd = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        api.post('/purchasecategory/', {
            purc_category_name:  form[0].value,
            user: user.user_id
        }).then(res => {
            //console.log(res.data);
            setPurcCategories([...purcCategories, res.data]);
            form.reset();
        }).catch(err => {
            console.log(err)
        });
    }

    const onTaxCtgyPrefAdd = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        api.post('/taxcategory/', {
            tax_name:  form[0].value,
            user: user.user_id,
            tax_rate: form[1].value
        }).then(res => {
            setTaxCategories([...taxCategories, res.data]);
            form.reset();
        }).catch(err => {
            console.log(err)
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

    
    return ( 
    <Container>
        {ConfirmPurcDeleteBox()}
        {ConfirmTaxDeleteBox()}
        <Row className="my-4">
            <h3>Purchase Categories</h3>
            <Col>
                <Form onSubmit={onPurcCtgyPrefAdd}>
                    <Form.Group className="mb-3">
                        <Form.Label>Add purchase category</Form.Label>
                        <Form.Control type="text" placeholder="Enter a purchase category" />
                        <Form.Text className="text-white">
                        Add categories to sort your purchases and budget limits
                        </Form.Text>
                    </Form.Group>
                    <Button className="custom-btn"  type="submit">
                        Add category
                    </Button>
                </Form>
            </Col>
            <Col>
                <Form onSubmit={(e) => {setShowPurcDeleteBox(true);setFormEvent(e);}}>
                    <Form.Group className="mb-2">
                        <Form.Label>Delete purchase category</Form.Label>
                        <Form.Select>
                            {purcCategories.map((ctgy) => (
                                <option key={ctgy.purc_category_id}
                                value={`${ctgy.purc_category_id}`}>{ctgy.purc_category_name}</option>
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
                <Form onSubmit={onTaxCtgyPrefAdd}>
                    <Row>
                        <Col>
                            <Form.Group className="mb-3">
                                <Form.Label>Tax Category Name</Form.Label>
                                <Form.Control type="text" placeholder="Enter a tax category" />
                                <Form.Text className="text-white">
                                Add taxes to keep track within your purchases
                                </Form.Text>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md='auto'>
                            <Form.Group className="mb-3">
                                <InputGroup>
                                    <Form.Control type="text" onKeyPress={(e) => !/^\d*(\.\d{0,2})?$/.test(e.key) && e.preventDefault()} placeholder="Tax rate" />
                                    <InputGroup.Text>%</InputGroup.Text>
                                </InputGroup>  
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    
                    <Button className="custom-btn" type="submit">
                        Add tax category
                    </Button>
                </Form>
            </Col>
            <Col>
                <Form onSubmit={(e) => {setShowTaxDeleteBox(true);setFormEvent(e)}}>
                    <Form.Group className="mb-2">
                        <Form.Label>Delete tax category</Form.Label>
                        <Form.Select>
                            {taxCategories.map((tax) => (
                                <option key={tax.tax_id}
                                value={`${tax.tax_id}`}>{tax.tax_name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                    <Button className="custom-btn-negative" type="submit">
                        Delete tax category
                    </Button>
                </Form>
            </Col>
        </Row>
    </Container> );
}

export default TransactPrefs;