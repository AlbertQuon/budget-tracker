import { Container, Form, Button, Row, ListGroup, Col, InputGroup } from "react-bootstrap";
import { useContext, useEffect, useState } from "react";
import useAxios from "../utils/useAxios"
import AuthContext from "../auth/AuthContext";


function TransactPrefs({purcCategories, setPurcCategories}) {
    const {user} = useContext(AuthContext);
    //const [purcCategories, setPurcCategories] = useState([]);
    const [taxCategories, setTaxCategories] = useState([]);
    const api = useAxios();
    
    useEffect(() => {
        getPurcCategories();
        getTaxCategories();
    }, [])

    // GET Functions
    function getPurcCategories() {
        api.get('/purchasecategory/')
        .then(res => {
            //console.log(res.data)
            setPurcCategories(res.data);
        }).catch(err => {
            console.log(err);
        });
    }

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
            //console.log(res.data);
            setTaxCategories([...taxCategories, res.data]);
            form.reset();
        }).catch(err => {
            console.log(err)
        });
    }
    
    // DELETE functions
    const onPurcCtgyDelete = (event) => {
        event.preventDefault()
        const form = event.currentTarget;
        const url = `/purchasecategory/${form[0].value}/`
        api.delete(url, {
            data: { purc_category_id: form[0].value }
        }).then(() => {
            setPurcCategories(purcCategories.filter(ctgy => ctgy.purc_category_id.toString() !== form[0].value));
            form.reset();
        });
    }

    const onTaxCtgyDelete = (event) => {
        event.preventDefault()
        const form = event.currentTarget;
        const url = `/taxcategory/${form[0].value}/`
        api.delete(url, {
            data: { tax_id: form[0].value }
        }).then(() => {
            setTaxCategories(taxCategories.filter(tax => tax.tax_id.toString() !== form[0].value));
            form.reset();
        });
    }

    
    return ( 
    <Container>
        <Row className="my-4">
            <h3>Purchase Categories</h3>
            <Col>
                <Form onSubmit={onPurcCtgyPrefAdd}>
                    <Form.Group className="mb-3">
                        <Form.Label>Add purchase category</Form.Label>
                        <Form.Control type="text" placeholder="Enter a purchase category" />
                        <Form.Text className="text-muted">
                        Add categories to sort your purchases and budget limits
                        </Form.Text>
                    </Form.Group>
                    <Button variant="dark" type="submit">
                        Add category
                    </Button>
                </Form>
            </Col>
            <Col>
                <Form onSubmit={onPurcCtgyDelete}>
                    <Form.Group className="mb-3">
                        <Form.Label>Delete purchase category</Form.Label>
                        <Form.Select>
                        {purcCategories.map((ctgy) => (
                                <option key={ctgy.purc_category_id}
                                value={`${ctgy.purc_category_id}`}>{ctgy.purc_category_name}</option>
                            ))}
                        </Form.Select>
                        <Button variant="dark" type="submit">
                            Delete purchase category
                        </Button>
                    </Form.Group>
                </Form>
            </Col>
        </Row>
        <Row className="my-4">
            <h3>Tax Categories</h3>
            <Col>
                <Form onSubmit={onTaxCtgyPrefAdd}>
                    <Form.Group className="mb-3">
                        <Form.Label>Tax Category Name</Form.Label>
                        <Form.Control type="text" placeholder="Enter a tax category" />
                        <Form.Text className="text-muted">
                        Add taxes to keep track within your purchases
                        </Form.Text>
                    </Form.Group>
                    <Form.Group className="mb-3">
                    <InputGroup>
                        <Form.Control type="text" onKeyPress={(e) => !/^\d*(\.\d{0,2})?$/.test(e.key) && e.preventDefault()} placeholder="Tax rate" />
                        <InputGroup.Text id="inputGroupPrepend">%</InputGroup.Text>
                    </InputGroup>  
                    </Form.Group>
                    <Button variant="dark" type="submit">
                        Add tax category
                    </Button>
                </Form>
            </Col>
            <Col>
                <Form onSubmit={onTaxCtgyDelete}>
                    <Form.Group className="mb-3">
                        <Form.Label>Delete tax category</Form.Label>
                        <Form.Select>
                        {taxCategories.map((tax) => (
                                <option key={tax.tax_id}
                                value={`${tax.tax_id}`}>{tax.tax_name}</option>
                            ))}
                        </Form.Select>
                        <Button variant="dark" type="submit">
                            Delete tax category
                        </Button>
                    </Form.Group>
                </Form>
            </Col>
        </Row>
    </Container> );
}

export default TransactPrefs;