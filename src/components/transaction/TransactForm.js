import { Container, Form, Card, Button } from "react-bootstrap";

function TransactForm({purcCategories, taxCategories, budgets}) {
    return ( <Card bg='dark' text='white' style={{ width: '18rem' }}>
        
            
                <Card.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Transaction name</Form.Label>
                        <Form.Control type="text" placeholder="Enter a name"></Form.Control>

                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Budget</Form.Label>
                        <Form.Select>
                        {Object.keys(budgets).length !== 0 ? 
                            purcCategories.map((budget) => (
                                <option key={budget.budget_id} value={budget.budget_id}>
                                </option>
                                )) : <p><em>No budgets found</em></p>
                        }
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Purchases</Form.Label>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Tax</Form.Label>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                    </Form>
                </Card.Body>
            </Card>
    );
}

export default TransactForm;