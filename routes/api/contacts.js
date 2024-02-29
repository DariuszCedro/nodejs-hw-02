import express from 'express';
import { listContacts, getContactById, removeContact, addContact, updateContact } from '../../models/contacts.js'

const router = express.Router()

//-------------------------------------------
router.get('/', async (req,res, next) => {
  const contactList = await listContacts();
  res.status(200).json(contactList)
})

//-------------------------------------------
router.get('/:contactId', async (req, res, next) => {
  const id = req.params.contactId;
    const contact = await getContactById(id);
    if(!contact){
      res.status(404).json({"message": "Not found"})
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
  const id = req.params.contactId;
    const contactToDelete = await getContactById(id);
    if(!contactToDelete){
      res.status(404).json({"message": "Not found"})
    }else {
      await removeContact(id);
      res.status(200).json({"message": "contact deleted"})
}})
//-------------------------------------------
router.put('/:contactId', async (req, res, next) => {
  const id = req.params.contactId;
  const contacts = await listContacts();
  const contactToUpdate = contacts.filter(contact => contact.id === id);
  if(contactToUpdate.length === 0) {res.status(404).json({"message": "Not found"});
return}
    try {
    const updatedContacts = await updateContact(id, req.body);
    res.status(200).json(updatedContacts)
  } catch (err) {res.status(400).json({"message": "missing fields"})}
})

//-------------------------------------------
export default router;
