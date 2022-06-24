import { useEffect, useState } from "react";
import { Container, Row, Tab, Tabs } from "react-bootstrap";
import TransactForm from "./TransactForm";
import useAxios from "../utils/useAxios";

function Transact() {
    const [purcCategories, setPurcCategories] = useState([]);
    const [taxCategories, setTaxCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [budgets, setBudgets] = useState([]);
    // tab layout (summary, add, view all)
    const api = useAxios();
    useEffect(() => {
        api.get('/purchasecategory/')
        .then(res => {
            //console.log(res.data)
            setPurcCategories(res.data)
        }).catch(err => {
            console.log(err)
        });
        api.get('/taxcategory/')
        .then(res => {
            //console.log(res.data)
            setTaxCategories(res.data)
        }).catch(err => {
            console.log(err)
        });
        api.get('/transactions/')
        .then(res => {
            //console.log(res.data)
            setTransactions(res.data)
        }).catch(err => {
            console.log(err)
        });
        api.get('/budget/')
        .then(res => {
            //console.log(res.data)
            setBudgets(res.data)
        }).catch(err => {
            console.log(err)
        });
    }, [])

    return ( <Container>
    
        <Row>
        <Tabs className="my-3">
            <Tab eventKey="transactHome" title="Summary">
                <h3>Summary</h3>
            </Tab>
            <Tab eventKey="transactList" title="View">
                <Row>
                <h3>Add transaction</h3>
                    <TransactForm budgets={budgets} purcCategories={purcCategories} taxCategories={taxCategories}/>
                </Row>
                <Row>
                    <h3>Transactions</h3>
                    {Object.keys(transactions).length !== 0 ? transactions.map((transact) => (
                                        <p key={transact.transact_id}
                                        value={`${transact.transact_id}`}>{transact.name}</p>
                                    )) : <h5>No transactions found</h5> 
                                }
                </Row>
            </Tab>
        </Tabs>
        </Row>
        
    </Container> );
}


export default Transact;