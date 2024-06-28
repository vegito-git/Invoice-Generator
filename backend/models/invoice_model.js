const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    sellerDetails: {
        name: {type: String, required: true},
        address: {type: String, required: true},
        panNo: {type: String, required: true},
        gstNo: {type: String, required: true},
        place: {type: String, required: true}
    },
    billingDetails: {
        name: {type: String, required: true},
        address: {type: String, required: true},
        utCode: {type: String, required: true}
    },
    shippingDetails: {
        name: {type: String, required: true},
        address: {type: String, required: true},
        utCode: {type: String, required: true},
        place: {type: String, required: true}
    },
    orderDetails: {
        number: {type: String, required: true},
        date: {type: Date, required: true}
    },
    invoiceDetails: {
        number: {type: String, required: true},
        details: {type: String, required: true},
        date: {type: Date, required: true},
        reverseCharge: {type: String, required: true}
    },
    itemDetails: [
        {
            description: {type: String, required: true},
            price: {type: Number, required: true},
            quantity: {type: Number, required: true},
            discount: {type: Number, required: true},
            netAmount: {type: Number},
            taxRate: {type: Number},
            taxType: {type: Number},
            taxAmount: {type: Number},
            totalAmount: {type: Number}
        }
    ]
});

mongoose.model("InvoiceModel", invoiceSchema);