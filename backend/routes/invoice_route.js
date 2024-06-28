const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const InvoiceModel = mongoose.model("InvoiceModel");

router.post('/generate/invoice', async (req, res) => {
    const { sellerDetails, billingDetails, shippingDetails, orderDetails, invoiceDetails, itemDetails } = req.body;
    const invoice = new InvoiceModel({ sellerDetails, billingDetails, shippingDetails, orderDetails, invoiceDetails, itemDetails })
    invoice.save()
        .then((newInvoice) => {
            res.status(201).json({ Invoice: newInvoice });
        })
        .catch((error) => {
            console.log(error);
            return res.status(500).json({ error: "Internal Server Error" });
        })
});

router.get("/invoice/details", (req, res) => {
    InvoiceModel.find()
        .populate()
        .then((invoice) => {
            if (invoice.length === 0) {
                const invoiceDetails = {
                    "sellerDetails": {
                        "name": "",
                        "address": "",
                        "panNo": "",
                        "gstNo": "",
                        "place": ""
                    },
                    "billingDetails": {
                        "name": "",
                        "address": "",
                        "utCode": ""
                    },
                    "shippingDetails": {
                        "name": "",
                        "address": "",
                        "utCode": "",
                        "place": ""
                    },
                    "orderDetails": {
                        "number": "",
                        "date": ""
                    },
                    "invoiceDetails": {
                        "number": "",
                        "details": "",
                        "date": "",
                        "reverseCharge": ""
                    },
                    "itemDetails": [
                        {
                            "description": "",
                            "price": 0,
                            "quantity": 0,
                            "discount": 0,
                            "netAmount": 0,
                            "taxRate": 0,
                            "taxType": 0,
                            "taxAmount": 0,
                            "totalAmount": 0
                        }
                    ]
                }
                res.status(200).json({ Invoice: invoiceDetails })
            }
            else {
                res.status(200).json({ Invoice: invoice[0] })
            }
        })
        .catch((error) => {
            console.log(error);
        })
});

router.put("/add/item/:id", async (req, res) => {
    const { itemDetails } = req.body;
    try {
        const item = await InvoiceModel.findByIdAndUpdate(
            req.params.id,
            { $push: { itemDetails: itemDetails } },
            { new: true }
        );
        res.status(200).json({ message: "Item added!!" });
    } catch (error) {
        console.error("Error in follow operation:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.delete("/clear/invoice", async (req,res)=> {
    try {
        await InvoiceModel.deleteMany({});
        res.status(200).json({Message: "Fields cleared!!"});
    }catch (error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"})
    }
});

module.exports = router;