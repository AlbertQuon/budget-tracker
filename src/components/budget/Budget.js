import { useContext, useEffect, useState } from "react";
import { Container, Row, Form, Card, Button } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";
import useAxios from "../utils/useAxios";
import DatePicker from "react-datepicker";
import BudgetForm from "./BudgetForm";


function Budget(props) {
    const [budgets, setBudgets] = useState({});
    const [purcCategories, setPurcCategories] = useState({});
    const api = useAxios();

    useEffect(() => {
        api.get('/budget/')
        .then(res => {
            //console.log(res.data)
            setBudgets(res.data)
        }).catch(err => {
            console.log(err)
        });
    }, [])
   
    return ( 
    <Container>
        <Row>
            <h2>Budget</h2>
            <h3>Current budgets</h3>
        </Row>
        <Row>
            <BudgetForm/>
        </Row>
    </Container> );
}

export default Budget;