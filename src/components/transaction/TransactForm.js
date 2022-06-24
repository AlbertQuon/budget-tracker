import { useState } from "react";
import { Container, Form, Card, Button, Row, Col, FormCheck } from "react-bootstrap";

function TransactForm({purcCategories, taxCategories, budgets}) {

    const [purchaseFields, setPurchaseFields] = useState([]);
    const [subtotal, setSubtotal] = useState(0);

    const addPurchaseField = () => {
        let newField = <Form.Group as={Row} key={purchaseFields.length+1}>
        <Col><Form.Control type="text" placeholder="Enter item name"/></Col>
        <Col><Form.Control type="text" placeholder="Enter price"/></Col>
        <Col><Button onClick={removePurchaseField}>-</Button></Col>
        </Form.Group>
        ;
        setPurchaseFields([...purchaseFields, newField]);
    }

    const removePurchaseField = () => {
        if (purchaseFields.length >= 0) {
            setPurchaseFields(purchaseFields => {
                return purchaseFields.slice(0, purchaseFields.length - 1)
            })
        }
    }


    //console.log(budgets)

    return (
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Transaction name</Form.Label>
                        <Form.Control type="text" placeholder="Enter a name"></Form.Control>

                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Budget</Form.Label>
                        
                        {budgets.length > 0 ?
                            <Form.Select>
                            {budgets.map((budget) => (
                                <option key={budget.budget_id} value={budget.budget_id}>
                                    {budget.budget_name}
                                </option>
                            ))}
                            </Form.Select> : <p><strong>No budgets found</strong></p>
                        }
                        
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="me-2">Purchases</Form.Label>
                        <Button onClick={addPurchaseField}>Add</Button>
                    </Form.Group>
                    {purchaseFields}
                    <Form.Group className="mb-3">
                        <Form.Label className="me-2">Tax</Form.Label>
                        {taxCategories.length !== 0 ? 
                            taxCategories.map((tax) => (
                                <Row key={tax.tax_id}>
                                <Col>
                                    <p>{tax.tax_name} ({tax.tax_rate}%)</p>
                                </Col>
                                <Col>
                                    <FormCheck></FormCheck>
                                </Col>
                                </Row>
                            ))
                        : <p>No tax categories found</p>
                        }
                    </Form.Group>
                    <Row>   
                        <Col>
                        <p>Subtotal:</p>
                        </Col>
                        <Col>
                        <p>${subtotal}</p>
                        </Col>
                    </Row>
                    
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                    </Form>
               
    );
}

export default TransactForm;