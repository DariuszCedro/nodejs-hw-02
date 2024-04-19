import { readFile, writeFile } from 'fs/promises';
import path from "path";
import Joi from 'joi';
const __dirname = import.meta.dirname;
import { nanoid } from 'nanoid';
import Contact from '../models/contactsModels.js';

const contactsPath = path.join(__dirname,"contacts.json");

export const listContacts = async () => {
	return Contact.find();
};

//---------------------------------------------------------
export const getContactById = async (contactId) => {
	return Contact.findById(contactId);
};

//---------------------------------------------------------
export const removeContact = async (contactId) => {
	return Contact.findByIdAndDelete(contactId);
};
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
    name,
    email,
    phone,
  };
  return Contact.create(body);
 
}
//---------------------------------------------------------
export const updateContact = async (contactId, body) => {
	return Contact.findByIdAndUpdate(contactId, body, { new: true });
};
//---------------------------------------------------------
export const updateStatusContact = async (contactId, body) => {
	const { favorite } = body;

	if (favorite === undefined) {
		throw new Error("missing field favorite");
	}

	const contact = await Contact.findByIdAndUpdate(
		contactId,
		{ favorite },
		{ new: true }
	);

	if (contact) {
		return contact;
	} else {
		throw new Error("Not found");
	}
};  
  


