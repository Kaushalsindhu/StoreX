import { Client, Account, Databases, ID, Storage, Query, Permission} from 'appwrite';

const client = new Client();

client
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT) 
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID)

const account = new Account(client);
const database = new Databases(client,import.meta.env.VITE_APPWRITE_DATABASE_ID);
const storage = new Storage(client);
 
export { client, account, database, storage, ID, Query, Permission}; 
