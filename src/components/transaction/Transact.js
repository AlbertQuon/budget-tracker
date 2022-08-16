import { useEffect, useState } from "react";
import { Button, Card, Col, Container, Modal, Row, Tab, Tabs } from "react-bootstrap";
import TransactForm from "./TransactForm";
import useAxios from "../utils/useAxios";
import TransactSummary from "./TransactSummary";
import "../../css/Transact.css"
import TransactList from "./TransactList";

function Transact() {
    const [purcCategories, setPurcCategories] = useState([]);
    const [taxCategories, setTaxCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [purchases, setPurchases] = useState({});
    const [budgets, setBudgets] = useState([]);
    const [transactTaxes, setTransactTaxes] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const handleShowForm = () => setShowForm(true);
    const handleCloseForm = () => setShowForm(false);

    // tab layout (summary, add + view all)
    const api = useAxios();
    const fetchData = () => {
        api.get('/purchasecategory/')
        .then(res => {
            setPurcCategories(res.data);
        }).catch(err => {
            console.log(err);
        });
        api.get('/taxcategory/')
        .then(res => {
            setTaxCategories(res.data);
        }).catch(err => {
            console.log(err);
        });
        api.get('/budget/')
        .then(res => {
            setBudgets(res.data);
        }).catch(err => {
            console.log(err);
        });
        api.get('/transactionTax/')
        .then(res => {
            setTransactTaxes(res.data)
        }).catch(err => {
            console.log(err)
        });
        api.get('/transactions/')
        .then(res => {
            //console.log(res.data)
            let transactList = res.data;
            setTransactions(transactList);
        }).catch(err => {
            console.log(err)
        });
        api.get('/purchases/')
        .then(res => {
            let purchases = res.data;
            let purchasesData = {};
            purchases.forEach(purc => {
                if (!purchasesData.hasOwnProperty(purc.transact)) {
                    purchasesData[purc.transact] = [purc];
                } else {
                    purchasesData[purc.transact].push(purc);
                }
            });
            setPurchases(purchasesData);
        }).catch(err => {console.log(err)})
    }
    useEffect(() => {
        fetchData();
    }, []);

    // API Requests
    const onTransactDelete = (id) => {
        const url = `/transactions/${id}/`
        api.delete(url, {
            data: {transact_id : id}
        })
        .then(() => {
            let newTransacts = transactions.filter((transact) => transact.transact_id !== id);
            setTransactions(newTransacts);
            //console.log(res);
        }).catch(err => {
            console.log(err);
        });
    }

    return ( 
    <Container className="">
        <Tabs className="tab-headers" justify>
            <Tab eventKey="transactHome" title="Summary">
                <Row className="mt-3"><h3>Transaction Summary</h3></Row>
                <TransactSummary budgets={budgets} purchases={purchases} purcCategories={purcCategories} taxCategories={taxCategories} transactions={transactions} transactTaxes={transactTaxes}/>
            </Tab>
            <Tab eventKey="transactList" title="View">
            <Row className="mt-3">
                <Col><h3>Transactions</h3></Col>
                <Col>
                <Button onClick={handleShowForm}>Add transaction</Button>
                </Col>
            </Row>
                <TransactForm api={api} fetchData={fetchData} showForm={showForm} handleCloseForm={handleCloseForm} setTransactions={setTransactions} budgets={budgets} purcCategories={purcCategories} taxCategories={taxCategories} transactions={transactions}/>
                <Row>
                    <TransactList api={api} fetchData={fetchData} budgets={budgets} purcCategories={purcCategories} purchases={purchases} taxCategories={taxCategories} transactions={transactions} transactTaxes={transactTaxes} onTransactDelete={onTransactDelete}></TransactList>
                </Row>
            </Tab>
        </Tabs>
    </Container>);
}


export default Transact;