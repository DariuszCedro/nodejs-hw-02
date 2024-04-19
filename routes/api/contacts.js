import express from 'express';
import { listContacts, getContactById, removeContact, addContact, updateContact, updateStatusContact } from '../../models/contacts.js';


const router = express.Router()

//-------------------------------------------
router.get("/", async (req, res, next) => {
	try {
		const contacts = await listContacts();
		res.json(contacts);
	} catch (error) {
		next(error);
	}
});

//-------------------------------------------
router.get('/:contactId', async (req, res, next) => {
  const id = req.params.contactId;
    const contact = await getContactById(id);
    if(!contact){
      return res.status(404).json({"message": "Not found"})
    }
  res.status(200).json(contact)
})

//-------------------------------------------
router.post('/', async (req, res, next) => {
  try {
    const newContact = await addContact(req.body);
    res.status(201).json(newContact)
  }catch (err){res.status(400).json({"message": "missing required name - field"})}})

//-------------------------------------------
router.delete('/:contactId', async (req, res, next) => {
  try {
  const id = req.params.contactId;
    const contactToDelete = await getContactById(id);
    if(!contactToDelete){
      return res.status(404).json({"message": "Not found"})
    }else {
      await removeContact(id);
      return res.status(200).json({"message": "contact deleted"})
}}catch (error) {
  next(error);
}})
//-------------------------------------------
router.put('/:contactId', async (req, res, next) => {
  const id = req.params.contactId;
    try {
    const updatedContacts = await updateContact(id, req.body);
    res.status(200).json(updatedContacts)
  } catch (err) {res.status(400).json({"message": "missing fields"})}
} )
//-------------------------------------------
router.patch("/:contactId/favorite", async (req, res, next) => {
	try {
		const id = req.params.contactId ;
		const favorite = req.body.favorite;

		if (favorite === undefined) {
			res.status(400).json({ message: "missing field favorite" });
			return;
		}

		const updatedContact = await updateStatusContact(id, {
			favorite,
		});

		res.json(updatedContact);
	} catch (error) {
		if (error.message === "missing field favorite") {
			res.status(400).json({ message: error.message });
		} else if (error.message === "Not found") {
			res.status(404).json({ message: error.message });
		} else {
			next(error);
		}
	}
});

//-------------------------------------------
export default router;
