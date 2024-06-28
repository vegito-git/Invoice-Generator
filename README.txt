Hello, I have used mern stack for the assignment.
I have deleted the node_modules folder from both backend and frontend.
Please use npm install.

I have created 4 API's.
One to create a invoice, one to get the invoice details, one to update the items(to add items in the existing invoice) 
and last one to delete the invoice(clear the moddel).

I have also added the deleteMany() to clear the maodel in the collection at startup.

Also I have added requied validations such as cheching if a invoice is created before adding an item,
 if a invoice is created before previewing it, checking if all fields are filled before creating an invoice an so on...