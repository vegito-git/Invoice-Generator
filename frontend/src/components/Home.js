import { Fragment, useState, useEffect } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import Preview from "./Preview";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Home = () => {

    const [id, setId] = useState();
    const [item, setItem] = useState([]);

    const [sellerDetails, setSellerDetails] = useState({
        name: "",
        address: "",
        panNo: "",
        gstNo: "",
        place: ""
    });
    const [billingDetails, setBillingDetails] = useState({
        name: "",
        address: "",
        utCode: ""
    });
    const [shippingDetails, setShippingDetails] = useState({
        name: "",
        address: "",
        utCode: "",
        place: ""
    });
    const [orderDetails, setOrderDetails] = useState({
        number: "",
        date: ""
    });
    const [invoiceDetails, setInvoiceDetails] = useState({
        number: "",
        details: "",
        date: "",
        reverseCharge: ""
    });
    const [itemDetails, setItemDetails] = useState({
        description: "",
        price: 0,
        quantity: 0,
        discount: 0,
        netAmount: 0,
        taxRate: 0,
        taxType: 0,
        taxAmount: 0,
        totalAmount: 0
    });

    const [signature, setSignature] = useState(null);

    const handleSeller = (e) => {
        const { name, value } = e.target;
        setSellerDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const handleBilling = (e) => {
        const { name, value } = e.target;
        setBillingDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const handleShipping = (e) => {
        const { name, value } = e.target;
        setShippingDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const handleOrder = (e) => {
        const { name, value } = e.target;
        setOrderDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const handleInvoice = (e) => {
        const { name, value } = e.target;
        setInvoiceDetails(prevDetails => ({
            ...prevDetails,
            [name]: value
        }));
    };

    const handleItem = (e) => {
        const { name, value } = e.target;
        const numericFields = ['price', 'quantity', 'discount'];
        setItemDetails(prevDetails => ({
            ...prevDetails,
            [name]: numericFields.includes(name) ? parseFloat(value) : value
        }));
    };

    const calculateItem = () => {
        let calculatedNetAmount = Number(itemDetails.price) * Number(itemDetails.quantity) - Number(itemDetails.discount) * Number(itemDetails.quantity);
        let description = itemDetails.description;
        let price = Number(itemDetails.price);
        let quantity = Number(itemDetails.quantity);
        let discount = Number(itemDetails.discount);
        let netAmount = calculatedNetAmount;
        let taxRate = shippingDetails.place === sellerDetails.place ? 9 : 18;
        let taxType = shippingDetails.place === sellerDetails.place ? 2 : 1;
        let taxAmount = (calculatedNetAmount * (shippingDetails.place === sellerDetails.place ? 0.9 : 0.18));
        let totalAmount = calculatedNetAmount + (calculatedNetAmount * (shippingDetails.place === sellerDetails.place ? 0.18 : 0.18));
        setItemDetails(prevDetails => ({
            ...prevDetails,
            netAmount: calculatedNetAmount,
            taxRate: taxRate,
            taxType: taxType,
            taxAmount: taxAmount,
            totalAmount: totalAmount
        }));
        const newItem = {
            description: itemDetails.description,
            price: Number(itemDetails.price),
            quantity: Number(itemDetails.quantity),
            discount: Number(itemDetails.discount),
            netAmount: calculatedNetAmount,
            taxRate: taxRate,
            taxType: taxType,
            taxAmount: taxAmount,
            totalAmount: totalAmount
        };
        return { itemDetails: newItem };
    }

    const convertDate = (oldDate) => {
        const date = new Date(oldDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        return (formattedDate)
    }

    const addItem = async (event3) => {
        event3.preventDefault();
        if (id === undefined) {
            toast.warn("Please generate invoice once to add items..");
        } else {
            try {
                const request = calculateItem();
                const response = await axios.put(`${API_BASE_URL}/add/item/${id}`, request);
                if (response.status === 200) {
                    toast.success('Item Added');
                    getInvoiceDetails();
                } else {
                    throw new Error('Unexpected response from server');
                }
            } catch (error) {
                console.log(error)
                toast.error(error.response.data.error);
            }
        }
    };

    const getInvoiceDetails = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/invoice/details`);
            if (response.status === 200) {
                const details = response.data.Invoice;
                setSellerDetails(details.sellerDetails);
                setBillingDetails(details.billingDetails);
                setShippingDetails(details.shippingDetails);
                setOrderDetails(details.orderDetails);
                setInvoiceDetails(details.invoiceDetails);
                const orderDate = convertDate(details.orderDetails.date)
                setOrderDetails(prevDetails => ({ ...prevDetails, date: orderDate }));
                const invoiceDate = convertDate(details.invoiceDetails.date)
                setInvoiceDetails(prevDetails => ({ ...prevDetails, date: invoiceDate }));
                setItem(details.itemDetails);
                setId(details._id);
            }
        } catch (error) {
            console.error("Error fetching invoice details:", error);
            toast.error(error.response.data.error);
        }
    };

    const generateNewInvoice = async (event2) => {
        event2.preventDefault();
        try {
            const response = await axios.delete(`${API_BASE_URL}/clear/invoice`);
            if (response.status == 200) {
                setItemDetails(prevDetails => ({
                    ...prevDetails,
                    description: "",
                    price: 0,
                    quantity: 0,
                    discount: 0
                }));
                toast.success(response.data.Message);
                getInvoiceDetails();
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.error);
        }
    }

    const generateInvoice = async (event) => {
        event.preventDefault();
        if (itemDetails.price <= 0) {
            toast.warn("Price cannot be <= 0");
        } else if (itemDetails.quantity <= 0) {
            toast.warn("Quantity cannot be <= 0");
        }else if (id != undefined) {
            toast.info("Invoice already generated!!");
        } else {
            try {
                const newItemData = calculateItem();
                const otherData = { sellerDetails, billingDetails, shippingDetails, orderDetails, invoiceDetails };
                const requestData = { ...otherData, ...newItemData };
                const response = await axios.post(`${API_BASE_URL}/generate/invoice`, requestData);
                if (response.status === 201) {
                    toast.success("Invoice generated!!");
                    getInvoiceDetails();
                }
            } catch (error) {
                console.log(error);
                toast.error(error.response.data.error);
            }
        }
    }

    useEffect(() => {
        getInvoiceDetails();
    }, []);

    useEffect(() => {
    }, [item]);

    return (
        <Fragment>
            <div className="container border py-4 my-2">
                <h1 className="text-center">Invoice / Bill</h1>
                <form onSubmit={(e) => generateInvoice(e)}>
                    <div className="row">
                        <div className="col-12 mt-3">
                            <h4>Seller Details</h4>
                            <div className="mb-3">
                                <label for="sellerName" className="form-label">Name</label>
                                <input type="text" className="form-control" id="sellerName" value={sellerDetails.name} name="name" onChange={handleSeller} required />
                            </div>
                            <div className="mb-3">
                                <label for="inputSellerAddress" className="form-label">Address</label>
                                <input type="text" className="form-control" id="inputSellerAddress" value={sellerDetails.address} name="address" onChange={handleSeller} required />
                            </div>
                            <div className="mb-3">
                                <label for="inputSellerPlace" className="form-label">Place</label>
                                <input type="text" className="form-control" id="inputSellerPlace" value={sellerDetails.place} name="place" onChange={handleSeller} required />
                            </div>
                            <div className="mb-3">
                                <label for="panNumber" className="form-label">PAN No.</label>
                                <input type="text" className="form-control" id="panNumber" value={sellerDetails.panNo} name="panNo" onChange={handleSeller} required />
                            </div>
                            <div className="mb-3">
                                <label for="gstNumber" className="form-label">GST No.</label>
                                <input type="text" className="form-control" id="gstNumber" value={sellerDetails.gstNo} name="gstNo" onChange={handleSeller} required />
                            </div>
                        </div>
                        <div className="col-12 mt-3">
                            <h4>Billing Details</h4>
                            <div className="mb-3">
                                <label for="sellerName" className="form-label">Name</label>
                                <input type="text" className="form-control" id="sellerName" value={billingDetails.name} name="name" onChange={handleBilling} required />
                            </div>
                            <div className="mb-3">
                                <label for="inputBillingAddress" className="form-label">Address</label>
                                <input type="text" className="form-control" id="inputBillingAddress" value={billingDetails.address} name="address" onChange={handleBilling} required />
                            </div>
                            <div className="mb-3">
                                <label for="inputBillingUtCode" className="form-label">UT Code</label>
                                <input type="text" className="form-control" id="inputBillingUtCode" value={billingDetails.utCode} name="utCode" onChange={handleBilling} required />
                            </div>
                        </div>
                        <div className="col-12 mt-3">
                            <h4>Shipping Details</h4>
                            <div className="mb-3">
                                <label for="shippingName" className="form-label">Name</label>
                                <input type="text" className="form-control" id="shippingName" value={shippingDetails.name} name="name" onChange={handleShipping} required />
                            </div>
                            <div className="mb-3">
                                <label for="inputShippingAddress" className="form-label">Address</label>
                                <input type="text" className="form-control" id="inputShippingAddress" value={shippingDetails.address} name="address" onChange={handleShipping} required />
                            </div>
                            <div className="mb-3">
                                <label for="inputShippingUtCode" className="form-label">UT Code</label>
                                <input type="text" className="form-control" id="inputShippingUtCode" value={shippingDetails.utCode} name="utCode" onChange={handleShipping} required />
                            </div>
                            <div className="mb-3">
                                <label for="inputShippingPlace" className="form-label">Place</label>
                                <input type="text" className="form-control" id="inputShippingPlace" value={shippingDetails.place} name="place" onChange={handleShipping} required />
                            </div>
                        </div>
                        <div className="col-12 mt-3">
                            <h4>Order Details</h4>
                            <div className="mb-3">
                                <label for="orderNo" className="form-label">Order No.</label>
                                <input type="text" className="form-control" id="orderNo" value={orderDetails.number} name="number" onChange={handleOrder} required />
                            </div>
                            <div className="mb-3">
                                <label for="orderDate" className="form-label">Order Date</label>
                                <input type="date" className="form-control" id="orderDate" value={orderDetails.date} name="date" onChange={handleOrder} required />
                            </div>
                        </div>
                        <div className="col-12 mt-3">
                            <h4>Invoice Details</h4>
                            <div className="mb-3">
                                <label for="invoiceNo" className="form-label">Invoice No.</label>
                                <input type="text" className="form-control" id="invoiceNo" value={invoiceDetails.number} name="number" onChange={handleInvoice} required />
                            </div>
                            <div className="mb-3">
                                <label for="invoiceDeatils" className="form-label">Invoice Details</label>
                                <input type="text" className="form-control" id="invoiceDeatils" value={invoiceDetails.details} name="details" onChange={handleInvoice} required />
                            </div>
                            <div className="mb-3">
                                <label for="invoiceDate" className="form-label">Invoice Date</label>
                                <input type="date" className="form-control" id="invoiceDate" value={invoiceDetails.date} name="date" onChange={handleInvoice} required />
                            </div>
                            <div className="mb-3">
                                <label for="ReverseCharge" className="form-label">Reverse Charge</label>
                                <select className="form-select" aria-label="Default select" id="ReverseCharge" value={invoiceDetails.reverseCharge} name="reverseCharge" onChange={handleInvoice} required >
                                    <option selected>...</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-12 mt-3">
                            <h4>Upload Signature<span className="fw-normal fs-5"> (select before previewing invoice)</span></h4>
                            <div className="input-group mb-3">
                                <label className="input-group-text" for="digitalSignature">Image file</label>
                                <input type="file" className="form-control" id="digitalSignature" accept=".jpg,.gif,.png" onChange={(ev) => setSignature(URL.createObjectURL(ev.target.files[0]))} />
                            </div>
                        </div>
                        <div className="col-12 mt-3">
                            <h4>Item Details <span className='fw-normal fs-5'>(double check before adding an item)</span></h4>
                            <div className="mb-3">
                                <label for="itemDescription" className="form-label">Item Description</label>
                                <input type="text" className="form-control" id="itemDescription" value={itemDetails.description} name="description" onChange={handleItem} required />
                            </div>
                            <div className="mb-3">
                                <label for="price" className="form-label">Unit Price</label>
                                <input type="number" className="form-control" id="price" value={itemDetails.price} name="price" onChange={handleItem} required />
                            </div>
                            <div className="mb-3">
                                <label for="quantity" className="form-label">Quantity</label>
                                <input type="number" className="form-control" id="quantity" value={itemDetails.quantity} name="quantity" onChange={handleItem} required />
                            </div>
                            <div className="mb-3">
                                <label for="discount" className="form-label">Discount</label>
                                <input type="number" className="form-control" id="discount" value={itemDetails.discount} name="discount" onChange={handleItem} required />
                            </div>
                            <div className="d-grid mb-3">
                                <button type="submit" className="btn btn-dark" onClick={(e) => addItem(e)}>Add item</button>
                            </div>
                        </div>
                        <div className='col-12'>
                            <div className="d-grid mb-3">
                                <button type="submit" className="btn btn-dark">Generate Invoice</button>
                            </div>
                        </div>
                    </div>
                </form>
                <div className="row">
                    <div className='col-6'>
                        <div className="d-grid mb-3">
                            <Preview id={id} item={item} sellerDetails={sellerDetails} billingDetails={billingDetails} shippingDetails={shippingDetails} orderDetails={orderDetails} invoiceDetails={invoiceDetails} signature={signature} />
                        </div>
                    </div>
                    <div className='col-6'>
                        <div className="d-grid mb-3">
                            <button type="submit" className="btn btn-dark" onClick={(e) => generateNewInvoice(e)}>Generate New Invoice</button>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
export default Home;