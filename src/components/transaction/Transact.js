import { useEffect, useState } from "react";
import { Card, Container, Row, Tab, Tabs } from "react-bootstrap";
import TransactForm from "./TransactForm";
import useAxios from "../utils/useAxios";
import TransactSummary from "./TransactSummary";

function Transact() {
    const [purcCategories, setPurcCategories] = useState([]);
    const [taxCategories, setTaxCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [budgets, setBudgets] = useState([]);
    const [transactTaxes, setTransactTaxes] = useState([]);
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
        api.get('/transactionTax/')
        .then(res => {
            setTransactTaxes(res.data)
        }).catch(err => {
            console.log(err)
        });
    }, [])

    return ( <Container>
    
        <Row>
        <Tabs className="my-3">
            <Tab eventKey="transactHome" title="Summary">
                <h3>Summary</h3>
                <TransactSummary budgets={budgets} purcCategories={purcCategories} taxCategories={taxCategories} transactions={transactions} transactTaxes={transactTaxes}/>
            </Tab>
            <Tab eventKey="transactList" title="View">
                <Row>
                <h3>Add transaction</h3>
                    <TransactForm budgets={budgets} purcCategories={purcCategories} taxCategories={taxCategories} transactions={transactions}/>
                </Row>
                <Row>
                    <h3>Transactions</h3>
                    {Object.keys(transactions).length !== 0 ? transactions.map((transact) => (
                                        <Card key={transact.transact_id}>
                                            <p value={`${transact.transact_id}`}>{transact.name}</p>
                                        </Card>
                                    )) : <h5>No transactions found</h5> 
                                }
                </Row>
            </Tab>
        </Tabs>
        </Row>
        
    </Container> );
}


export default Transact;