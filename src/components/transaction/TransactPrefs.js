import { Container, Form, Button, Row, ListGroup } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";


function TransactPrefs() {
    
    const [currCtgyPrefs, setcurrCtgyPrefs] = useState({});
    
    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/purchasecategory/')
        .then(res => {
            //console.log(res.data)
            setcurrCtgyPrefs(res.data)
        }).catch(err => {
            console.log(err)
        })
    }, [])

    const onCtgyPrefAdd = (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        axios.post('http://127.0.0.1:8000/api/purchasecategory/', {
            category:  form[0].value
        }).then(res => {
            console.log(res.data)
        }).catch(err => {
            console.log(err)
        })
    }

    const onCtgyDelete = (event) => {
        event.preventDefault()
        const form = event.currentTarget
        console.log(form[0].value)
    }

    console.log(currCtgyPrefs)
    /*{currCtgyPrefs ? currCtgyPrefs.map((ctgy) => (
                        <option value={`${ctgy.id}`}>{ctgy.category}</option>
                    )) : null  
                }*/
    return ( 
    <Container>
        <Row>
        <Form onSubmit={onCtgyPrefAdd}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
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
        </Row>
        <Row>
        <Form onSubmit={onCtgyDelete}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Delete purchase category</Form.Label>
                <Form.Select>
                
            </Form.Select>
            <Button variant="dark" type="submit">
                Delete category
            </Button>
            </Form.Group>
        </Form>
        </Row>
    </Container> );
}

export default TransactPrefs;