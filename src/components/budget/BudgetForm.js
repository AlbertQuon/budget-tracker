import { useContext, useEffect, useState } from "react";
import { Container, Row, Form, Card, Button, Spinner, Alert } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";
import useAxios from "../utils/useAxios";
import DatePicker from "react-datepicker";
import dayjs from "dayjs";

function BudgetForm({budgets, setBudgets, spendLimits, setSpendLimits}) {
    const {user} = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [purcCategories, setPurcCategories] = useState([]);
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

        var budgetId = 0;

        api.post('/budget/', {
            budget_name: form[0].value,
            start_time: dayjs(Date.now()).format("YYYY-MM-DD"),
            end_time: dayjs(form[1].value).format("YYYY-MM-DD"),
            user: user.user_id,
        }).then(res=> {
            budgetId = res.data.budget_id;
            //console.log(res.data);
            for (let i = 0; i < purcCategories.length; i++) {
                api.post('/budgetLimits/', {
                    budget: budgetId,
                    purc_category: purcCategories[i].purc_category_id,
                    spend_limit: form[i+2].value*100,
                }).then(res=> {
                    budgetId = res.data.budget_id;
                    //console.log(res.data);
                    setLoading(false);
                }).catch(err => {
                    console.log(err);
                    setLoading(false);
                    setError(err.response.statusText)
                });
            }
            setBudgets([...budgets, {
                budget_name: res.data.budget_name,
                budget_id: res.data.budget_id, 
                start_time: res.data.start_time,
                end_time: res.data.end_time
            }])
            
            form.reset();
        }).catch(err => {
            console.log(err);
            setLoading(false);
            setError(err.response.statusText)
        });
        
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
                        <DatePicker minDate={Date.now()} selected={endDate} onChange={(date) => setEndDate(date)}></DatePicker>
                    </Form.Group>
                    <Form.Group className="py-3">
                        <Form.Label><strong>Purchase limits</strong></Form.Label>
                        {purcCategories.length !== 0 ? 
                            purcCategories.map((ctgy) => (
                                <Form.Group key={ctgy.purc_category_id}>
                                    <Form.Label>{ctgy.purc_category_name}</Form.Label>
                                    <Form.Control type="text" 
                                    onKeyPress={(e) => !/^\d*(\.\d{0,2})?$/.test(e.key) && e.preventDefault()} placeholder="Spend limit"/>
                                </Form.Group>
                                )) : <p><em>No purchase categories set</em></p>
                        }
                    </Form.Group>

                    <Button variant="primary" type="submit">
                    {loading ? <Spinner animation="border" role="status"><span className="visually-hidden">Loading...</span></Spinner> : "Submit"}
                    </Button>
                    
                </Form>
                
                </Card.Body>
                {error.length > 0 ? <Alert variant="danger">{error}</Alert>: null}
            </Card>
     );
}

export default BudgetForm;