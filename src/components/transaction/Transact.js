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

    // tab layout (summary, add, view all)
    const api = useAxios();
    useEffect(() => {
        api.get('/purchasecategory/')
        .then(res => {
            //console.log(res.data)
            setPurcCategories(res.data);
        }).catch(err => {
            console.log(err);
        });
        api.get('/taxcategory/')
        .then(res => {
            //console.log(res.data)
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
            fetchPurchases(transactList).then((purchasesRes)=>{
                let purchasesData = {};
                purchasesRes.forEach((res)=>{
                    let purchase = res.data;
                    if (purchase.length > 0) {
                        if (purchasesData[purchase[0].transact] === undefined) {
                            purchasesData[purchase[0].transact]= purchase;
                        } else {
                            purchasesData[purchase[0].transact].push(purchase[0]);
                        }
                    }
                });
                setPurchases(purchasesData);
            });
        }).catch(err => {
            console.log(err)
        });
        
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

    function fetchPurchases(transactList) {
        let promises = [];
        for (let i = 0; i < transactList.length; i++) {
            let url = `/purchases/?transact=${transactList[i].transact_id}`;
            promises.push(api.get(url));
        }
        return Promise.all(promises);
    }

    const transactTaxList = (transact_id) => {
        return;
    }

    return ( 
    <Container className="">
        <Tabs>
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
                <Modal backdrop="static" show={showForm} onHide={handleCloseForm} contentClassName="transactForm-modal-content" dialogClassName="transactForm-modal-dialog">
                <Modal.Header closeButton>
                    <Modal.Title>Add transaction</Modal.Title>
                </Modal.Header>
                <Modal.Body className="m-3">
                <TransactForm handleCloseForm={handleCloseForm} setTransactions={setTransactions} budgets={budgets} purcCategories={purcCategories} taxCategories={taxCategories} transactions={transactions}/>
                </Modal.Body>
                </Modal>
                <Row>
                    <TransactList budgets={budgets} purcCategories={purcCategories} purchases={purchases} taxCategories={taxCategories} transactions={transactions} transactTaxes={transactTaxes}></TransactList>
                </Row>
            </Tab>
        </Tabs>
    </Container>);
}


export default Transact;