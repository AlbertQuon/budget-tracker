import { useContext, useEffect, useState, useRef } from "react";
import { Container, Row, Form, Card, Button, Col, Badge, Modal, ModalBody, Tab, Tabs } from "react-bootstrap";
import AuthContext from "../auth/AuthContext";
import useAxios from "../utils/useAxios";
import DatePicker from "react-datepicker";
import BudgetForm from "./BudgetForm";
import dayjs from "dayjs";
import TransactPrefs from "./TransactPrefs";
import '../../css/Budget.css'


function Budget() {
    const [budgets, setBudgets] = useState([]);
    const [purcCategories, setPurcCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [spendLimits, setSpendLimits] = useState({});
    const [onlyCurrentBudgets, setOnlyCurrentBudgets] = useState(false);
    const api = useAxios();

    const [showDeleteBox, setShowDeleteBox] = useState(false);
    const [pendingDeletionBudget, setPendingDeletionBudget] = useState(null);

    const [showForm, setShowForm] = useState(false);
    const handleShowForm = () => setShowForm(true);
    const handleCloseForm = () => setShowForm(false);

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
                    }
                );
        }).catch(err => {
            console.log(err)
        });
            } catch (err) {
                console.error(err)
            }
        }

        fetchData().catch(console.error);
        
    }, [])
    
    function fetchPurchases(transactList) {
        let promises = [];
        for (let i = 0; i < transactList.length; i++) {
            let url = `/purchases/?transact=${transactList[i].transact_id}`;
            promises.push(api.get(url));
        }
        return Promise.all(promises);
    }

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
        .then(() => {
            let newBudgets = budgets.filter((budget) => budget.budget_id !== id);
            setBudgets(newBudgets);
            setShowDeleteBox(false);
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
                let purcCtgyTotal = 0;
                
                for (let transact in purchases) {
                    if (purchases.hasOwnProperty(transact)) {
                        let purcCtgyPurchases = purchases[transact].filter(purc => purc.purc_category && purc.purc_category === limit.purc_category);
                        //console.log(purcCtgyPurchases);
                        purcCtgyPurchases.forEach((purc)=> purcCtgyTotal += parseFloat((purc.price/100).toFixed(2)));
                    }
                }
                limitsList.push(
                    <Card.Text key={limit.id}>
                    {purcCtgy.purc_category_name}: 
                    ${purcCtgyTotal}/{(limit.spend_limit/100).toFixed(2)} </Card.Text>
                );
            } else {
                //console.log(limit.purc_category)
                //console.log(purcCategories)
            }
            //console.log(limit)
        });
        
        return limitsList.length > 0 ? limitsList : <Card.Text>No spend limits found</Card.Text>;
    }

    const checkIfBudgetCurrent = (end_time) => {
        let date = dayjs(end_time).toDate();
        if(date > Date.now()) {
            return <Badge bg="info">Active</Badge>
        }
        return null;
    }

    const ConfirmDeleteBox = () => {
        return ( 
        <Modal id="confirmDeleteBox" backdrop="static" show={showDeleteBox} contentClassName="dark-modal-content" onHide={() => setShowDeleteBox(false)}>
            <Modal.Header closeButton>
            <Modal.Title>Confirmation</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>Are you sure you want to delete this budget?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowDeleteBox(false)}>No</Button>
                <Button variant="primary" onClick={() => onBudgetDelete(pendingDeletionBudget)}>Confirm</Button>
            </Modal.Footer>
        </Modal> );
    }    //  <Card.Text><Button onClick={() => {if (window.confirm('Are you sure you wish to delete this budget?')) onBudgetDelete(budget.budget_id)}}>Delete</Button></Card.Text>
   
    return ( 
    <Container className="">
        <Tabs>
            <Tab eventKey="budgetView" title="Budgets">
            <Row className="mt-3">
                <Col xs={9} md={10}><h2>Budget</h2></Col>
                <Col xs={3} md={2}><Button onClick={handleShowForm}>Add budget</Button></Col>
            </Row>
            <Modal backdrop="static" show={showForm} onHide={handleCloseForm} dialogClassName="modal-budget" contentClassName="dark-modal-content" >
                    <Modal.Header closeButton>Add budget</Modal.Header>
                    <Modal.Body>
                    <BudgetForm handleCloseForm={handleCloseForm} budgets={budgets} setBudgets={setBudgets} spendLimits={spendLimits} setSpendLimits={setSpendLimits}/>
                    </Modal.Body>    
                    <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseForm}>
                        Close
                    </Button>
                    </Modal.Footer>
            </Modal>
            {ConfirmDeleteBox()}
            <Row className="my-2"><h3>Current budgets</h3></Row>
            <Row>
                {budgets.filter((budget)=> (dayjs(budget.end_time).toDate() > Date.now())).map((budget)=>(
                    <Col xs={3} md={3}>
                    <Card className="text-white bg-dark" key={budget.budget_id} style={{ width: '18rem' }}>
                        <Card.Body>
                            <Card.Title>{budget.budget_name} {checkIfBudgetCurrent(budget.end_time)}</Card.Title>
                            <Card.Subtitle className=""><strong>{budget.start_time}</strong></Card.Subtitle>
                            <Card.Subtitle className="mb-1"><strong>{budget.end_time}</strong> ({dayjs(budget.end_time).diff(dayjs(budget.start_time), 'day')} days)</Card.Subtitle>
                            <Card.Text>Spend Limits</Card.Text>
                            {createSpendLimitList(budget.budget_id)}
                            <Card.Text><Button onClick={() => {setPendingDeletionBudget(budget.budget_id); setShowDeleteBox(true);}}>Delete</Button></Card.Text>
                        </Card.Body>
                    </Card>
                    </Col>
                ))}
            </Row>
            <Row className="my-2"><h3>Past budgets</h3></Row>
            <Row>
            {budgets.filter((budget)=> (dayjs(budget.end_time).toDate() <= Date.now())).map((budget)=>(
                    <Col xs={3} md={3}>
                    <Card className="text-white bg-dark" key={budget.budget_id} style={{ width: '18rem' }}>
                        <Card.Body>
                            <Card.Title>{budget.budget_name} {checkIfBudgetCurrent(budget.end_time)}</Card.Title>
                            <Card.Subtitle className=""><strong>{budget.start_time}</strong> - <strong>{budget.end_time}</strong> ({dayjs(budget.end_time).diff(dayjs(budget.start_time), 'day')} days)</Card.Subtitle>
                            <Card.Text>Spend Limits</Card.Text>
                            {createSpendLimitList(budget.budget_id)}
                            <Card.Text><Button onClick={() => onBudgetDelete(budget.budget_id)}>Delete</Button></Card.Text>
                        </Card.Body>
                    </Card>
                    </Col>
                ))}
            </Row>
            </Tab>
            <Tab eventKey="transactPrefs" title="Categories">
                <TransactPrefs purcCategories={purcCategories} setPurcCategories={setPurcCategories}/>
            </Tab>
        </Tabs>
    </Container> );
}

export default Budget;