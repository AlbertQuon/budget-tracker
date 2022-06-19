import { useContext, useEffect, useState } from "react";
import { Container, Row, Form, Card, Button } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";
import useAxios from "../utils/useAxios";
import DatePicker from "react-datepicker";


function BudgetForm() {
    const {user} = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [purcCategories, setPurcCategories] = useState({});
    const [endDate, setEndDate] = useState(new Date());
    const api = useAxios();

    useEffect(() => {
        api.get('/purchasecategory/')
        .then(res => {
            //console.log(res.data)
            setPurcCategories(res.data)
        }).catch(err => {
            console.log(err)
        })
    }, [])

    const handleSubmit = (event) => {
        event.preventDefault();
        const form = event.target;
        
        Array.prototype.forEach.call(form.elements, (element) => {
            console.log(element.value);
          })
        setLoading(true);
        api.post('/budget/', {
            budget_name: form[0].value,
            start_time: Date.now(),
            end_time: form[1].value,
            user_id: user.user_id,
        })
        .then(res=> {
            console.log(res);
        })
        .catch(err => {
            console.log(err)})
    }

    return ( 
            <Card bg='dark' text='white' style={{ width: '18rem' }}>
                <Card.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Enter a name for the budget</Form.Label>
                        <Form.Control type="text" placeholder="Enter a name"></Form.Control>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Select budget end date</Form.Label>
                        <DatePicker selected={endDate} onChange={(date) => setEndDate(date)}></DatePicker>
                    </Form.Group>
                    <Form.Group className="py-3">
                        <Form.Label><strong>Purchase limits</strong></Form.Label>
                        {Object.keys(purcCategories).length !== 0 ? 
                            purcCategories.map((ctgy) => (
                                <Form.Group key={ctgy.purc_category_id}>
                                    <Form.Label 
                                    >{ctgy.purc_category_name}</Form.Label>
                                    <Form.Control type="text" 
                                    onKeyPress={(e) => !/^\d*(\.\d{0,2})?$/.test(e.key) && e.preventDefault()} placeholder="Spend limit"/>
                                </Form.Group>
                                )) : <p><em>No purchase categories set</em></p>
                        }
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                    {loading ? <p>Sending to server...</p> : null}
                </Form>
                </Card.Body>
            </Card>
     );
}

export default BudgetForm;