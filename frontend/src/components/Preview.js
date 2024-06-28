import './Preview.css';
import { Fragment, useState, useRef } from "react";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import logo from '../images/logo.png';
import { toast } from 'react-toastify';
import { ToWords } from 'to-words';
import { useReactToPrint } from 'react-to-print';

const toWords = new ToWords({
    localeCode: 'en-IN',
    converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: { // can be used to override defaults for the selected locale
            name: 'Rupee',
            plural: 'Rupees',
            symbol: '₹',
            fractionalUnit: {
                name: 'Paisa',
                plural: 'Paise',
                symbol: '',
            },
        }
    }
});

const Preview = (props) => {

    let grandTotal = 0;
    let amountInWords = "";

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => {
        if (props.id === undefined) {
            toast.warn("Please generate invoice once to view it..");
        }else if(props.signature === null){
            toast.warn("Please upload a digital signature..");
        }else{
            setShow(true);
        }
    }

    const componentRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    if (props.item.length === 0) {
        return <p>Loading...</p>;
    }

    return (
        <Fragment>
            <button type="submit" className="btn btn-dark" onClick={handleShow}>Preview Invoice</button>

            <Modal show={show} onHide={handleClose} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Print preview</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                <div className='row ps-4' ref={componentRef}>
                    <div className="row mb-5">
                        <div className="col-6">
                            <img src={logo} alt="Company Logo" className="img-fluid w-50"></img>
                        </div>
                        <div className="col-6 mt-4 d-flex flex-column align-items-end">
                            <h5>Tax Invoice/Bill of Supply/Cash Memo</h5>
                            <p>(Original for Recipient)</p>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <h5>Sold By:</h5>
                            <div>{props.sellerDetails.name}</div>
                            <div>{props.sellerDetails.address}</div>
                        </div>
                        <div className="col-6 d-flex flex-column align-items-end">
                            <h5 className='text-end'>Billing Address:</h5>
                            <div className='text-end'>{props.billingDetails.name}</div>
                            <div className='text-end'>{props.billingDetails.address}</div>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col-6">
                            <div><span className="fw-semibold fs-5">PAN No: </span>{props.sellerDetails.panNo}</div>
                            <div><span className="fw-semibold fs-5">GST Registration No: </span>{props.sellerDetails.gstNo}</div>
                        </div>
                        <div className="col-6 d-flex flex-column align-items-end">
                            <h5 className='text-end'>Shipping Address:</h5>
                            <div className='text-end'>{props.shippingDetails.name}</div>
                            <div className='text-end'>{props.shippingDetails.address}</div>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col-12 d-flex flex-column align-items-end">
                            <div><span className="fw-semibold fs-5">Place of supply: </span>{props.sellerDetails.place}</div>
                            <div><span className="fw-semibold fs-5">Place of delivery: </span>{props.shippingDetails.place}</div>
                        </div>
                    </div>
                    <div className="row mt-4">
                        <div className="col-6 d-flex flex-column">
                            <div><span className="fw-semibold fs-5">Order Number: </span>{props.orderDetails.number}</div>
                            <div><span className="fw-semibold fs-5">Order Date: </span>{props.orderDetails.date}</div>
                        </div>
                        <div className="col-6 d-flex flex-column align-items-end">
                            <div><span className="fw-semibold fs-5">Invoice Number: </span>{props.invoiceDetails.number}</div>
                            <div><span className="fw-semibold fs-5">Invoice Details: </span>{props.invoiceDetails.details}</div>
                            <div><span className="fw-semibold fs-5">Invoice Date: </span>{props.invoiceDetails.date}</div>
                        </div>
                    </div>
                    <div className="row mt-5">
                        <div className="col-12">
                            <table className="invoice-table">
                                <thead>
                                    <tr className="table-secondary">
                                        <th>Sl. No</th>
                                        <th>Description</th>
                                        <th>Unit Price</th>
                                        <th>Qty</th>
                                        <th>Net Amount</th>
                                        <th>Tax Rate</th>
                                        <th>Tax Type</th>
                                        <th>Tax Amount</th>
                                        <th>Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {props.item.map((item, index) => {
                                        grandTotal += Number((Number(item.totalAmount) === 0 ? 0 : (Number(item.totalAmount) + 32.50).toFixed(2)));
                                        amountInWords = toWords.convert(grandTotal);
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td className="description">{item.description}<br />Shipping Charges</td>
                                                <td>₹{item.price}<br />₹30.96</td>
                                                <td>{item.quantity}</td>
                                                <td>₹{item.netAmount}<br />₹30.96</td>
                                                {
                                                    item.taxType === 2 ?
                                                        <>
                                                            <td>{item.taxRate}%<br />{item.taxRate}%<br />{item.taxRate}%<br />{item.taxRate}%</td>
                                                            <td>CGST<br />SGST<br />CGST<br />SGST</td>
                                                            <td>₹{item.taxAmount}<br />₹0.77<br />₹{item.taxAmount}<br />₹0.77</td>
                                                        </>
                                                        :
                                                        <>
                                                            <td>{item.taxRate}%<br />{item.taxRate}%</td>
                                                            <td>IGST<br />IGST</td>
                                                            <td>₹{item.taxAmount}<br />₹0.77</td>
                                                        </>

                                                }
                                                <td>{item.totalAmount}<br />₹32.50</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="total-row">
                                        <td colspan="8" className="text-right total-amount">TOTAL:</td>
                                        <td>{grandTotal}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="9" className="text-right fw-semibold"><span className="fw-bold fs-6">Amount in Words: </span>{amountInWords}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="9" className="text-end fw-bold fs-6">For {props.sellerDetails.name}<br /><img src={props.signature} className='img-fluid custom-img' /><br />Authorised Signature</td>
                                    </tr>
                                </tfoot>
                            </table>
                            <div className='reverseCharge fw-semibold'>Whether tax is payable under reverse charge - {props.invoiceDetails.reverseCharge}</div>
                        </div>
                    </div>
                    <div className='row custom-footer mt-5'>
                        <div className='text-center mb-2'>ASSPL-Amazon Seller Services Pvt. Ltd., ARIPL-Amazon Retail India Pvt. Ltd. (only where Amazon Retail India Pvt. Ltd. fulfillment center is co-located)</div>
                        <div className='text-center'>Please note that this invoice is not a demand for payment</div>
                    </div>
                </div>
                </Modal.Body>
                <Modal.Footer>
                    <div className='me-5'>Decrease the scale under more settings to fit it in one page while printing...</div>
                    <Button variant="secondary" onClick={handleClose}>Close</Button>
                    <Button variant="warning" onClick={handlePrint}>Print</Button>
                </Modal.Footer>
            </Modal>
        </Fragment>
    );
}
export default Preview;