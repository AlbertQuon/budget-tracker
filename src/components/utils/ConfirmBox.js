import { useState } from "react";
import { Button, Container, Modal } from "react-bootstrap";

function ConfirmBox({promptText, onConfirm, onCancel}) {
    const [showDeleteBox, setShowDeleteBox] = useState(false);
    return ( <Modal backdrop="static" show={showBox} onHide={() => setShowDeleteBox(false)}>
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
}

export default ConfirmBox;