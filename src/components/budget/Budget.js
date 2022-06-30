import { useContext, useEffect, useState, useRef } from "react";
import { Container, Row, Form, Card, Button, Col } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";
import useAxios from "../utils/useAxios";
import DatePicker from "react-datepicker";
import BudgetForm from "./BudgetForm";


function Budget() {
    const [budgets, setBudgets] = useState([]);
    const [purcCategories, setPurcCategories] = useState([]);
    const [spendLimits, setSpendLimits] = useState({});
    const api = useAxios();

    useEffect(() => {

        const fetchData = async () => {
            try{
                let budgetRes = await api.get('/budget/');
                setBudgets(budgetRes.data);
                let purcCategoryRes = await api.get('/purchasecategory/');
                setPurcCategories(purcCategoryRes.data);
                fetchSpendLimits(budgetRes.data, purcCategoryRes.data).then(spendLimitsRes => {
                    let spendLimitsData = {}
                    spendLimitsRes.forEach((res)=> {
                        let limits = res.data; // however limits have size one
                        if (limits.length > 0) {
                            if (spendLimitsData[limits[0].budget] === undefined) {
                                spendLimitsData[limits[0].budget] = limits;
                            } else {
                                spendLimitsData[limits[0].budget].push(limits[0]);
                            }
                        }
                    });
                    setSpendLimits(spendLimitsData);
                });
                
            } catch (err) {
                console.error(err)
            }
        }

        fetchData().catch(console.error);
        
    }, [])
    

    function fetchSpendLimits(budgetList, purcCategoryList) {
        let promises = []
        for (let i = 0; i < budgetList.length; i++) {
            for (let j = 0; j < purcCategoryList.length; j++) {
                let url = `/budgetLimits/?budget=${budgetList[i].budget_id}&purc_category=${purcCategoryList[j].purc_category_id}`;
                promises.push(api.get(url));
            }
        }
        return Promise.all(promises);
    }

    const onBudgetDelete = (id) => {
        const url = `/budget/${id}/`
        api.delete(url, {
            data: {budget_id : id}
        })
        .then(res => {
            let newBudgets = budgets.filter((budget) => budget.budget_id !== id);
            setBudgets(newBudgets);
            //console.log(res);
        }).catch(err => {
            console.log(err);
        });
    }

    const createSpendLimitList = (budget_id) => {
        
        if (Object.keys(spendLimits).length === 0 || spendLimits[budget_id] === undefined || !purcCategories) {
            return <Card.Text>No spend limits found</Card.Text>;
        }
        const limitsList = []
        //console.log(spendLimits)
        spendLimits[budget_id].forEach((limit)=>{
            let purcCtgy = purcCategories.find(ctgy => ctgy.purc_category_id === limit.purc_category);
            if (purcCtgy !== undefined) {
                limitsList.push(
                    <Card.Text key={limit.id}>
                    {purcCtgy.purc_category_name}: 
                    ${(limit.spend_limit/100).toFixed(2)}</Card.Text>
                );
            } else {
                //console.log(limit.purc_category)
                //console.log(purcCategories)
            }
            //console.log(limit)
        });
        
        return limitsList.length > 0 ? limitsList : <Card.Text>No spend limits found</Card.Text>;
    }
   
    return ( 
    <Container>
        <Row>
            <h2>Budget</h2>
            <h3>Current budgets</h3>
            {budgets.map((budget)=>(
                <Card bg='dark' text='white' key={budget.budget_id} >
                    <Card.Body>
                        <Card.Text>{budget.budget_name}</Card.Text>
                        <Card.Text>From: {budget.start_time}</Card.Text>
                        <Card.Text>To: {budget.end_time}</Card.Text>
                        <Card.Text>Spend Limits</Card.Text>
                        {createSpendLimitList(budget.budget_id)}
                        <Card.Text><Button onClick={() => onBudgetDelete(budget.budget_id)}>Delete</Button></Card.Text>
                    </Card.Body>
                </Card>
            ))}
        </Row>
        <Row>
            <h5>Add budget</h5>
            <BudgetForm budgets={budgets} setBudgets={setBudgets} spendLimits={spendLimits} setSpendLimits={setSpendLimits}/>
        </Row>
    </Container> );
}

export default Budget;