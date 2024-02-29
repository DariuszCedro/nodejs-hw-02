import { readFile, writeFile } from 'fs/promises';
import path from "path";
import Joi from 'joi';
const __dirname = import.meta.dirname;
import { nanoid } from 'nanoid';


const contactsPath = path.join(__dirname,"contacts.json");

export const listContacts = async () => {
  try{
    const data = await readFile(contactsPath);
     return JSON.parse(data)
  } catch (err) {console.log("Read contacts error:", err.message);
  return [];}
}

//---------------------------------------------------------
export const getContactById = async (contactId) => {
   try{
    const contacts = await listContacts();
    const contact = contacts.find(contact => contact.id === contactId)
  if(!contact){
    console.log("No contacts with this id.");
  } else {
    return contact;
  }} catch (err){
    console.log("Id error:", err.message);
  }
}

//---------------------------------------------------------
export const removeContact = async (contactId) => {
  try {
    const contacts = await listContacts();
    const contactIndex = contacts.findIndex(contact => contact.id === contactId);
    if(contactIndex === -1){console.log("No contact with this id")}
    else {
      const updatedContacts = contacts.filter(contact=>contact.id!==contactId);
      writeFile(contactsPath, JSON.stringify(updatedContacts, null, 2))
    }} catch (err){console.log("Remove error:", err.message)};
  }
//---------------------------------------------------------
export const addContact = async (body) => {
  const { name, email, phone } = body;
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  });
  const validationResult = schema.validate({ name, email, phone });

  if (validationResult.error) {
    throw new Error(validationResult.error.details[0].message);
  }

  const contacts = await listContacts();
  const newContact = {
    id: nanoid(),
    name,
    email,
    phone,
  };
  contacts.push(newContact);
  writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  return newContact;
}
//---------------------------------------------------------
export const updateContact = async (contactId, body) => {
  
  const contacts = await listContacts();
  const contactToUpdate = contacts.filter(contact => contact.id === contactId);
 
  const {name, email, phone } = body;
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
  });
  const validationResult = schema.validate({ name, email, phone });

  if (validationResult.error) {
    throw new Error(validationResult.error.details[0].message);
  }
  const contactIndex = contacts.findIndex(contact => contact.id === contactId);

    const modifiedContacts = contacts.splice(contactIndex,1,{id:contactId,...body});
    
  writeFile(contactsPath, JSON.stringify(contacts, null, 2));
  
  }



